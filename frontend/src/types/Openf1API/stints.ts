export type Stint = {
  compound: string; // 輪胎種類，例如 "INTERMEDIATE", "MEDIUM"
  driver_number: number;
  lap_start: number; // Stint 開始圈數
  lap_end: number; // Stint 結束圈數
  meeting_key: number;
  session_key: number;
  stint_number: number; // Stint 編號
  tyre_age_at_start: number; // 輪胎起始時使用圈數
};

export type StintsByDriver = Stint[];

export type Stints = Record<string, StintsByDriver>;
