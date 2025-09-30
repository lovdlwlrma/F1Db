package httpclient

import (
	"errors"
)

var (
	// ErrUnsupportedHTTPClientType error for unsupported http client type
	ErrUnsupportedHTTPClientType = errors.New("unsupported http client type")
	
	// ErrInvalidRequest error for invalid request
	ErrHTTPClientInvalidRequest = errors.New("invalid request")
	
	// ErrHTTPClientRequestTimeout error for request timeout
	ErrHTTPClientRequestTimeout = errors.New("request timeout")
	
	// ErrHTTPClientMaxRetriesExceeded error for exceeding maximum retry attempts
	ErrHTTPClientMaxRetriesExceeded = errors.New("maximum retry attempts exceeded")
	
	// ErrHTTPClientInvalidJSONResponse error for invalid JSON response
	ErrHTTPClientInvalidJSONResponse = errors.New("invalid JSON response")
)
