export type RaceControl = {
  meeting_key: number;
  session_key: number;
  date: string; // ISO 8601 字串
  driver_number: number | null; // null 表示全場
  lap_number: number;
  category: string; // 事件類型，例如 "Flag"
  flag: string; // 旗號顏色，例如 "GREEN"
  scope: string; // 事件範圍，例如 "Track"
  sector: string | null; // 資料可能為 null
  message: string; // 事件訊息
};

export type RaceControls = RaceControl[];
