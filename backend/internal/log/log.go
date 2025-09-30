package log

import (
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var logger *zap.Logger

// InitLogger initializes the logger with the given log level
func InitLogger(level string) error {
	// 創建自定義的 encoder 配置
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "timestamp",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		MessageKey:     "msg",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.CapitalLevelEncoder,
		EncodeTime:     customTimeEncoder,
		EncodeDuration: zapcore.StringDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}

	// 創建基本配置
	config := zap.Config{
		Level:            getLogLevel(level),
		Development:      false,
		Encoding:         "json",
		EncoderConfig:    encoderConfig,
		OutputPaths:      []string{"stdout"},
		ErrorOutputPaths: []string{"stderr"},
	}

	var err error
	logger, err = config.Build(zap.AddCaller())
	if err != nil {
		return err
	}

	return nil
}

// customTimeEncoder 自定義時間格式
func customTimeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(t.Format("2006-01-02T15:04:05.000-0700"))
}

// getLogLevel 根據字符串獲取日誌級別
func getLogLevel(level string) zap.AtomicLevel {
	switch level {
	case "debug":
		return zap.NewAtomicLevelAt(zapcore.DebugLevel)
	case "info":
		return zap.NewAtomicLevelAt(zapcore.InfoLevel)
	case "warn":
		return zap.NewAtomicLevelAt(zapcore.WarnLevel)
	case "error":
		return zap.NewAtomicLevelAt(zapcore.ErrorLevel)
	default:
		return zap.NewAtomicLevelAt(zapcore.InfoLevel)
	}
}

// Debug logs a debug message
func Debug(msg string, fields ...zap.Field) {
	logger.Debug(msg, fields...)
}

// Info logs an info message
func Info(msg string, fields ...zap.Field) {
	logger.Info(msg, fields...)
}

// Warn logs a warning message
func Warn(msg string, fields ...zap.Field) {
	logger.Warn(msg, fields...)
}

// Error logs an error message
func Error(msg string, fields ...zap.Field) {
	logger.Error(msg, fields...)
}

// Fatal logs a fatal message and then calls os.Exit(1)
func Fatal(msg string, fields ...zap.Field) {
	logger.Fatal(msg, fields...)
}

// With creates a child logger with the given fields
func With(fields ...zap.Field) *zap.Logger {
	return logger.With(fields...)
}

// GetLogger returns the logger instance
func GetLogger() *zap.Logger {
	return logger
}
