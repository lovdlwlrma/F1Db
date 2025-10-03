package controller

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"lovdlwlrma/backend/internal/server/service/openf1/datasource"
	"net/http"
	"strconv"
)

// RegisterOpenF1MeetingRoutes registers routes related to OpenF1 meetings.
func RegisterOpenF1ResultRoutes(rg *gin.RouterGroup, logger *zap.Logger) {
	group := rg.Group("/openf1")
	{
		group.GET("/result/:sessions_key", func(c *gin.Context) {
			datasource := datasource.NewOpenF1Datasource(logger)
			defer datasource.Close()

			sessionKey, err := strconv.Atoi(c.Param("sessions_key"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sessions_key"})
				return
			}

			data, err := datasource.GetResultBySession(c.Request.Context(), sessionKey)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}

			c.Data(http.StatusOK, "application/json", data)
		})
	}
}
