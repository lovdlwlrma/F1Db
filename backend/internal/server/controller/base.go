package controller

import (
	"lovdlwlrma/backend/deployments/database/cassandra"
	"lovdlwlrma/backend/deployments/database/postgres"

	"github.com/gin-gonic/gin"
)

type BaseController struct {
	pg  *postgres.PostgresDB
	cas *cassandra.CassandraDB
}

func NewBaseController(pg *postgres.PostgresDB, cas *cassandra.CassandraDB) *BaseController {
	return &BaseController{
		pg:  pg,
		cas: cas,
	}
}

func (b *BaseController) RegisterRoutes(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	{
		// Health check
		v1.GET("/health", NewHealthController(b.pg, b.cas).HealthCheck)

		// User routes
		users := v1.Group("/users")
		userCtrl := NewUserController(b.pg)
		{
			users.POST("/", userCtrl.Create)
			users.GET("/", userCtrl.List)
			users.GET("/:id", userCtrl.Get)
			users.PUT("/:id", userCtrl.Update)
			users.DELETE("/:id", userCtrl.Delete)
		}

		// Log routes
		logs := v1.Group("/logs")
		logCtrl := NewLogController(b.cas)
		{
			logs.POST("/", logCtrl.Create)
			logs.GET("/recent", logCtrl.GetRecent)
		}
	}
}

func errToString(err error) string {
	if err == nil {
		return ""
	}
	return err.Error()
}

// HTTPError example
type HTTPError struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"status bad request"`
}
