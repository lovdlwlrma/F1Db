package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"lovdlwlrma/backend/internal/log"
	"lovdlwlrma/backend/internal/server"

	"go.uber.org/zap"
)

func main() {
	// -----------------------------
	// 初始化 logger
	// -----------------------------
	logLevel := os.Getenv("LOG_LEVEL")
	if logLevel == "" {
		logLevel = "info"
	}
	if err := log.InitLogger(logLevel); err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	logger := log.GetLogger()

	// -----------------------------
	// 啟動主 HTTP Server (API)
	// -----------------------------
	srv := server.NewServer()

	go func() {
		logger.Info("Main API server starting", zap.Int("port", 8080))
		if err := srv.Start(8080); err != nil {
			logger.Error("Main API server error", zap.Error(err))
		}
	}()

	// -----------------------------
	// 等待退出信號
	// -----------------------------
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// -----------------------------
	// Graceful shutdown
	// -----------------------------
	logger.Info("Shutting down servers...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 關閉主服務器
	if err := srv.Stop(shutdownCtx); err != nil {
		logger.Error("Main server forced to shutdown", zap.Error(err))
		os.Exit(1)
	}

	logger.Info("Server exited gracefully")
}
