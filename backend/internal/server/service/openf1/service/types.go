package service

import (
	"lovdlwlrma/backend/internal/server/service/openf1/datasource"
	"time"
)

// ===== 基礎資料結構 =====

// Meeting 表示大獎賽會議
type Meeting struct {
	MeetingKey  int    `json:"meeting_key"`
	MeetingName string `json:"meeting_name"`
}

// Session 表示賽事 session (練習賽、排位賽、正賽等)
type Session struct {
	SessionKey  int    `json:"session_key"`
	SessionName string `json:"session_name"`
	SessionType string `json:"session_type"`
	DateStart   string `json:"date_start"`
	DateEnd     string `json:"date_end"`
	CircuitKey  int    `json:"circuit_key"`
	CircuitName string `json:"circuit_short_name"`
	MeetingKey  int    `json:"meeting_key"`
	CountryName string `json:"country_name"`
	Location    string `json:"location"`
	Year        int    `json:"year"`
}

// Driver 表示車手基本資訊
type Driver struct {
	DriverNumber int    `json:"driver_number"`
	FullName     string `json:"full_name"`
	NameAcronym  string `json:"name_acronym"`
	Team         string `json:"team_name"`
	Color        string `json:"team_colour"`
	HeadShotURL  string `json:"headshot_url"`
}

// ===== 比賽記錄資料結構 =====

// SessionResult 表示單場比賽的結果
type SessionResult struct {
	Position     int     `json:"position"`
	DriverNumber int     `json:"driver_number"`
	NumberOfLaps int     `json:"number_of_laps"`
	Points       float64 `json:"points"`
	DNF          bool    `json:"dnf"`
	DNS          bool    `json:"dns"`
	DSQ          bool    `json:"dsq"`
	Duration     float64 `json:"duration"`
	MeetingKey   int     `json:"meeting_key"`
	SessionKey   int     `json:"session_key"`
	TeamName     string  `json:"team_name"`
	FullName     string  `json:"full_name"`
}

// PositionRecord 表示位置記錄
type PositionRecord struct {
	Date         time.Time `json:"date"`
	DriverNumber int       `json:"driver_number"`
	Position     int       `json:"position"`
	SessionKey   int       `json:"session_key"`
	MeetingKey   int       `json:"meeting_key"`
}

// LapRecord 表示單圈記錄
type LapRecord struct {
	DateStart    time.Time `json:"date_start"`
	DriverNumber int       `json:"driver_number"`
	LapNumber    int       `json:"lap_number"`
	SessionKey   int       `json:"session_key"`
	MeetingKey   int       `json:"meeting_key"`
	LapDuration  float64   `json:"lap_duration"`
	IsDNF        bool      `json:"is_dnf"`
}

// StintRecord 表示輪胎 stint 記錄
type StintRecord struct {
	Compound       string `json:"compound"`
	DriverNumber   int    `json:"driver_number"`
	LapEnd         int    `json:"lap_end"`
	LapStart       int    `json:"lap_start"`
	MeetingKey     int    `json:"meeting_key"`
	SessionKey     int    `json:"session_key"`
	StintNumber    int    `json:"stint_number"`
	TyreAgeAtStart int    `json:"tyre_age_at_start"`
}

// ===== 遙測資料結構 =====

// LapData 表示單圈的遙測資料
type LapData struct {
	LapNumber     int
	StartTime     string
	EndTime       string
	TelemetryData []datasource.CarData
}

// ===== 積分榜相關資料結構 =====
// StandingsHistory 包含車手和車隊的完整積分歷史
type StandingsHistory struct {
    Year              int                       `json:"year"`
    TotalRounds       int                       `json:"total_rounds"`
    Locations         []string                  `json:"locations"`          // 所有站點名稱 (共用)
    DriverStandings   []DriverPointHistory      `json:"driver_standings"`   // 車手積分榜
}

// DriverPointHistory 車手積分歷史 (簡化版)
type DriverPointHistory struct {
    DriverNumber     int       `json:"driver_number"`
    FullName         string    `json:"full_name"`
	NameAcronym      string    `json:"name_acronym"`
    TeamName         string    `json:"team_name"`
	Color            string    `json:"team_colour"`
	HeadShotURL      string    `json:"headshot_url"`
    RoundPoints      []float64 `json:"round_points"`      // 每站獲得的積分
    CumulativePoints []float64 `json:"cumulative_points"` // 每站後的累積積分
    Positions        []int     `json:"positions"`         // 每站後的排名
}