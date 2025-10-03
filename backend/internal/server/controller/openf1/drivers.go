package controller

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"lovdlwlrma/backend/internal/server/service/openf1/datasource"
	"net/http"
	"strconv"
)

// RegisterOpenF1MeetingRoutes registers routes related to OpenF1 meetings.
func RegisterOpenF1DriverRoutes(rg *gin.RouterGroup, logger *zap.Logger) {
	group := rg.Group("/openf1")
	{
		group.GET("/drivers/latest", func(c *gin.Context) {
			datasource := datasource.NewOpenF1Datasource(logger)
			defer datasource.Close()

			data, err := datasource.GetLatestDrivers(c.Request.Context())
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}
			c.Data(http.StatusOK, "application/json", data)
		})

		group.GET("/drivers/sessions/:sessions_key", func(c *gin.Context) {
			datasource := datasource.NewOpenF1Datasource(logger)
			defer datasource.Close()

			sessions_key, err := strconv.Atoi(c.Param("sessions_key"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sessions_key"})
				return
			}

			data, err := datasource.GetSessionsDrivers(c.Request.Context(), sessions_key)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}
			c.Data(http.StatusOK, "application/json", data)
		})

		group.GET("/drivers/number/:driver_number", func(c *gin.Context) {
			datasource := datasource.NewOpenF1Datasource(logger)
			defer datasource.Close()

			driver_number, err := strconv.Atoi(c.Param("driver_number"))
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid driver_number"})
				return
			}

			data, err := datasource.GetDriverInfo(c.Request.Context(), driver_number)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}
			c.Data(http.StatusOK, "application/json", data)
		})
	}
}
