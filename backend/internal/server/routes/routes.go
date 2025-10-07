package routes

import (
	"lovdlwlrma/backend/internal/log"
	"lovdlwlrma/backend/internal/server/controller"
	openf1controller "lovdlwlrma/backend/internal/server/controller/openf1"
	racecontroller "lovdlwlrma/backend/internal/server/controller/race"
	raceservice "lovdlwlrma/backend/internal/server/service/race"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

const (
	raceAPI = "https://api.f1cosmos.com/schedules"
)

// RegisterRoutes registers all application routes.
func RegisterRoutes(rg *gin.RouterGroup) {
	controller.RegisterHealthRoutes(rg)

	// OpenF1 API endpoints
	f1logger := log.With(zap.String("service", "openf1"))
	openf1controller.RegisterOpenF1SessionRoutes(rg, f1logger)
	openf1controller.RegisterOpenF1MeetingRoutes(rg, f1logger)
	openf1controller.RegisterOpenF1DriverRoutes(rg, f1logger)
	openf1controller.RegisterOpenF1TelemetryRoutes(rg, f1logger)
	openf1controller.RegisterOpenF1LapsRoutes(rg, f1logger)
	openf1controller.RegisterOpenF1PositionRoutes(rg, f1logger)
	openf1controller.RegisterOpenF1StartGridRoutes(rg, f1logger)
	openf1controller.RegisterOpenF1StintsRoutes(rg, f1logger)
	openf1controller.RegisterOpenF1ResultRoutes(rg, f1logger)
	openf1controller.RegisterOpenF1RaceControlRoutes(rg, f1logger)
	openf1controller.RegisterOpenF1StandingsRoutes(rg, f1logger)

	// Race endpoints
	raceLogger := log.With(zap.String("service", "race"))
	raceService := raceservice.NewService(raceAPI, raceLogger)
	racecontroller.RegisterRaceRoutes(rg, raceLogger, raceService)
}
