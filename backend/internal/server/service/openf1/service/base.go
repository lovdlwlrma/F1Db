package service

import (
	"context"
	"go.uber.org/zap"
	"lovdlwlrma/backend/internal/server/service/openf1/datasource"
)

type BaseService struct {
	DS     *datasource.OpenF1Datasource
	Logger *zap.Logger
}

func NewOpenF1Service(logger *zap.Logger) *BaseService {
	if logger == nil {
		logger = zap.NewNop()
	}
	return &BaseService{
		DS:     datasource.NewOpenF1Datasource(logger),
		Logger: logger,
	}
}

func (b *BaseService) Close() {
	if b.DS != nil {
		b.DS.Close()
	}
}

func (b *BaseService) FetchJSON(ctx context.Context, fetchFunc func(ctx context.Context) ([]byte, error)) ([]byte, error) {
	return fetchFunc(ctx)
}
