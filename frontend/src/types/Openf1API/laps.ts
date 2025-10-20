export type Lap = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  lap_number: number;
  date_start: string | null; // ISO 字串或 null
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number;
  i2_speed: number;
  is_pit_out_lap: boolean;
  lap_duration: number | null;
  segments_sector_1: number[];
  segments_sector_2: number[];
  segments_sector_3: number[];
  st_speed: number;
};

export type Laps = Lap[];
