export interface TimingStats {
  Lines: Record<string, TimingStatsLines>;
  SessionType: string;
  Withheld: boolean;
  _kf: boolean;
}

export interface TimingStatsLines {
  BestSectors?: BestSectors[];
  BestSpeeds?: BestSpeeds;
  Line: number;
  PersonalBestLapTime?: LapTimeBest;
  RacingNumber: string;
}

export interface BestSectors {
  Position?: number; // JSON may not have this field
  Value: string;
}

export interface BestSpeeds {
  FL?: SpeedBest;
  I1?: SpeedBest;
  I2?: SpeedBest;
  ST?: SpeedBest;
}

export interface SpeedBest {
  Position?: number;
  Value: string;
}

export interface LapTimeBest {
  Lap?: number;
  Position?: number;
  Value: string;
}
