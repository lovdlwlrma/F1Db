package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"lovdlwlrma/backend/deployments/database/cassandra"
	"lovdlwlrma/backend/deployments/database/postgres"
	"lovdlwlrma/backend/internal/log"
	"lovdlwlrma/backend/internal/server"
	"lovdlwlrma/backend/internal/server/redis"
	"lovdlwlrma/backend/internal/server/service/datasync"

	goredis "github.com/go-redis/redis/v8"
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
	// 初始化 PostgreSQL
	// -----------------------------
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "admin"
	}
	
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "password123"
	}
	
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "appdb"
	}
	
	dbPort := 5432
	if portStr := os.Getenv("DB_PORT"); portStr != "" {
		// 可以加上轉換邏輯，這裡簡化處理
	}

	pg, err := postgres.NewPostgresDB(
		dbHost,
		dbUser,
		dbPassword,
		dbName,
		dbPort,
	)
	if err != nil {
		logger.Fatal("Failed to connect to PostgreSQL", zap.Error(err))
	}

	sqlDB, err := pg.GetDB()
	if err != nil {
		logger.Error("Failed to get sqlDB", zap.Error(err))
	} else {
		datasync.RunImport(sqlDB, logger)
	}

	// -----------------------------
	// 初始化 Cassandra
	// -----------------------------
	cassandraHosts := os.Getenv("CASSANDRA_HOSTS")
	if cassandraHosts == "" {
		cassandraHosts = "localhost:9042"
	}
	
	cassandraKeyspace := os.Getenv("CASSANDRA_KEYSPACE")
	if cassandraKeyspace == "" {
		cassandraKeyspace = "app_logs"
	}

	cas, err := cassandra.NewCassandraDB([]string{cassandraHosts}, cassandraKeyspace)
	if err != nil {
		logger.Fatal("Failed to connect to Cassandra", zap.Error(err))
	}
	defer cas.Close()

	// -----------------------------
	// 初始化 Redis 客戶端
	// -----------------------------
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	rdb := goredis.NewClient(&goredis.Options{
		Addr:     redisAddr,
		Password: os.Getenv("REDIS_PASS"),
		DB:       0,
	})

	// 測試 Redis 連接
	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		logger.Fatal("Failed to connect to Redis", zap.Error(err))
	}
	logger.Info("Redis connected", zap.String("addr", redisAddr))

	// -----------------------------
	// 初始化 StreamManager 和 WebSocket Handler
	// -----------------------------
	streamURL := os.Getenv("WS_URL")
	if streamURL == "" {
		streamURL = "https://rt-api.f1-dash.com/api/realtime"
	}

	streamKey := os.Getenv("STREAM_KEY")
	if streamKey == "" {
		streamKey = "f1:live:timing"
	}

	// 創建 StreamManager (但不立即啟動)
	streamManager := redis.NewStreamManager(streamURL, streamKey, rdb, logger)
	defer streamManager.Close()

	// 創建 WebSocket Handler
	wsHandler := redis.NewWebSocketHandler(streamManager, rdb, logger, streamKey)

	// -----------------------------
	// 創建新的 HTTP Mux 給 WebSocket
	// -----------------------------
	wsMux := http.NewServeMux()
	wsMux.HandleFunc("/ws/live", wsHandler.HandleConnection)
	wsMux.HandleFunc("/ws/status", wsHandler.ServeLiveStatus)
	
	// 健康檢查端點
	wsMux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","service":"websocket"}`))
	})

	// -----------------------------
	// 啟動主 HTTP Server (API)
	// -----------------------------
	srv := server.NewServer(pg, cas)
	
	go func() {
		logger.Info("Main API server starting", zap.Int("port", 8080))
		if err := srv.Start(8080); err != nil {
			logger.Error("Main API server error", zap.Error(err))
		}
	}()

	// -----------------------------
	// 啟動 WebSocket 服務器 (分開端口)
	// -----------------------------
	wsServer := &http.Server{
		Addr:         ":8081",
		Handler:      wsMux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info("WebSocket server starting", zap.String("addr", wsServer.Addr))
		if err := wsServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("WebSocket server error", zap.Error(err))
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

	// 關閉 WebSocket 服務器
	if err := wsServer.Shutdown(shutdownCtx); err != nil {
		logger.Error("WebSocket server forced to shutdown", zap.Error(err))
	}

	// 關閉主服務器
	if err := srv.Stop(shutdownCtx); err != nil {
		logger.Error("Main server forced to shutdown", zap.Error(err))
		os.Exit(1)
	}

	// 關閉 Redis
	if err := rdb.Close(); err != nil {
		logger.Error("Failed to close Redis", zap.Error(err))
	}

	logger.Info("Server exited gracefully")
}