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
// 只在有訂閱者時啟動 HTTP 連線
type StreamManager struct {
	ctx      context.Context
	cancel   context.CancelFunc
	rdb      *redis.Client
	logger   *zap.Logger

	mu        sync.RWMutex
	streamURL string
	streamKey string

	subscribers int
	isRunning   bool
	stopChan    chan struct{}
	stoppedChan chan struct{}
}

// NewStreamManager 創建 StreamManager
func NewStreamManager(streamURL, streamKey string, rdb *redis.Client, logger *zap.Logger) *StreamManager {
	ctx, cancel := context.WithCancel(context.Background())
	return &StreamManager{
		ctx:         ctx,
		cancel:      cancel,
		rdb:         rdb,
		logger:      logger,
		streamURL:   streamURL,
		streamKey:   streamKey,
		subscribers: 0,
		isRunning:   false,
	}
}

// AddSubscriber 增加訂閱者
func (sm *StreamManager) AddSubscriber() {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	sm.subscribers++
	sm.logger.Info("Subscriber added",
		zap.Int("total_subscribers", sm.subscribers),
		zap.String("stream_key", sm.streamKey),
	)

	if sm.subscribers == 1 && !sm.isRunning {
		sm.stopChan = make(chan struct{})
		sm.stoppedChan = make(chan struct{})
		go sm.runHTTPStream()
		sm.isRunning = true
		sm.logger.Info("HTTP stream started", zap.String("url", sm.streamURL))
	}
}

// RemoveSubscriber 移除訂閱者
func (sm *StreamManager) RemoveSubscriber() {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if sm.subscribers > 0 {
		sm.subscribers--
		sm.logger.Info("Subscriber removed",
			zap.Int("remaining_subscribers", sm.subscribers),
			zap.String("stream_key", sm.streamKey),
		)
	}

	if sm.subscribers == 0 && sm.isRunning {
		close(sm.stopChan)
		<-sm.stoppedChan
		sm.isRunning = false
		sm.logger.Info("HTTP stream stopped", zap.String("stream_key", sm.streamKey))
	}
}

// GetSubscriberCount 獲取訂閱者數量
func (sm *StreamManager) GetSubscriberCount() int {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	return sm.subscribers
}

// Close 關閉 StreamManager
func (sm *StreamManager) Close() {
	sm.cancel()
	sm.mu.Lock()
	if sm.isRunning && sm.stopChan != nil {
		close(sm.stopChan)
		sm.isRunning = false
	}
	sm.mu.Unlock()
}

// runHTTPStream 運行 HTTP SSE stream
func (sm *StreamManager) runHTTPStream() {
	defer close(sm.stoppedChan)

	for {
		select {
		case <-sm.stopChan:
			sm.logger.Info("HTTP stream stop signal received")
			return
		case <-sm.ctx.Done():
			sm.logger.Info("Stream manager context cancelled")
			return
		default:
			if err := sm.connectAndStream(); err != nil {
				sm.logger.Debug("Stream error, retrying in 20s", zap.Error(err))
				select {
				case <-time.After(20 * time.Second):
					continue
				case <-sm.stopChan:
					return
				case <-sm.ctx.Done():
					return
				}
			}
		}
	}
}

// connectAndStream 連接 SSE 並寫入 Redis Stream
func (sm *StreamManager) connectAndStream() error {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
		Timeout: 0,
	}

	req, err := http.NewRequestWithContext(sm.ctx, "GET", sm.streamURL, nil)
	if err != nil {
		return err
	}

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP status %d", resp.StatusCode)
	}

	sm.logger.Info("HTTP stream connected", zap.String("url", sm.streamURL))

	scanner := bufio.NewScanner(resp.Body)
	buf := make([]byte, 256*1024)
	scanner.Buffer(buf, len(buf))

	var currentEvent string
	var currentData strings.Builder

	for scanner.Scan() {
		select {
		case <-sm.stopChan:
			return nil
		case <-sm.ctx.Done():
			return sm.ctx.Err()
		default:
		}

		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			// 空行代表 SSE 完整事件
			if currentData.Len() > 0 {
				sm.writeToRedisStream(currentEvent, currentData.String())
			}
			currentEvent = ""
			currentData.Reset()
			continue
		}

		if strings.HasPrefix(line, "event:") {
			currentEvent = strings.TrimSpace(line[len("event:"):])
		} else if strings.HasPrefix(line, "data:") {
			if currentData.Len() > 0 {
				currentData.WriteString("\n")
			}
			currentData.WriteString(strings.TrimSpace(line[len("data:"):]))
		}
	}

	return scanner.Err()
}

// writeToRedisStream 寫入 Redis Stream (保持 JSON 原始結構)
func (sm *StreamManager) writeToRedisStream(event, data string) {
	var raw json.RawMessage
	if err := json.Unmarshal([]byte(data), &raw); err != nil {
		sm.logger.Warn("Failed to parse JSON, storing as string", zap.Error(err))
		raw = json.RawMessage([]byte(fmt.Sprintf(`"%s"`, data)))
	}

	payload := map[string]interface{}{
		"event":     event,
		"data":      raw,
		"timestamp": time.Now().UnixMilli(),
	}

	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		err := sm.rdb.XAdd(sm.ctx, &redis.XAddArgs{
			Stream: sm.streamKey,
			MaxLen: 10000,
			Approx: true,
			Values: payload,
		}).Err()
		if err == nil {
			return
		}
		sm.logger.Warn("Redis write failed, retrying",
			zap.Error(err),
			zap.Int("attempt", i+1))
		time.Sleep(time.Duration(i+1) * time.Second)
	}

	sm.logger.Error("Redis write failed after retries", zap.String("event", event))
}
