package controller

import (
	"net/http"
	"strconv"
	"lovdlwlrma/backend/internal/server/service/openf1/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// RegisterOpenF1MeetingRoutes registers routes related to OpenF1 meetings.
func RegisterOpenF1StintsRoutes(rg *gin.RouterGroup, logger *zap.Logger) {
	group := rg.Group("/openf1")
	{
		group.GET("/stints/:sessions_key", func(c *gin.Context) {
			sessionKey, err := strconv.Atoi(c.Param("sessions_key"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sessions_key"})
				return
			}
			
			stintService := service.NewStintService(service.NewOpenF1Service(logger))
			stintsData, err := stintService.GetStintsBySession(c.Request.Context(), sessionKey)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}
			
			c.JSON(http.StatusOK, stintsData)
		})
	}
}
