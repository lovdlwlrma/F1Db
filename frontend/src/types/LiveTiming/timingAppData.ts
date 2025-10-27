export interface TimingAppData {
  Lines: Record<string, TimingAppDataLines>;
  _kf: boolean;
}

export interface TimingAppDataLines {
  GridPos?: string;
  Line: number;
  RacingNumber: string;
  Stints: Stint[];
}

export interface Stint {
  Compound: string;
  LapFlags: number;
  LapNumber: number;
  LapTime: string;
  New: string; // "true"/"false"
  StartLaps: number;
  TotalLaps: number;
  TyresNotChanged: string; // "0"/"1"
}
