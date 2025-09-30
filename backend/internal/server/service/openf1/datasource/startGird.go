package datasource

import (
	"context"
	"fmt"

	"lovdlwlrma/backend/internal/server/service/openf1/httpclient"
)

func (o *OpenF1Datasource) GetStartGridBySession(ctx context.Context, sessionKey int) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    fmt.Sprintf("https://api.openf1.org/v1/starting_grid?session_key=%d", sessionKey),
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}