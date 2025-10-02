package service

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"sync"
	"time"

	"go.uber.org/zap"
)

type StandingsService struct {
	*BaseService
	rateLimiter *time.Ticker
	mu          sync.Mutex
	logger      *zap.Logger

	driverCache map[int]*Driver
	cacheMu     sync.RWMutex
}

func NewStandingsService(base *BaseService, logger *zap.Logger) *StandingsService {
	return &StandingsService{
		BaseService: base,
		rateLimiter: time.NewTicker(350 * time.Millisecond), // 每秒最多 3 次
		logger:      logger,
		driverCache: make(map[int]*Driver),
	}
}

// =======================
// 主入口: 積分歷史
// =======================
func (s *StandingsService) GetStandingsHistory(ctx context.Context, year int) (*StandingsHistory, error) {
	s.logger.Info("Fetching standings history", zap.Int("year", year))

	// 預先載入 driver 資料
	if err := s.preloadDrivers(ctx); err != nil {
		s.logger.Warn("Failed to preload drivers", zap.Error(err))
	}

	sessions, resultsMap, err := s.getRaceSessionsAndResults(ctx, year)
	if err != nil {
		s.logger.Error("Failed to get sessions and results", zap.Error(err))
		return nil, err
	}

	// Locations: 拼接 Location + SessionName
	locations := make([]string, len(sessions))
	for i, sess := range sessions {
		locations[i] = fmt.Sprintf("%s_%s", sess.Location, sess.SessionName)
	}
	s.logger.Debug("Locations prepared", zap.Strings("locations", locations))

	driverStandings := s.buildDriverPointsHistory(ctx, sessions, resultsMap)

	return &StandingsHistory{
		Year:            year,
		TotalRounds:     len(sessions),
		Locations:       locations,
		DriverStandings: driverStandings,
	}, nil
}

// =======================
// 車手積分整理
// =======================
func (s *StandingsService) buildDriverPointsHistory(ctx context.Context, events []Session, resultsMap map[int][]SessionResult) []DriverPointHistory {
	driverPoints := make(map[int]*DriverPointHistory)

	// 初始化車手
	for _, results := range resultsMap {
		for _, r := range results {
			if _, ok := driverPoints[r.DriverNumber]; !ok {
				// 從 cache / API 拿 driver info
				info, err := s.getDriverInfo(ctx, r.DriverNumber)
				if err != nil {
					s.logger.Warn("Failed to fetch driver info", zap.Int("driver", r.DriverNumber), zap.Error(err))
					continue
				}

				driverPoints[r.DriverNumber] = &DriverPointHistory{
					DriverNumber:     r.DriverNumber,
					FullName:         info.FullName,
					NameAcronym:      info.NameAcronym,
					HeadShotURL:      info.HeadShotURL,
					Color:            info.Color,
					TeamName:         info.Team,

					RoundPoints:      make([]float64, 0, len(events)),
					CumulativePoints: make([]float64, 0, len(events)),
					Positions:        make([]int, 0, len(events)),
				}
			}
		}
	}

	// 填寫每一場比賽的積分/排名
	for _, event := range events {
		results := resultsMap[event.SessionKey]

		pointsMap := make(map[int]float64)
		posMap := make(map[int]int)
		for _, r := range results {
			pointsMap[r.DriverNumber] = r.Points
			// 處理 Position 為 null 的情況，填 0 表示未完賽
			if r.DNF || r.DNS || r.DSQ || r.Position == 0 {
				posMap[r.DriverNumber] = -1 // -1 = dnf/dns/dsq
			} else {
				posMap[r.DriverNumber] = r.Position
			}
		}

		for driverNum, history := range driverPoints {
			prev := 0.0
			if len(history.CumulativePoints) > 0 {
				prev = history.CumulativePoints[len(history.CumulativePoints)-1]
			}
			cum := prev + pointsMap[driverNum]
			history.RoundPoints = append(history.RoundPoints, pointsMap[driverNum])
			history.CumulativePoints = append(history.CumulativePoints, cum)
			history.Positions = append(history.Positions, posMap[driverNum])
		}
	}

	// 最後依累積分排序
	var result []DriverPointHistory
	for _, h := range driverPoints {
		result = append(result, *h)
	}
	sort.Slice(result, func(i, j int) bool {
		pi := result[i].CumulativePoints[len(result[i].CumulativePoints)-1]
		pj := result[j].CumulativePoints[len(result[j].CumulativePoints)-1]
		return pi > pj
	})

	s.logger.Debug("Driver standings built", zap.Int("total_drivers", len(result)))
	return result
}

// =======================
// Driver Info 補齊機制
// =======================
func (s *StandingsService) preloadDrivers(ctx context.Context) error {
	data, err := s.FetchJSON(ctx, func(ctx context.Context) ([]byte, error) {
		return s.DS.GetLatestDrivers(ctx)
	})
	if err != nil {
		return err
	}

	var drivers []Driver
	if err := json.Unmarshal(data, &drivers); err != nil {
		return err
	}

	s.cacheMu.Lock()
	defer s.cacheMu.Unlock()
	for _, d := range drivers {
		copy := d
		s.driverCache[d.DriverNumber] = &copy
	}
	s.logger.Info("Preloaded drivers", zap.Int("count", len(drivers)))
	return nil
}

func (s *StandingsService) getDriverInfo(ctx context.Context, driverNumber int) (*Driver, error) {
	// 先從 cache 讀
	s.cacheMu.RLock()
	if d, ok := s.driverCache[driverNumber]; ok && d.FullName != "" && d.Team != "" {
		s.cacheMu.RUnlock()
		return d, nil
	}
	s.cacheMu.RUnlock()

	// 打 API
	data, err := s.FetchJSON(ctx, func(ctx context.Context) ([]byte, error) {
		return s.DS.GetDriverInfo(ctx, driverNumber)
	})
	if err != nil {
		return nil, err
	}

	var drivers []Driver
	if err := json.Unmarshal(data, &drivers); err != nil {
		return nil, err
	}
	if len(drivers) == 0 {
		return nil, fmt.Errorf("driver %d not found", driverNumber)
	}

	d := drivers[0]

	// 更新 cache
	s.cacheMu.Lock()
	s.driverCache[driverNumber] = &d
	s.cacheMu.Unlock()

	return &d, nil
}

// =======================
// 取得指定年份的 Race/Sprint Session 與結果
// =======================
func (s *StandingsService) getRaceSessionsAndResults(ctx context.Context, year int) ([]Session, map[int][]SessionResult, error) {
	s.logger.Info("Fetching sessions for year", zap.Int("year", year))

	data, err := s.FetchJSON(ctx, func(ctx context.Context) ([]byte, error) {
		return s.DS.GetYearSession(ctx, year)
	})
	if err != nil {
		s.logger.Error("Failed to fetch sessions", zap.Error(err))
		return nil, nil, err
	}

	var allSessions []Session
	if err := json.Unmarshal(data, &allSessions); err != nil {
		s.logger.Error("Failed to unmarshal sessions", zap.Error(err))
		return nil, nil, err
	}

	var events []Session
	for _, s := range allSessions {
		if s.SessionName == "Race" || s.SessionName == "Sprint" {
			events = append(events, s)
		}
	}

	sort.Slice(events, func(i, j int) bool { return events[i].DateStart < events[j].DateStart })
	s.logger.Debug("Filtered and sorted sessions", zap.Int("total_sessions", len(events)))

	resultsMap := make(map[int][]SessionResult)
	var mu sync.Mutex
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 3)

	for _, session := range events {
		wg.Add(1)
		go func(session Session) {
			defer wg.Done()

			semaphore <- struct{}{}
			s.mu.Lock()
			<-s.rateLimiter.C
			s.mu.Unlock()

			var resultData []byte
			var err error
			for i := 0; i < 3; i++ {
				resultData, err = s.FetchJSON(ctx, func(ctx context.Context) ([]byte, error) {
					return s.DS.GetResultBySession(ctx, session.SessionKey)
				})
				if err == nil {
					break
				}
				time.Sleep(time.Duration(i+1) * time.Second)
			}
			<-semaphore

			if err != nil {
				s.logger.Warn("Failed to fetch session results", zap.Int("session_key", session.SessionKey), zap.Error(err))
				return
			}

			var results []SessionResult
			if err := json.Unmarshal(resultData, &results); err != nil {
				s.logger.Warn("Failed to unmarshal session results", zap.Int("session_key", session.SessionKey), zap.Error(err))
				return
			}

			mu.Lock()
			resultsMap[session.SessionKey] = results
			mu.Unlock()
			s.logger.Debug("Fetched session results", zap.Int("session_key", session.SessionKey), zap.Int("num_results", len(results)))
		}(session)
	}

	wg.Wait()
	s.logger.Info("Finished fetching all session results", zap.Int("total_sessions", len(events)))
	return events, resultsMap, nil
}
