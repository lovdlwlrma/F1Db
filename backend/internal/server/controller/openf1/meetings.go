package controller

import (
	"lovdlwlrma/backend/internal/server/service/openf1/datasource"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// RegisterOpenF1MeetingRoutes registers routes related to OpenF1 meetings.
func RegisterOpenF1MeetingRoutes(rg *gin.RouterGroup, logger *zap.Logger) {
	group := rg.Group("/openf1")
	{
		group.GET("/meetings/latest", func(c *gin.Context) {
			datasource := datasource.NewOpenF1Datasource(logger)
			defer datasource.Close()

			data, err := datasource.GetLatestMeeting(c.Request.Context())
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}
			c.Data(http.StatusOK, "application/json", data)
		})

		group.GET("/meetings/year/:year", func(c *gin.Context) {
			datasource := datasource.NewOpenF1Datasource(logger)
			defer datasource.Close()

			year, err := strconv.Atoi(c.Param("year"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid year"})
				return
			}

			data, err := datasource.GetYearMeeting(c.Request.Context(), year)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}
			c.Data(http.StatusOK, "application/json", data)
		})
	}
}
