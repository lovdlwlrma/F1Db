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

// Race 完整結構，保留原始 JSON 欄位
type Race struct {
	Title       string     `json:"title"`
	Year        int        `json:"year"`
	Round       int        `json:"round"`
	Name        string     `json:"name"` // GrandPrix 名稱
	Country     string     `json:"country"`
	City        string     `json:"city"`
	CountryFlag string     `json:"country_flag_image_url"`
	StartDate   *time.Time `json:"start_date"`
	EndDate     *time.Time `json:"end_date"`
	GmtOffset   string     `json:"gmt_offset"`
	MeetingKey  int        `json:"meeting_key"`
	CircuitID   int        `json:"circuit_id"`
	Circuit     Circuit    `json:"circuit"`
	Sessions    []Session  `json:"sessions"`
}

// Circuit 賽道資訊完整
type Circuit struct {
	Name             string  `json:"name"`
	TrackURL         string  `json:"track_url"`
	MapURL           string  `json:"map_url"`
	Latitude         float64 `json:"latitude"`
	Longitude        float64 `json:"longitude"`
	Country          string  `json:"country"`
	City             string  `json:"city"`
	CountryFlagImage string  `json:"country_flag_image_url"`
	CircuitSVG       string  `json:"circuit_svg_url"`
	Info             []struct {
		Key        string `json:"key"`
		Value      string `json:"value"`
		Annotation string `json:"annotation"`
	} `json:"info"`
}

// Session 場次完整
type Session struct {
	Type          string     `json:"type"`
	Name          string     `json:"name"`
	StartDate     *time.Time `json:"start_date"`
	EndDate       *time.Time `json:"end_date"`
	GmtOffset     string     `json:"gmt_offset"`
	SessionKey    int        `json:"session_key"`
	Path          string     `json:"path"`
	ReplaySavedAt *time.Time `json:"replay_saved_at"`
	ReplaySize    int64      `json:"replay_size"`
	GrandPrixID   int        `json:"grandprix_id"`
	Weathers      []any      `json:"weathers"` // 先用 any，未來可以改成結構
}

// API 回傳
type apiResponse struct {
	Result string  `json:"result"`
	Data   []*Race `json:"data"`
}

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
