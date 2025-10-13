package race

import (
	"encoding/json"
	"errors"
	"net/http"
	"sort"
	"strconv"
	"time"

	"go.uber.org/zap"
)

// Service handles race-related operations
type Service struct {
	apiURL string
	logger *zap.Logger
}

// NewService 建立 service
func NewService(apiURL string, logger *zap.Logger) *Service {
	return &Service{apiURL: apiURL, logger: logger}
}

// fetchRaces 從 API 抓取賽程
func (s *Service) fetchRaces(year int) ([]*Race, error) {
	url := s.apiURL + "/" + strconv.Itoa(year)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, errors.New("failed to fetch schedules: " + resp.Status)
	}

	var apiResp apiResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, err
	}

	return apiResp.Data, nil
}

// GetNextRace 拿到下一場完整資訊
func (s *Service) GetNextRace() (*Race, error) {
	races, err := s.fetchRaces(time.Now().Year())
	if err != nil {
		return nil, err
	}

	now := time.Now()
	var upcoming []*Race
	for _, r := range races {
		if r.StartDate != nil && r.StartDate.After(now) {
			upcoming = append(upcoming, r)
		}
	}

	if len(upcoming) == 0 {
		return nil, nil
	}

	sort.Slice(upcoming, func(i, j int) bool {
		return upcoming[i].StartDate.Before(*upcoming[j].StartDate)
	})

	return upcoming[0], nil
}

// GetAllRaces 拿到完整賽歷資訊 (map[round]*Race)
func (s *Service) GetAllRaces() (map[int]*Race, error) {
	races, err := s.fetchRaces(time.Now().Year())
	if err != nil {
		return nil, err
	}

	raceMap := make(map[int]*Race)
	for _, r := range races {
		raceMap[r.Round] = r
	}
	return raceMap, nil
}
