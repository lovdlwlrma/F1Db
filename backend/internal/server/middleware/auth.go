package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// Auth middleware
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "No authorization header",
			})
			return
		}

		// Bearer token format
		parts := strings.Split(auth, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization format",
			})
			return
		}

		token := parts[1]
		// TODO: 實作 token 驗證邏輯
		if !validateToken(token) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token",
			})
			return
		}

		// 將用戶信息存儲到上下文中
		c.Set("user_id", "example_user_id") // 這裡應該是從 token 中解析出的用戶 ID
		c.Next()
	}
}

// validateToken 驗證 token
func validateToken(token string) bool {
	// TODO: 實作真正的 token 驗證邏輯
	return len(token) > 0
}
