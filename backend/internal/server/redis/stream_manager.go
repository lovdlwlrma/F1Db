package redis

import (
	"bufio"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
	"go.uber.org/zap"
)

// StreamManager 管理 HTTP SSE stream 到 Redis
type StreamManager struct {
	rdb    *redis.Client
	logger *zap.Logger

	mu          sync.RWMutex
	streamURL   string
	streamKey   string
	subscribers int
	isRunning   bool

	// 控制 HTTP stream 的 context
	streamCtx    context.Context
	streamCancel context.CancelFunc
}

// NewStreamManager 創建 StreamManager
func NewStreamManager(streamURL, streamKey string, rdb *redis.Client, logger *zap.Logger) *StreamManager {
	return &StreamManager{
		rdb:         rdb,
		logger:      logger,
		streamURL:   streamURL,
		streamKey:   streamKey,
		subscribers: 0,
		isRunning:   false,
	}
}

// AddSubscriber 增加訂閱者,第一個訂閱者會啟動 HTTP stream
func (sm *StreamManager) AddSubscriber() {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	sm.subscribers++
	sm.logger.Info("Subscriber added",
		zap.Int("total_subscribers", sm.subscribers),
		zap.String("stream_key", sm.streamKey))

	// 第一個訂閱者啟動 HTTP stream
	if sm.subscribers == 1 && !sm.isRunning {
		sm.startHTTPStream()
	}
}

// RemoveSubscriber 移除訂閱者,最後一個訂閱者離開會停止 HTTP stream
func (sm *StreamManager) RemoveSubscriber() {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if sm.subscribers > 0 {
		sm.subscribers--
	}

	sm.logger.Info("Subscriber removed",
		zap.Int("remaining_subscribers", sm.subscribers),
		zap.String("stream_key", sm.streamKey))

	// 最後一個訂閱者離開,停止 HTTP stream
	if sm.subscribers == 0 && sm.isRunning {
		sm.stopHTTPStream()
	}
}

// GetSubscriberCount 獲取當前訂閱者數量
func (sm *StreamManager) GetSubscriberCount() int {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	return sm.subscribers
}

// startHTTPStream 啟動 HTTP stream (內部方法,已加鎖)
func (sm *StreamManager) startHTTPStream() {
	sm.streamCtx, sm.streamCancel = context.WithCancel(context.Background())
	sm.isRunning = true

	go sm.runHTTPStream()

	sm.logger.Info("HTTP stream started",
		zap.String("url", sm.streamURL),
		zap.String("stream_key", sm.streamKey))
}

// stopHTTPStream 停止 HTTP stream (內部方法,已加鎖)
func (sm *StreamManager) stopHTTPStream() {
	if sm.streamCancel != nil {
		sm.streamCancel()
		sm.streamCancel = nil
	}
	sm.isRunning = false

	sm.logger.Info("HTTP stream stopped",
		zap.String("stream_key", sm.streamKey))
}

// Close 關閉 StreamManager
func (sm *StreamManager) Close() {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if sm.isRunning {
		sm.stopHTTPStream()
	}
}

// runHTTPStream 運行 HTTP SSE stream (自動重連)
func (sm *StreamManager) runHTTPStream() {
	for {
		// 檢查是否已被停止
		select {
		case <-sm.streamCtx.Done():
			sm.logger.Info("HTTP stream stopped by context")
			return
		default:
		}

		// 連接並處理 stream
		if err := sm.connectAndStream(); err != nil {
			// 如果是 context 取消,直接退出
			if err == context.Canceled {
				return
			}

			sm.logger.Warn("Stream disconnected, reconnecting in 10s",
				zap.Error(err),
				zap.String("stream_key", sm.streamKey))

			// 等待 10 秒後重試
			select {
			case <-time.After(10 * time.Second):
				continue
			case <-sm.streamCtx.Done():
				return
			}
		}
	}
}

// connectAndStream 連接 SSE 並寫入 Redis Stream
func (sm *StreamManager) connectAndStream() error {
	// 建立 HTTP 客戶端
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
		Timeout: 0, // 不設超時,保持長連接
	}

	// 建立請求
	req, err := http.NewRequestWithContext(sm.streamCtx, "GET", sm.streamURL, nil)
	if err != nil {
		return fmt.Errorf("create request failed: %w", err)
	}

	// 發送請求
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	// 檢查狀態碼
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP status %d", resp.StatusCode)
	}

	sm.logger.Info("HTTP stream connected successfully",
		zap.String("url", sm.streamURL))

	// 解析 SSE 資料
	return sm.parseSSEStream(resp)
}

// parseSSEStream 解析 SSE 格式的資料流
func (sm *StreamManager) parseSSEStream(resp *http.Response) error {
	scanner := bufio.NewScanner(resp.Body)
	
	// 設置較大的緩衝區以處理大型訊息
	buf := make([]byte, 256*1024)
	scanner.Buffer(buf, len(buf))

	var currentEvent string
	var currentData strings.Builder
	messageCount := 0

	for scanner.Scan() {
		// 檢查是否被取消
		select {
		case <-sm.streamCtx.Done():
			return context.Canceled
		default:
		}

		line := strings.TrimSpace(scanner.Text())

		// 空行表示一個完整的 SSE 訊息結束
		if line == "" {
			if currentData.Len() > 0 {
				sm.writeToRedisStream(currentEvent, currentData.String())
				messageCount++

				// 每處理 100 條訊息記錄一次
				if messageCount%100 == 0 {
					sm.logger.Debug("Processed messages",
						zap.Int("count", messageCount),
						zap.String("stream_key", sm.streamKey))
				}
			}
			currentEvent = ""
			currentData.Reset()
			continue
		}

		// 解析 event: 字段
		if strings.HasPrefix(line, "event:") {
			currentEvent = strings.TrimSpace(line[6:])
		} else if strings.HasPrefix(line, "data:") {
			// 解析 data: 字段
			if currentData.Len() > 0 {
				currentData.WriteString("\n")
			}
			currentData.WriteString(strings.TrimSpace(line[5:]))
		}
		// 忽略其他字段 (如 id:, retry: 等)
	}

	// 檢查掃描錯誤
	if err := scanner.Err(); err != nil {
		return fmt.Errorf("scanner error: %w", err)
	}

	return nil
}

// writeToRedisStream 將 SSE 資料寫入 Redis Stream
func (sm *StreamManager) writeToRedisStream(event, data string) {
	// 嘗試解析 JSON
	var parsed interface{}
	if err := json.Unmarshal([]byte(data), &parsed); err != nil {
		// 如果不是 JSON,就直接存字串
		parsed = data
	}

	// 轉回 JSON 字串
	jsonBytes, err := json.Marshal(parsed)
	if err != nil {
		sm.logger.Error("Failed to marshal JSON",
			zap.Error(err),
			zap.String("event", event))
		return
	}

	// 準備寫入 Redis 的資料
	payload := map[string]interface{}{
		"event":     event,
		"data":      string(jsonBytes),
		"timestamp": time.Now().UnixMilli(),
	}

	// 寫入 Redis Stream (帶重試)
	sm.pushToRedis(payload)
}

// pushToRedis 寫入 Redis Stream (帶重試機制)
func (sm *StreamManager) pushToRedis(payload map[string]interface{}) {
	maxRetries := 3

	for attempt := 1; attempt <= maxRetries; attempt++ {
		err := sm.rdb.XAdd(sm.streamCtx, &redis.XAddArgs{
			Stream: sm.streamKey,
			MaxLen: 10000, // 保留最近 10000 條
			Approx: true,  // 使用近似修剪,效能更好
			Values: payload,
		}).Err()

		if err == nil {
			return // 成功
		}

		// 如果是 context 取消,直接退出
		if err == context.Canceled {
			return
		}

		sm.logger.Warn("Redis write failed",
			zap.Error(err),
			zap.Int("attempt", attempt),
			zap.Int("max_retries", maxRetries))

		if attempt < maxRetries {
			time.Sleep(time.Duration(attempt) * time.Second)
		}
	}

	sm.logger.Error("Redis write failed after all retries",
		zap.String("event", payload["event"].(string)))
}