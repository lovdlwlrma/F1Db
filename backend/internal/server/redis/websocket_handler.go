package redis

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	CheckOrigin:     func(r *http.Request) bool { return true },
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// WebSocketHandler 處理 WebSocket 連接
type WebSocketHandler struct {
	streamManager *StreamManager
	rdb           *redis.Client
	logger        *zap.Logger
	streamKey     string
}

// NewWebSocketHandler 創建 WebSocket 處理器
func NewWebSocketHandler(streamManager *StreamManager, rdb *redis.Client, logger *zap.Logger, streamKey string) *WebSocketHandler {
	return &WebSocketHandler{
		streamManager: streamManager,
		rdb:           rdb,
		logger:        logger,
		streamKey:     streamKey,
	}
}

// HandleConnection 處理單個 WebSocket 連接
func (h *WebSocketHandler) HandleConnection(w http.ResponseWriter, r *http.Request) {
	// 升級為 WebSocket 連接
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.logger.Error("WebSocket upgrade failed", zap.Error(err))
		return
	}

	clientID := r.RemoteAddr
	h.logger.Info("WebSocket client connected", zap.String("client", clientID))

	// 通知 StreamManager 增加訂閱者 (會啟動 HTTP stream)
	h.streamManager.AddSubscriber()

	// 確保清理
	defer func() {
		h.streamManager.RemoveSubscriber() // 移除訂閱者 (可能停止 HTTP stream)
		conn.Close()
		h.logger.Info("WebSocket client disconnected", zap.String("client", clientID))
	}()

	// 建立 context 控制 goroutines
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 啟動心跳和訊息推送
	errChan := make(chan error, 2)

	// Goroutine 1: 處理客戶端訊息 (檢測斷線)
	go h.handleClientMessages(ctx, conn, clientID, errChan)

	// Goroutine 2: 從 Redis 讀取並推送訊息
	go h.streamToWebSocket(ctx, conn, clientID, errChan)

	// 等待任一 goroutine 出錯或結束
	err = <-errChan
	if err != nil {
		h.logger.Debug("Connection closed", zap.Error(err), zap.String("client", clientID))
	}

	// 取消 context,等待所有 goroutines 退出
	cancel()
}

// handleClientMessages 處理客戶端發來的訊息 (主要用於檢測斷線和心跳)
func (h *WebSocketHandler) handleClientMessages(ctx context.Context, conn *websocket.Conn, clientID string, errChan chan<- error) {
	// 設置讀取超時 (60 秒沒收到訊息就斷線)
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))

	// 設置 pong handler (收到 pong 延長超時)
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// 啟動 ping ticker
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			errChan <- ctx.Err()
			return

		case <-ticker.C:
			// 發送 ping
			conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				errChan <- fmt.Errorf("ping failed: %w", err)
				return
			}

		default:
			// 讀取客戶端訊息 (阻塞)
			_, _, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					errChan <- fmt.Errorf("unexpected close: %w", err)
				} else {
					errChan <- err
				}
				return
			}
			// 收到訊息,延長讀取超時
			conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		}
	}
}

// streamToWebSocket 從 Redis Stream 讀取資料並推送到 WebSocket
func (h *WebSocketHandler) streamToWebSocket(ctx context.Context, conn *websocket.Conn, clientID string, errChan chan<- error) {
	// 使用 "$" 表示只讀取從現在開始的新訊息
	lastID := "$"

	h.logger.Info("Start reading from Redis Stream",
		zap.String("client", clientID),
		zap.String("stream_key", h.streamKey))

	messageCount := 0
	consecutiveErrors := 0
	maxConsecutiveErrors := 5

	for {
		select {
		case <-ctx.Done():
			h.logger.Info("Stream reader stopped",
				zap.String("client", clientID),
				zap.Int("messages_sent", messageCount))
			errChan <- ctx.Err()
			return

		default:
			// 從 Redis Stream 讀取資料
			streams, err := h.rdb.XRead(ctx, &redis.XReadArgs{
				Streams: []string{h.streamKey, lastID},
				Count:   100,  // 一次最多讀 100 條
				Block:   2000, // 阻塞 2 秒
			}).Result()

			// 處理錯誤
			if err != nil {
				if err == redis.Nil {
					// 沒有新資料,正常情況
					consecutiveErrors = 0
					continue
				}
				if err == context.Canceled {
					errChan <- err
					return
				}

				consecutiveErrors++
				h.logger.Warn("Redis XREAD error",
					zap.Error(err),
					zap.String("client", clientID),
					zap.Int("consecutive_errors", consecutiveErrors))

				if consecutiveErrors >= maxConsecutiveErrors {
					errChan <- fmt.Errorf("too many Redis errors: %w", err)
					return
				}

				time.Sleep(time.Second)
				continue
			}

			consecutiveErrors = 0

			// 處理讀取到的訊息
			for _, stream := range streams {
				for _, message := range stream.Messages {
					// 更新 lastID
					lastID = message.ID

					// 發送訊息
					if err := h.sendMessage(ctx, conn, clientID, message); err != nil {
						errChan <- err
						return
					}

					messageCount++
				}
			}
		}
	}
}

// sendMessage 發送單條訊息到 WebSocket
func (h *WebSocketHandler) sendMessage(ctx context.Context, conn *websocket.Conn, clientID string, message redis.XMessage) error {
	// 檢查 context
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}

	// 提取資料
	event, _ := message.Values["event"].(string)
	data, _ := message.Values["data"].(string)
	timestamp, _ := message.Values["timestamp"].(string)

	// 跳過空訊息
	if event == "" && data == "" {
		return nil
	}

	// 準備 payload
	payload := map[string]interface{}{
		"event":      event,
		"data":       data,
		"timestamp":  timestamp,
		"message_id": message.ID,
	}

	// 設置寫入超時
	conn.SetWriteDeadline(time.Now().Add(10 * time.Second))

	// 發送 JSON
	if err := conn.WriteJSON(payload); err != nil {
		return fmt.Errorf("write JSON failed: %w", err)
	}

	// 記錄 debug 日誌 (可選)
	h.logger.Debug("Message sent",
		zap.String("client", clientID),
		zap.String("event", event),
		zap.String("message_id", message.ID))

	return nil
}

// ServeLiveStatus 提供服務狀態 API
func (h *WebSocketHandler) ServeLiveStatus(w http.ResponseWriter, r *http.Request) {
	count := h.streamManager.GetSubscriberCount()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	fmt.Fprintf(w, `{"subscribers":%d,"stream":"%s","status":"running"}`, count, h.streamKey)
}