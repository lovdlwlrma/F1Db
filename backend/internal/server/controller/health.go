package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type HealthController struct{}

func NewHealthController() *HealthController {
	return &HealthController{}
}

// HealthCheck godoc
// @Summary      Show the status of server.
// @Description  get the status of server.
// @Tags         health
// @Accept       */*
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Router       /health [get]
func (h *HealthController) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "api",
	})
}

func RegisterHealthRoutes(rg *gin.RouterGroup) {
	healthCtrl := NewHealthController()
	rg.GET("/health", healthCtrl.HealthCheck)
}
