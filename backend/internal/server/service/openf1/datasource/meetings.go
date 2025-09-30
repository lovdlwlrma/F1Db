package datasource

import (
	"context"
	"fmt"

	"lovdlwlrma/backend/internal/server/service/openf1/httpclient"
)

func (o *OpenF1Datasource) GetLatestMeeting(ctx context.Context) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    "https://api.openf1.org/v1/meetings?meeting_key=latest",
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}

func (o *OpenF1Datasource) GetYearMeeting(ctx context.Context, year int) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    fmt.Sprintf("https://api.openf1.org/v1/meetings?year=%d", year),
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}

func (o *OpenF1Datasource) GetRaceMeeting(ctx context.Context, year int, raceName string) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    fmt.Sprintf("https://api.openf1.org/v1/meetings?year=%d&meeting_name=%s", year, raceName),
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}