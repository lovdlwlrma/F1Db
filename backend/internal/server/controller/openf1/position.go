package controller

import (
	"net/http"
	"strconv"

	"lovdlwlrma/backend/internal/server/service/openf1/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func RegisterOpenF1PositionRoutes(rg *gin.RouterGroup, logger *zap.Logger) {
	group := rg.Group("/openf1")
	{
		group.GET("/position/:sessions_key", func(c *gin.Context) {
			sessionKeyStr := c.Param("sessions_key")

			sessionKey, err := strconv.Atoi(sessionKeyStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sessions_key"})
				return
			}

			svc := service.NewPositionService(service.NewOpenF1Service(logger))
			positionData, err := svc.GetSessionLapRankings(c.Request.Context(), sessionKey)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusOK, positionData)
		})
	}
}
