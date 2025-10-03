package httpclient

import (
	"context"
	"io"
)

// FetchRequest defines the input request for HTTP Client
type FetchRequest struct {
	URL     string            // Complete URL
	Method  string            // HTTP method (GET, POST, etc.)
	Headers map[string]string // HTTP headers
	Body    io.Reader         // Request body (optional)
	Timeout int               // Timeout in seconds
}

// FetchResponse defines the output response for HTTP Client
type FetchResponse struct {
	StatusCode int               // HTTP status code
	Headers    map[string]string // Response headers
	Body       []byte            // Raw response body
	Duration   int64             // Request duration in milliseconds
}

// HTTPClient defines the generic HTTP Client interface
type HTTPClient interface {
	// Fetch executes HTTP request and returns raw response
	Fetch(ctx context.Context, req *FetchRequest) (*FetchResponse, error)

	// FetchJSON executes HTTP request and returns JSON format response
	FetchJSON(ctx context.Context, req *FetchRequest) (*FetchResponse, error)

	// Close closes the HTTP Client and releases resources
	Close() error
}

// HTTPClientConfig defines the configuration for HTTP Client
type HTTPClientConfig struct {
	BaseURL        string            // Base URL
	DefaultHeaders map[string]string // Default headers
	Timeout        int               // Default timeout in seconds
	MaxRetries     int               // Maximum retry attempts
	RetryDelay     int               // Retry delay in milliseconds
}
