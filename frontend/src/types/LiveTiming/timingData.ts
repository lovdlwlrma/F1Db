export interface TimingData {
  Lines: Record<string, TimingDataLine>;
  Withheld: boolean;
  _kf: boolean;
}

export interface TimingDataLine {
  BestLapTime?: BestLapTime;
  GapToLeader?: string;
  InPit?: boolean;
  IntervalToPositionAhead?: IntervalToPositionAhead;
  LastLapTime?: LastLapTime;
  Line: number;
  NumberOfLaps?: number;
  NumberOfPitStops?: number;
  PitOut?: boolean;
  Position?: string;
  RacingNumber: string;
  Retired?: boolean;
  Sectors?: Sector[];
  ShowPosition?: boolean;
  Speeds?: Speeds;
  Status?: number;
  Stopped?: boolean;
  TimeDiffToFastest?: string;
  TimeDiffToPositionAhead?: string;
}

export interface BestLapTime {
  Lap?: number;
  Value: string;
}

export interface IntervalToPositionAhead {
  Catching?: boolean;
  Value: string;
}

export interface LastLapTime {
  OverallFastest?: boolean;
  PersonalFastest?: boolean;
  Status?: number;
  Value: string;
}

export interface Sector {
  OverallFastest?: boolean;
  PersonalFastest?: boolean;
  PreviousValue?: string;
  Segments?: Segment[];
  Status?: number;
  Stopped?: boolean;
  Value: string;
}

export interface Segment {
  Status: number;
}

export interface Speeds {
  FL?: Speed;
  I1?: Speed;
  I2?: Speed;
  ST?: Speed;
}

export interface Speed {
  OverallFastest?: boolean;
  PersonalFastest?: boolean;
  Status?: number;
  Value: string;
}
