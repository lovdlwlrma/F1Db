package service

import (
	"context"
	"encoding/json"
	"sort"
	"time"
)

type LapRanking struct {
	LapNumber int   `json:"lap_number"`
	Rank      []int `json:"rank"` // 第一名到最後名次的車手編號
}

type PositionService struct {
	*BaseService
}

func NewPositionService(base *BaseService) *PositionService {
	return &PositionService{BaseService: base}
}

func (s *PositionService) GetPositionHistory(ctx context.Context, sessionKey int) (map[int][]PositionRecord, error) {
	data, err := s.FetchJSON(ctx, func(ctx context.Context) ([]byte, error) {
		return s.DS.GetPositionBySession(ctx, sessionKey)
	})
	if err != nil {
		return nil, err
	}

	var records []PositionRecord
	if err := json.Unmarshal(data, &records); err != nil {
		return nil, err
	}

	driverHistory := make(map[int][]PositionRecord)
	for _, rec := range records {
		driverHistory[rec.DriverNumber] = append(driverHistory[rec.DriverNumber], rec)
	}

	for driver, history := range driverHistory {
		sort.Slice(history, func(i, j int) bool {
			return history[i].Date.Before(history[j].Date)
		})
		driverHistory[driver] = history
	}

	return driverHistory, nil
}

func (s *PositionService) GetSessionLapRankings(ctx context.Context, sessionKey int) ([]map[string]interface{}, error) {
	positionHistory, err := s.GetPositionHistory(ctx, sessionKey)
	if err != nil {
		return nil, err
	}

	lapService := NewLapService(s.BaseService)
	lapHistory, err := lapService.GetLapHistoryAll(ctx, sessionKey)
	if err != nil {
		return nil, err
	}

	// 收集所有圈數（取最大圈數為止）
	maxLap := 0
	for _, laps := range lapHistory {
		for _, lap := range laps {
			if lap.LapNumber > maxLap {
				maxLap = lap.LapNumber
			}
		}
	}

	var result []map[string]interface{}
	var prevRank []int
	var prevDNF []bool

	for lapNum := 1; lapNum <= maxLap; lapNum++ {
		type driverPos struct {
			driver  int
			pos     int
			dnfTime time.Time
			isDNF   bool
		}
		var list []driverPos

		// 檢查這一圈是否有 lapHistory
		hasLapData := false

		for driver, laps := range lapHistory {
			if len(laps) == 0 {
				continue
			}

			var lapTime time.Time
			var isDNF bool
			var latestPos int

			if lapNum == 1 {
				// 第一圈取 PositionHistory 最早一筆
				if positions, ok := positionHistory[driver]; ok && len(positions) > 0 {
					firstPos := positions[0]
					lapTime = firstPos.Date
					latestPos = firstPos.Position
					isDNF = false
					hasLapData = true
				} else {
					// 沒有任何 position，當作 DNF
					lapTime = time.Time{}
					latestPos = 999
					isDNF = true
				}
			} else {
				// 找對應圈數的 lap
				found := false
				for _, lap := range laps {
					if lap.LapNumber == lapNum {
						lapTime = lap.DateStart
						isDNF = lap.IsDNF
						latestPos = 999
						for _, pos := range positionHistory[driver] {
							if !pos.Date.After(lapTime) {
								latestPos = pos.Position
							} else {
								break
							}
						}
						found = true
						hasLapData = true
						break
					}
				}
				if !found {
					// 沒有這圈的 lap → 保留 last known pos
					isDNF = true
					lapTime = laps[len(laps)-1].DateStart
					latestPos = 999
					for _, pos := range positionHistory[driver] {
						if !pos.Date.After(lapTime) {
							latestPos = pos.Position
						} else {
							break
						}
					}
				}
			}

			list = append(list, driverPos{
				driver:  driver,
				pos:     latestPos,
				dnfTime: lapTime,
				isDNF:   isDNF,
			})
		}

		if !hasLapData && lapNum > 1 {
			// 這一圈沒有任何資料 → 繼承上一圈的結果
			result = append(result, map[string]interface{}{
				"lap":  lapNum,
				"rank": prevRank,
				"dnf":  prevDNF,
			})
			continue
		}

		// 排序
		sort.Slice(list, func(i, j int) bool {
			if list[i].isDNF && list[j].isDNF {
				return list[i].dnfTime.After(list[j].dnfTime)
			} else if list[i].isDNF {
				return false
			} else if list[j].isDNF {
				return true
			}
			return list[i].pos < list[j].pos
		})

		var rank []int
		var dnf []bool
		for _, p := range list {
			rank = append(rank, p.driver)
			dnf = append(dnf, p.isDNF)
		}

		prevRank = rank
		prevDNF = dnf

		result = append(result, map[string]interface{}{
			"lap":  lapNum,
			"rank": rank,
			"dnf":  dnf,
		})
	}

	return result, nil
}
