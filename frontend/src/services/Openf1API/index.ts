import { OpenF1Service as DriversService } from "./drivers";
import { OpenF1Service as LapsService } from "./laps";
import { OpenF1Service as MeetingsService } from "./meetings";
import { OpenF1Service as PositionService } from "./positions";
import { OpenF1Service as RaceControlService } from "./raceControl";
import { OpenF1Service as ResultService } from "./result";
import { OpenF1Service as SessionsService } from "./sessions";
import { OpenF1Service as StandingsService } from "./standings";
import { OpenF1Service as StintsService } from "./stints";
import { OpenF1Service as TelemetryService } from "./telemetry";

export const OpenF1 = {
  DriversService,
  LapsService,
  MeetingsService,
  PositionService,
  RaceControlService,
  ResultService,
  SessionsService,
  StandingsService,
  StintsService,
  TelemetryService,
};
