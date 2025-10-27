export interface RaceControlMessages {
  Messages: RaceControlMessage[];
  _kf: boolean;
}

export interface RaceControlMessage {
  Category: string;
  Flag: string;
  Lap: number;
  Message: string;
  Scope: string;
  Sector: number;
  Utc: string;
}
