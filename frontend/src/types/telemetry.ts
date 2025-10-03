export interface Meeting {
  meeting_key: number;
  meeting_name: string;
}

export interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
}

export interface Race {
  year: number;
  name: string;
  title: string;
  country: string;
  circuit?: { name: string };
  country_flag_image_url?: string;
  start_date?: string;
}

export interface Driver {
  driver_number: number;
  full_name: string;
  team_name: string;
  team_colour: string;
}

export interface LapData {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  lap_number: number;
  date_start: string | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  is_pit_out_lap: boolean;
  lap_duration: number | null;
  segments_sector_1: number[];
  segments_sector_2: number[];
  segments_sector_3: number[];
  st_speed: number | null;
}

export interface CarData {
  LapNumber: number;
  StartTime: string;
  EndTime: string;
  TelemetryData: TelemetryData[];
}

export interface TelemetryData {
  date: string;
  speed: number;
  rpm: number;
  n_gear: number;
  throttle: number;
  brake: number;
  drs: number;
}
