export interface LiveTimingData {
  session: SessionData;
  weather: WeatherData;
  raceControl: RaceControlData[];
  drivers: DriversData[];
}

export interface SessionData {
  name: string;
  flagURL: string;
  type: string;
  trackStatus: string;
  lapsCompleted: number;
  totalLaps: number;
}

export interface WeatherData {
  airTemp: number;
  humidity: number;
  pressure: number;
  rainfall: number;
  trackTemp: number;
  windDirection: number;
  windSpeed: number;
}

export interface RaceControlData {
  category: string;
  flag?: string;
  lap: number;
  message: string;
  scope?: string;
  sector?: number;
  utc: string;
}

export interface DriversData {
  position: number;
  driverCode: string;
  driverNumber: string;
  teamColour: string;
  teamLogo?: string;
  leaderGap: string;
  intervalGap: string;
  tyreCompound: "SOFT" | "MEDIUM" | "HARD" | "INTER" | "WET";
  tyreAge: string;
  bestLap?: string;
  lastLap?: {
    overallFastest: boolean;
    personalFastest: boolean;
    value: string;
  };
  Sectors?: {
    overallFastest: boolean;
    personalFastest: boolean;
    previousValue: string;
    segments: {
      Status: number;
    }[];
    stopped: boolean;
    value: string;
  }[];
  bestSectors: {
    Position: number;
    Value: string;
  }[];
  isPit?: boolean;
  pitStops?: number;
  pitInfo?: number;
  topSpeed?: {
    FL: number;
    I1: number;
    I2: number;
    ST: number;
  };
}
