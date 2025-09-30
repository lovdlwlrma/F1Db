package controller

import (
	"net/http"
	"strconv"
	"time"

	"lovdlwlrma/backend/deployments/database/cassandra"
	"lovdlwlrma/backend/internal/log"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type LogController struct {
	cas *cassandra.CassandraDB
}

func NewLogController(cas *cassandra.CassandraDB) *LogController {
	return &LogController{
		cas: cas,
	}
}

// Create log godoc
// @Summary      Create a log
// @Description  Create a log
// @Tags         logs
// @Accept       json
// @Produce      json
// @Param        log  body      cassandra.Log true "Log"
// @Success      201       {object}  cassandra.Log
// @Failure      400       {object}  HTTPError
// @Failure      500       {object}  HTTPError
// @Router       /logs [post]
func (l *LogController) Create(c *gin.Context) {
	var logger cassandra.Log
	if err := c.ShouldBindJSON(&logger); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Timestamp = time.Now()
	if err := l.cas.InsertLog(&logger); err != nil {
		log.Error("Failed to create log", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, logger)
}

// GetRecent logs godoc
// @Summary      Get recent logs
// @Description  Get recent logs
// @Tags         logs
// @Accept       json
// @Produce      json
// @Param        limit query     int  false "Limit"
// @Success      200       {array}   cassandra.Log
// @Failure      500       {object}  HTTPError
// @Router       /logs/recent [get]
func (l *LogController) GetRecent(c *gin.Context) {
	limit := 100 // Default limit
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	logs, err := l.cas.GetRecentLogs(limit)
	if err != nil {
		log.Error("Failed to get recent logs", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}

func RegisterLogRoutes(rg *gin.RouterGroup, cas *cassandra.CassandraDB) {
	logCtrl := NewLogController(cas)

	logs := rg.Group("/logs")
	{
		logs.POST("/", logCtrl.Create)
		logs.GET("/recent", logCtrl.GetRecent)
	}
}
