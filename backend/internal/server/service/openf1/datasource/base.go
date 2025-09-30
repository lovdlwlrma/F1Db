package datasource

import (
	"context"
	"fmt"
	"lovdlwlrma/backend/internal/server/service/openf1/httpclient"

	"go.uber.org/zap"
)

// OpenF1Datasource coordinates OpenF1 data fetching.
type OpenF1Datasource struct {
	httpClient httpclient.HTTPClient
	logger      *zap.Logger
}

// NewOpenF1Datasource creates a new datasource with a default HTTP client.
func NewOpenF1Datasource(logger *zap.Logger) *OpenF1Datasource {
	if logger == nil {
		logger = zap.NewNop()
	}
	// Base URL is set in the request directly; using default transporter is fine.
	httpClient := httpclient.NewDefaultHTTPClient(logger)
	return &OpenF1Datasource{
		httpClient: httpClient,
		logger:      logger,
	}
}

func (o *OpenF1Datasource) fetchJSON(ctx context.Context, req *httpclient.FetchRequest) ([]byte, error) {
	resp, err := o.httpClient.FetchJSON(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("fetch %s failed: %w", req.URL, err)
	}
	return resp.Body, nil
}

func (o *OpenF1Datasource) Close() {
	if o.httpClient != nil {
		_ = o.httpClient.Close()
	}
}