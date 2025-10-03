package service

import (
	"context"
	"encoding/json"
	"sort"
)

type LapService struct {
	*BaseService
}

func NewLapService(base *BaseService) *LapService {
	return &LapService{BaseService: base}
}

// 抓取整個 session 所有車手 lap 資料
func (s *LapService) GetLapHistoryAll(ctx context.Context, sessionKey int) (map[int][]LapRecord, error) {
	data, err := s.FetchJSON(ctx, func(ctx context.Context) ([]byte, error) {
		return s.DS.GetLapsBySession(ctx, sessionKey)
	})
	if err != nil {
		return nil, err
	}

	var records []LapRecord
	if err := json.Unmarshal(data, &records); err != nil {
		return nil, err
	}

	driverHistory := make(map[int][]LapRecord)
	for _, rec := range records {
		driverHistory[rec.DriverNumber] = append(driverHistory[rec.DriverNumber], rec)
	}

	for driver, laps := range driverHistory {
		sort.Slice(laps, func(i, j int) bool {
			return laps[i].LapNumber < laps[j].LapNumber
		})
		driverHistory[driver] = laps
	}

	return driverHistory, nil
}
