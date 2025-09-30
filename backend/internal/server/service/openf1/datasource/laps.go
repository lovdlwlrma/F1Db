package datasource

import (
	"context"
	"fmt"

	"lovdlwlrma/backend/internal/server/service/openf1/httpclient"
)

func (o *OpenF1Datasource) GetLapsBySession(ctx context.Context, sessionKey int) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    fmt.Sprintf("https://api.openf1.org/v1/laps?session_key=%d", sessionKey),
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}

func (o *OpenF1Datasource) GetLapsByDriver(ctx context.Context, sessionKey int, driverNum int) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    fmt.Sprintf("https://api.openf1.org/v1/laps?session_key=%d&driver_number=%d", sessionKey, driverNum),
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}