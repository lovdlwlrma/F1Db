package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"sort"

	"lovdlwlrma/backend/internal/server/service/openf1/datasource"
)

type TelemetryService struct {
	*BaseService
}

func NewTelemetryService(base *BaseService) *TelemetryService {
	return &TelemetryService{BaseService: base}
}

func (t *TelemetryService) GetLapCarData(ctx context.Context, sessionKey, driverNum, lapNumber int) (*LapData, error) {
	// 先取出所有 laps
	lapsJSON, err := t.FetchJSON(ctx, func(ctx context.Context) ([]byte, error) {
		return t.DS.GetLapsByDriver(ctx, sessionKey, driverNum)
	})
	if err != nil {
		return nil, fmt.Errorf("get laps failed: %w", err)
	}

	var laps []datasource.Lap
	if err := json.Unmarshal(lapsJSON, &laps); err != nil {
		return nil, fmt.Errorf("unmarshal laps failed: %w", err)
	}

	// 確保 laps 依時間排序
	sort.Slice(laps, func(i, j int) bool {
		return laps[i].DateStart < laps[j].DateStart
	})

	// 找出 lapNumber 的 start / end
	var startTime, endTime string
	found := false
	for i, lap := range laps {
		if lap.LapNumber == lapNumber {
			startTime = lap.DateStart
			if i+1 < len(laps) {
				endTime = laps[i+1].DateStart
			}
			found = true
			break
		}
	}
	if !found || startTime == "" {
		return nil, fmt.Errorf("lap %d not found", lapNumber)
	}

	// 撈車輛資料，用 startTime ~ endTime（如果有）
	carJSON, err := t.FetchJSON(ctx, func(ctx context.Context) ([]byte, error) {
		return t.DS.GetCarDataByLap(
			ctx,
			sessionKey,
			driverNum,
			url.QueryEscape(startTime),
			url.QueryEscape(endTime),
		)
	})
	if err != nil {
		return nil, fmt.Errorf("get car data failed: %w", err)
	}

	var carData []datasource.CarData
	if err := json.Unmarshal(carJSON, &carData); err != nil {
		return nil, fmt.Errorf("unmarshal car data failed: %w", err)
	}
	if len(carData) == 0 {
		return nil, fmt.Errorf("no telemetry data for lap %d", lapNumber)
	}

	// 矯正：endTime = 這圈最後一筆 telemetry
	sort.Slice(carData, func(i, j int) bool {
		return carData[i].Date < carData[j].Date
	})
	endTime = carData[len(carData)-1].Date

	return &LapData{
		LapNumber:     lapNumber,
		StartTime:     startTime,
		EndTime:       endTime,
		TelemetryData: carData,
	}, nil
}
