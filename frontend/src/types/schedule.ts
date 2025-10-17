export interface Session {
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  gmt_offset: string;
  session_key: number;
  path?: string;
  replay_saved_at?: string;
  replay_size?: number;
  grandprix_id?: number;
  weathers?: any[];
}

export interface CircuitInfo {
  key: string;
  value: string | null;
  annotation: string | null;
}

export interface Circuit {
  name: string;
  track_url: string;
  map_url: string;
  info: CircuitInfo[];
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  country_flag_image_url: string;
  circuit_svg_url: string;
}

export interface Race {
  title: string;
  year: number;
  round: number;
  name: string;
  country: string;
  city: string;
  country_flag_image_url: string;
  start_date: string;
  end_date: string;
  gmt_offset: string;
  meeting_key: number;
  circuit_id: number;
  circuit: Circuit;
  sessions: Session[];
}

export interface ScheduleData {
  year: number;
  races: Race[];
}

export type ViewMode = "timeline" | "grid";
