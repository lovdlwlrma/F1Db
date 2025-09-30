package service

import (
	"lovdlwlrma/backend/internal/server/service/openf1/datasource"
	"time"
)

type LapData struct {
	LapNumber int
	StartTime string
	EndTime   string
	TelemetryData   []datasource.CarData
}

type TelemetryService struct {
	*BaseService
}

type Meeting struct {
    MeetingKey int    `json:"meeting_key"`
    MeetingName string `json:"meeting_name"`
}

type Session struct {
    SessionKey  int    `json:"session_key"`
    SessionName string `json:"session_name"`
    SessionType string `json:"session_type"`
}

type Driver struct {
	DriverNumber int    `json:"driver_number"`
	FullName     string `json:"full_name"`
	Team         string `json:"team"`
	Color        string `json:"color"`
}

type PositionRecord struct {
	Date         time.Time `json:"date"`
	DriverNumber int       `json:"driver_number"`
	Position     int       `json:"position"`
	SessionKey   int       `json:"session_key"`
	MeetingKey   int       `json:"meeting_key"`
}

type LapRecord struct {
	DateStart    time.Time `json:"date_start"`
	DriverNumber int       `json:"driver_number"`
	LapNumber    int       `json:"lap_number"`
	SessionKey   int       `json:"session_key"`
	MeetingKey   int       `json:"meeting_key"`
	LapDuration  float64   `json:"lap_duration"`
	IsDNF        bool      `json:"is_dnf"` 
}

type StintRecord struct {
	Compound         string `json:"compound"`
	DriverNumber     int    `json:"driver_number"`
	LapEnd           int    `json:"lap_end"`
	LapStart         int    `json:"lap_start"`
	MeetingKey       int    `json:"meeting_key"`
	SessionKey       int    `json:"session_key"`
	StintNumber      int    `json:"stint_number"`
	TyreAgeAtStart   int    `json:"tyre_age_at_start"`
}