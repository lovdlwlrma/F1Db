package controller

import (
	"net/http"

	"lovdlwlrma/backend/internal/server/service/race"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// RegisterRaceRoutes registers routes related to F1 races.
func RegisterRaceRoutes(rg *gin.RouterGroup, logger *zap.Logger, raceService *race.Service) {
	group := rg.Group("/race")
	{
		group.GET("/next", func(c *gin.Context) {
			nextRace, err := raceService.GetNextRace()
			if err != nil {
				logger.Error("Failed to get next race", zap.Error(err))
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
				})
				return
			}

			if nextRace == nil {
				c.JSON(http.StatusOK, gin.H{
					"message": "No upcoming races found",
					"data":    nil,
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "Next race retrieved successfully",
				"data":    nextRace,
			})
		})

		group.GET("/all", func(c *gin.Context) {
			allRaces, err := raceService.GetAllRaces()
			if err != nil {
				logger.Error("Failed to get all races", zap.Error(err))
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "All races retrieved successfully",
				"data":    allRaces,
				"count":   len(allRaces),
			})
		})
	}
}
