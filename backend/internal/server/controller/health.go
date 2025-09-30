package controller

import (
	"lovdlwlrma/backend/deployments/database/cassandra"
	"lovdlwlrma/backend/deployments/database/postgres"
	"net/http"

	"github.com/gin-gonic/gin"
)

type HealthController struct {
	pg  *postgres.PostgresDB
	cas *cassandra.CassandraDB
}

func NewHealthController(pg *postgres.PostgresDB, cas *cassandra.CassandraDB) *HealthController {
	return &HealthController{
		pg:  pg,
		cas: cas,
	}
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
	pgErr := h.pg.Ping()
	casErr := h.cas.Ping()

	status := "ok"
	if pgErr != nil || casErr != nil {
		status = "error"
	}

	c.JSON(http.StatusOK, gin.H{
		"status": status,
		"postgres": gin.H{
			"status": pgErr == nil,
			"error":  errToString(pgErr),
		},
		"cassandra": gin.H{
			"status": casErr == nil,
			"error":  errToString(casErr),
		},
	})
}

func RegisterHealthRoutes(rg *gin.RouterGroup, pg *postgres.PostgresDB, cas *cassandra.CassandraDB) {
	healthCtrl := NewHealthController(pg, cas)
	rg.GET("/health", healthCtrl.HealthCheck)
}
