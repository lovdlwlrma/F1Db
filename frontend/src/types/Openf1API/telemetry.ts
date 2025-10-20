export type TelemetryLap = {
  LapNumber: number;
  StartTime: string; // ISO 8601
  EndTime: string; // ISO 8601
  TelemetryData: TelemetryData[];
};

export type TelemetryData = {
  date: string; // ISO 8601 字串
  driver_number: number;
  speed: number;
  rpm: number;
  n_gear: number;
  throttle: number;
  brake: number;
  drs: number;
};

export type TelemetryLaps = TelemetryLap[];
