export interface Weather {
  air_pressure: number;
  cloud_cover: number;
  condition: string;
  heat_index: number;
  humidity: number;
  icon: string;
  precipitation_amount: number;
  precipitation_percent: number;
  precipitation_type: string;
  start_date: string;
  temperature: number;
  thunderstorm_probability: number;
  visibility_distance: number;
}

export interface Session {
  type: string; // e.g. "Practice", "Qualifying", "Race"
  name: string; // e.g. "Practice 1"
  start_date: string;
  end_date: string;
  gmt_offset: string;
  session_key: number;
  path: string;
  replay_saved_at: string | null;
  replay_size: number;
  grandprix_id: number;
  weathers: Weather[];
}

export interface Circuit {
  name: string;
  track_url: string;
  map_url: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  country_flag_image_url: string;
  circuit_svg_url: string;
  info: {
    key: string;
    value: string;
    annotation: string;
  }[];
}

export interface Race {
  title: string;
  year: number;
  round: number;
  name: string; // e.g. "Azerbaijan Grand Prix"
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

// /race/next API response
export interface NextRaceApiResponse {
  data: Race;
  message: string;
}
