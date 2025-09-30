package httpclient

import (
	"go.uber.org/zap"
)

// HTTPClientType defines the type of HTTPClient
type HTTPClientType string

const (
	// HTTPClientTypeHTTP HTTP Client type
	HTTPClientTypeHTTP HTTPClientType = "http"
)

// NewTransporter creates a new Transporter instance
func NewHTTPClient(httpClientType HTTPClientType, config *HTTPClientConfig, logger *zap.Logger) (HTTPClient, error) {
	switch httpClientType {
	case HTTPClientTypeHTTP:
		return NewHTTPFetcher(config, logger), nil
	default:
		return nil, ErrUnsupportedHTTPClientType
	}
}

// NewDefaultHTTPClient creates a default configured HTTP Client
func NewDefaultHTTPClient(logger *zap.Logger) HTTPClient {
	config := &HTTPClientConfig{
		BaseURL: "",
		DefaultHeaders: map[string]string{
			"User-Agent": "F1-Data-Transporter/1.0",
		},
		Timeout:    30,
		MaxRetries: 3,
		RetryDelay: 1000,
	}
	return NewHTTPFetcher(config, logger)
}

// NewF1APIHTTPClient creates a HTTP Client specifically for F1 API
func NewF1APIHTTPClient(baseURL string, logger *zap.Logger) HTTPClient {
	config := &HTTPClientConfig{
		BaseURL: baseURL,
		DefaultHeaders: map[string]string{
			"User-Agent": "F1-Data-Transporter/1.0",
			"Accept":     "application/json",
		},
		Timeout:    30,
		MaxRetries: 3,
		RetryDelay: 1000,
	}
	return NewHTTPFetcher(config, logger)
}
