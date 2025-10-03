package datasource

import (
	"context"
	"fmt"

	"lovdlwlrma/backend/internal/server/service/openf1/httpclient"
)

// GetLatestSession fetches the latest session JSON from OpenF1 and returns raw JSON bytes.
func (o *OpenF1Datasource) GetLatestSession(ctx context.Context) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    "https://api.openf1.org/v1/sessions?session_key=latest",
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}

func (o *OpenF1Datasource) GetYearSession(ctx context.Context, year int) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    fmt.Sprintf("https://api.openf1.org/v1/sessions?year=%d", year),
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}

func (o *OpenF1Datasource) GetSessionByMeeting(ctx context.Context, meetingKey int) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    fmt.Sprintf("https://api.openf1.org/v1/sessions?meeting_key=%d", meetingKey),
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}

func (o *OpenF1Datasource) GetRaceSession(ctx context.Context, meetingKey int) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    fmt.Sprintf("https://api.openf1.org/v1/sessions?meeting_key=%d&session_name=Race", meetingKey),
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}
