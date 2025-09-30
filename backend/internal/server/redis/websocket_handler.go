package redis

import (
	"fmt"
	"context"
	"net/http"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
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
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.logger.Error("WebSocket upgrade failed", zap.Error(err))
		return
	}

	clientID := r.RemoteAddr
	h.logger.Info("WebSocket client connected", zap.String("client", clientID))

	h.streamManager.AddSubscriber()
	defer func() {
		h.streamManager.RemoveSubscriber()
		conn.Close()
		h.logger.Info("WebSocket client disconnected", zap.String("client", clientID))
	}()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var wg sync.WaitGroup

	// Goroutine 1: 讀取 client (心跳 / 檢測斷線)
	wg.Add(1)
	go func() {
		defer wg.Done()
		defer cancel()
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				return
			}
		}
	}()

	// Goroutine 2: 從 Redis Stream 讀取 SSE 資料
	wg.Add(1)
	go func() {
		defer wg.Done()
		h.streamToWebSocket(ctx, conn, clientID)
	}()

	wg.Wait()
}

// streamToWebSocket 從 Redis Stream 讀取 SSE 資料並發送
func (h *WebSocketHandler) streamToWebSocket(ctx context.Context, conn *websocket.Conn, clientID string) {
	lastID := "$"

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		streams, err := h.rdb.XRead(ctx, &redis.XReadArgs{
			Streams: []string{h.streamKey, lastID},
			Count:   10,
			Block:   1000,
		}).Result()

		if err != nil {
			if err == redis.Nil || err == context.Canceled {
				continue
			}
			h.logger.Error("Redis XREAD error", zap.Error(err))
			time.Sleep(time.Second)
			continue
		}

		for _, stream := range streams {
			for _, message := range stream.Messages {
				lastID = message.ID

				eventStr, _ := message.Values["event"].(string)
				dataStr, _ := message.Values["data"].(string)

				if eventStr == "" && dataStr == "" {
					continue
				}

				payload := map[string]string{
					"event": eventStr,
					"data":  dataStr,
					"timestamp": fmt.Sprint(time.Now().UnixMilli()),
				}

				conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
				if err := conn.WriteJSON(payload); err != nil {
					h.logger.Error("WebSocket write error", zap.Error(err), zap.String("client", clientID))
					return
				}
			}
		}
	}
}

// ServeLiveStatus 提供訂閱狀態
func (h *WebSocketHandler) ServeLiveStatus(w http.ResponseWriter, r *http.Request) {
	count := h.streamManager.GetSubscriberCount()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"subscribers":` + string(rune(count+'0')) + `,"stream":"` + h.streamKey + `"}`))
}
