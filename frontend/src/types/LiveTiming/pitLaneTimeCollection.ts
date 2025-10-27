export interface PitLaneTimeCollection {
  PitTimes: PitTimes;
  _kf: boolean;
}

export interface PitTimes {
  [racingNumber: string]: PitTime;
}

export interface PitTime {
  Duration: string;
  Lap: string;
  RacingNumber: string;
}
