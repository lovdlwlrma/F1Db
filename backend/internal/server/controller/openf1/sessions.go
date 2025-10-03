package controller

import (
	"lovdlwlrma/backend/internal/server/service/openf1/datasource"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// RegisterOpenF1SessionRoutes registers routes related to OpenF1 sessions.
func RegisterOpenF1SessionRoutes(rg *gin.RouterGroup, logger *zap.Logger) {
	group := rg.Group("/openf1")
	{
		group.GET("/sessions/latest", func(c *gin.Context) {
			datasource := datasource.NewOpenF1Datasource(logger)
			defer datasource.Close()

			data, err := datasource.GetLatestSession(c.Request.Context())
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}
			c.Data(http.StatusOK, "application/json", data)
		})

		group.GET("/sessions/meeting/:meeting_key", func(c *gin.Context) {
			datasource := datasource.NewOpenF1Datasource(logger)
			defer datasource.Close()

			meetingKey, err := strconv.Atoi(c.Param("meeting_key"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid meeting_key"})
				return
			}

			data, err := datasource.GetSessionByMeeting(c.Request.Context(), meetingKey)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}
			c.Data(http.StatusOK, "application/json", data)
		})

		group.GET("/sessions/year/:year", func(c *gin.Context) {
			datasource := datasource.NewOpenF1Datasource(logger)
			defer datasource.Close()

			year, err := strconv.Atoi(c.Param("year"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid year"})
				return
			}

			data, err := datasource.GetYearSession(c.Request.Context(), year)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}
			c.Data(http.StatusOK, "application/json", data)
		})

		group.GET("/sessions/race/:meeting_key", func(c *gin.Context) {
			datasource := datasource.NewOpenF1Datasource(logger)
			defer datasource.Close()

			meetingKey, err := strconv.Atoi(c.Param("meeting_key"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid meeting_key"})
				return
			}

			data, err := datasource.GetRaceSession(c.Request.Context(), meetingKey)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}
			c.Data(http.StatusOK, "application/json", data)
		})
	}
}
