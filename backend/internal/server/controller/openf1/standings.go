package controller

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"lovdlwlrma/backend/internal/server/service/openf1/service"
	"net/http"
	"strconv"
)

// RegisterOpenF1MeetingRoutes registers routes related to OpenF1 meetings.
func RegisterOpenF1StandingsRoutes(rg *gin.RouterGroup, logger *zap.Logger) {
	group := rg.Group("/openf1")
	{
		group.GET("/standings/:year", func(c *gin.Context) {
			year, err := strconv.Atoi(c.Param("year"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid year"})
				return
			}

			standingsService := service.NewStandingsService(service.NewOpenF1Service(logger), logger)
			standingsData, err := standingsService.GetStandingsHistory(c.Request.Context(), year)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusOK, standingsData)
		})
	}
}
