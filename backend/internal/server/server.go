package server

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"lovdlwlrma/backend/internal/log"
	"lovdlwlrma/backend/internal/server/middleware"
	"lovdlwlrma/backend/internal/server/routes"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type Server struct {
	router *gin.Engine
	srv    *http.Server
}

// NewServer creates a new server instance
func NewServer() *Server {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()

	// 全局中間件
	router.Use(middleware.CORS())
	router.Use(middleware.Logger())
	router.Use(middleware.ErrorHandler())
	router.Use(gin.Recovery())

	// 限流中間件 - 每個 IP 每分鐘最多 100 個請求
	router.Use(middleware.RateLimit(time.Minute, 100))

	server := &Server{
		router: router,
	}

	// API 路由
	api := router.Group("/api/v1")
	routes.RegisterRoutes(api)

	return server
}

// Start starts the HTTP server
func (s *Server) Start(port int) error {
	s.srv = &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: s.router,
	}

	log.Info("Starting server", zap.Int("port", port))
	return s.srv.ListenAndServe()
}

// Stop gracefully shuts down the server
func (s *Server) Stop(ctx context.Context) error {
	log.Info("Shutting down server")
	return s.srv.Shutdown(ctx)
}

// Router returns the gin router instance
func (s *Server) Router() *gin.Engine {
	return s.router
}
