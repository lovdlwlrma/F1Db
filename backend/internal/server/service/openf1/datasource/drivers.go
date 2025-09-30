package datasource

import (
	"context"
	"fmt"

	"lovdlwlrma/backend/internal/server/service/openf1/httpclient"
)



func (o *OpenF1Datasource) GetLatestDrivers(ctx context.Context) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    "https://api.openf1.org/v1/drivers?session_key=latest",
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}

func (o *OpenF1Datasource) GetSessionsDrivers(ctx context.Context, session_key int) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    fmt.Sprintf("https://api.openf1.org/v1/drivers?session_key=%d", session_key),
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}