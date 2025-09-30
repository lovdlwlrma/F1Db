package middleware

import (
	"net/http"
	"lovdlwlrma/backend/internal/log"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// ErrorHandler middleware
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// 只處理最後一個錯誤
		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			log.Error("Request error",
				zap.Error(err.Err),
				zap.String("path", c.Request.URL.Path),
			)

			// 根據錯誤類型返回不同的狀態碼
			switch err.Type {
			case gin.ErrorTypeBind:
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Invalid request parameters",
					"details": err.Err.Error(),
				})
			case gin.ErrorTypePrivate:
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
				})
			default:
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Unknown error",
					"details": err.Err.Error(),
				})
			}
		}
	}
}
