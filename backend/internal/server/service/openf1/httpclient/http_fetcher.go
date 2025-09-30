package httpclient

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"go.uber.org/zap"
)

// HTTPFetcher HTTP Fetcher implementation
type HTTPFetcher struct {
	client *http.Client
	config *HTTPClientConfig
	logger *zap.Logger
}

// NewHTTPClient creates a new HTTP Client
func NewHTTPFetcher(config *HTTPClientConfig, logger *zap.Logger) *HTTPFetcher {
	if config == nil {
		config = &HTTPClientConfig{
			Timeout:    30,
			MaxRetries: 3,
			RetryDelay: 1000,
		}
	}

	client := &http.Client{
		Timeout: time.Duration(config.Timeout) * time.Second,
	}

	return &HTTPFetcher{
		client: client,
		config: config,
		logger: logger,
	}
}

// Fetch executes HTTP request and returns raw response
func (t *HTTPFetcher) Fetch(ctx context.Context, req *FetchRequest) (*FetchResponse, error) {
	startTime := time.Now()

	// Log request start
	t.logger.Info("Starting HTTP request",
		zap.String("method", req.Method),
		zap.String("url", req.URL),
		zap.Any("headers", req.Headers),
		zap.Int("timeout", req.Timeout),
	)

	// Create HTTP request
	httpReq, err := t.createHTTPRequest(ctx, req)
	if err != nil {
		t.logger.Error("Failed to create HTTP request",
			zap.String("url", req.URL),
			zap.Error(err),
		)
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}

	// Execute request (with retry mechanism)
	var resp *http.Response
	for attempt := 0; attempt <= t.config.MaxRetries; attempt++ {
		if attempt > 0 {
			t.logger.Info("Retrying HTTP request",
				zap.String("url", req.URL),
				zap.Int("attempt", attempt),
				zap.Int("max_retries", t.config.MaxRetries),
			)
			time.Sleep(time.Duration(t.config.RetryDelay) * time.Millisecond)
		}

		resp, err = t.client.Do(httpReq)
		if err == nil {
			break
		}

		t.logger.Warn("HTTP request failed, preparing to retry",
			zap.String("url", req.URL),
			zap.Int("attempt", attempt+1),
			zap.Error(err),
		)

		if attempt == t.config.MaxRetries {
			t.logger.Error("HTTP request finally failed",
				zap.String("url", req.URL),
				zap.Int("total_attempts", attempt+1),
				zap.Error(err),
			)
			return nil, fmt.Errorf("HTTP request failed (retried %d times): %w", t.config.MaxRetries+1, err)
		}
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.logger.Error("Failed to read response body",
			zap.String("url", req.URL),
			zap.Int("status_code", resp.StatusCode),
			zap.Error(err),
		)
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	duration := time.Since(startTime).Milliseconds()

	// Log request completion
	t.logger.Info("HTTP request completed",
		zap.String("url", req.URL),
		zap.Int("status_code", resp.StatusCode),
		zap.Int64("duration_ms", duration),
		zap.Int("body_size", len(body)),
	)

	// Check status code
	if resp.StatusCode >= 400 {
		t.logger.Error("HTTP request returned error status code",
			zap.String("url", req.URL),
			zap.Int("status_code", resp.StatusCode),
			zap.String("status", resp.Status),
			zap.String("body", string(body)),
		)
		return nil, fmt.Errorf("HTTP error %d: %s", resp.StatusCode, resp.Status)
	}

	// Convert response headers
	headers := make(map[string]string)
	for key, values := range resp.Header {
		if len(values) > 0 {
			headers[key] = values[0]
		}
	}

	return &FetchResponse{
		StatusCode: resp.StatusCode,
		Headers:    headers,
		Body:       body,
		Duration:   duration,
	}, nil
}

// FetchJSON executes HTTP request and returns JSON format response
func (t *HTTPFetcher) FetchJSON(ctx context.Context, req *FetchRequest) (*FetchResponse, error) {
	// Set JSON related headers
	if req.Headers == nil {
		req.Headers = make(map[string]string)
	}
	req.Headers["Accept"] = "application/json"
	req.Headers["Content-Type"] = "application/json"

	// Execute request
	resp, err := t.Fetch(ctx, req)
	if err != nil {
		return nil, err
	}

	// Validate JSON format
	var jsonData interface{}
	if err := json.Unmarshal(resp.Body, &jsonData); err != nil {
		t.logger.Error("Response is not valid JSON format",
			zap.String("url", req.URL),
			zap.Error(err),
			zap.String("body_preview", string(resp.Body[:min(len(resp.Body), 200)])),
		)
		return nil, fmt.Errorf("response is not valid JSON format: %w", err)
	}

	t.logger.Info("JSON request successful",
		zap.String("url", req.URL),
		zap.Int("status_code", resp.StatusCode),
		zap.Int64("duration_ms", resp.Duration),
	)

	return resp, nil
}

// Close closes the HTTP Client and releases resources
func (t *HTTPFetcher) Close() error {
	t.client.CloseIdleConnections()
	t.logger.Info("HTTP Client closed")
	return nil
}

// createHTTPRequest creates HTTP request
func (t *HTTPFetcher) createHTTPRequest(ctx context.Context, req *FetchRequest) (*http.Request, error) {
	var body io.Reader
	if req.Body != nil {
		body = req.Body
	}

	httpReq, err := http.NewRequestWithContext(ctx, req.Method, req.URL, body)
	if err != nil {
		return nil, err
	}

	// Set default headers
	for key, value := range t.config.DefaultHeaders {
		httpReq.Header.Set(key, value)
	}

	// Set request headers
	for key, value := range req.Headers {
		httpReq.Header.Set(key, value)
	}

	return httpReq, nil
}

// min returns the smaller of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
