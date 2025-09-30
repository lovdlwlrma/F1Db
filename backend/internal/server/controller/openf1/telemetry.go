package controller

import (
	"net/http"
	"strconv"

	"lovdlwlrma/backend/internal/server/service/openf1/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func RegisterOpenF1TelemetryRoutes(rg *gin.RouterGroup, logger *zap.Logger) {
	group := rg.Group("/openf1")
	{
		group.GET("/telemetry/:sessions_key/:driver_number/:lap_number", func(c *gin.Context) {
			sessionKeyStr := c.Param("sessions_key")
			driverNumberStr := c.Param("driver_number")
			lapNumberStr := c.Param("lap_number")

			sessionKey, err := strconv.Atoi(sessionKeyStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid sessions_key"})
				return
			}
			driverNumber, err := strconv.Atoi(driverNumberStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid driver_number"})
				return
			}
			lapNumber, err := strconv.Atoi(lapNumberStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid lap_number"})
				return
			}

			svc := service.NewTelemetryService(service.NewOpenF1Service(logger))
			telemetryData, err := svc.GetLapCarData(c.Request.Context(), sessionKey, driverNumber, lapNumber)
			if err != nil {
				c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusOK, telemetryData)
		})
	}
}
