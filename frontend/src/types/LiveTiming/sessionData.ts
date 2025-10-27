export interface SessionData {
  Series: Series[];
  StatusSeries: StatusSeries[];
  _kf: boolean;
}

export interface Series {
  Lap: number;
  Utc: string;
}

export interface StatusSeries {
  TrackStatus?: string;
  Utc: string;
}
