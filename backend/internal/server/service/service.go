package service

import (
	"context"

	"lovdlwlrma/backend/internal/log"

	"go.uber.org/zap"
)

// Service interface defines the common methods that all services should implement
type Service interface {
	Start(ctx context.Context) error
	Stop(ctx context.Context) error
}

// BaseService provides common functionality for all services
type BaseService struct {
	Name string
}

// NewBaseService creates a new base service
func NewBaseService(name string) BaseService {
	return BaseService{
		Name: name,
	}
}

// Start implements the common start logic
func (s *BaseService) Start(ctx context.Context) error {
	log.Info("Starting service", zap.String("service", s.Name))
	return nil
}

// Stop implements the common stop logic
func (s *BaseService) Stop(ctx context.Context) error {
	log.Info("Stopping service", zap.String("service", s.Name))
	return nil
}
