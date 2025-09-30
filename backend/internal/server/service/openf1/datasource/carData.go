package datasource

import (
	"context"
	"fmt"

	"lovdlwlrma/backend/internal/server/service/openf1/httpclient"
)

func (o *OpenF1Datasource) GetCarDataByLap(ctx context.Context, sessionKey int, driverNum int, startEscaped string, endEscaped string) ([]byte, error) {
	req := &httpclient.FetchRequest{
		URL:    fmt.Sprintf("https://api.openf1.org/v1/car_data?session_key=%d&driver_number=%d&date%%3E=%s&date%%3C=%s",
							 sessionKey, driverNum, startEscaped, endEscaped),
		Method: "GET",
		Headers: map[string]string{
			"Accept": "application/json",
		},
		Timeout: 30,
	}

	return o.fetchJSON(ctx, req)
}