package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter 結構
type RateLimiter struct {
	sync.Mutex
	requests map[string][]time.Time
	window   time.Duration
	limit    int
}

// NewRateLimiter 創建新的限流器
func NewRateLimiter(window time.Duration, limit int) *RateLimiter {
	return &RateLimiter{
		requests: make(map[string][]time.Time),
		window:   window,
		limit:    limit,
	}
}

// RateLimit middleware
func RateLimit(window time.Duration, limit int) gin.HandlerFunc {
	limiter := NewRateLimiter(window, limit)

	return func(c *gin.Context) {
		ip := c.ClientIP()

		if !limiter.Allow(ip) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests",
			})
			return
		}

		c.Next()
	}
}

// Allow 檢查是否允許請求
func (rl *RateLimiter) Allow(key string) bool {
	rl.Lock()
	defer rl.Unlock()

	now := time.Now()
	windowStart := now.Add(-rl.window)

	// 清理過期的請求記錄
	var requests []time.Time
	if times, exists := rl.requests[key]; exists {
		for _, t := range times {
			if t.After(windowStart) {
				requests = append(requests, t)
			}
		}
	}

	// 檢查是否超過限制
	if len(requests) >= rl.limit {
		rl.requests[key] = requests
		return false
	}

	// 記錄新的請求
	requests = append(requests, now)
	rl.requests[key] = requests

	return true
}
