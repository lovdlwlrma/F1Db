package middleware

import (
	"time"

	"lovdlwlrma/backend/internal/log"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// Logger middleware
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		userAgent := c.Request.UserAgent()
		clientIP := c.ClientIP()

		c.Next()

		end := time.Now()
		latency := end.Sub(start)

		if len(c.Errors) > 0 {
			// Log errors
			for _, e := range c.Errors.Errors() {
				log.Error("Request error",
					zap.String("error", e),
					zap.String("path", path),
					zap.String("query", query),
					zap.String("ip", clientIP),
					zap.String("user-agent", userAgent),
					zap.Int("status", c.Writer.Status()),
					zap.Duration("latency", latency),
				)
			}
		} else {
			// Log success
			log.Info("Request processed",
				zap.String("method", c.Request.Method),
				zap.String("path", path),
				zap.String("query", query),
				zap.String("ip", clientIP),
				zap.String("user-agent", userAgent),
				zap.Int("status", c.Writer.Status()),
				zap.Duration("latency", latency),
			)
		}
	}
}
