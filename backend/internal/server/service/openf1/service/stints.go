package service

import (
	"context"
	"encoding/json"
	"sort"
)

// service struct
type StintService struct {
	*BaseService
}

func NewStintService(base *BaseService) *StintService {
	return &StintService{BaseService: base}
}

func (s *StintService) GetStintsBySession(ctx context.Context, sessionKey int) (map[int][]StintRecord, error) {
	data, err := s.FetchJSON(ctx, func(ctx context.Context) ([]byte, error) {
		return s.DS.GetStintsBySession(ctx, sessionKey)
	})
	if err != nil {
		return nil, err
	}

	var records []StintRecord
	if err := json.Unmarshal(data, &records); err != nil {
		return nil, err
	}

	// 分組：driver_number -> []StintRecord
	driverStints := make(map[int][]StintRecord)
	for _, rec := range records {
		driverStints[rec.DriverNumber] = append(driverStints[rec.DriverNumber], rec)
	}

	// 每個車手的 stints 照 stint_number 排序
	for driver, stints := range driverStints {
		sort.Slice(stints, func(i, j int) bool {
			return stints[i].StintNumber < stints[j].StintNumber
		})
		driverStints[driver] = stints
	}

	return driverStints, nil
}
