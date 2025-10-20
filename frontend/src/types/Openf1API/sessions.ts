export type Session = {
  meeting_key: number;
  session_key: number;
  location: string;
  date_start: string; // ISO 8601 字串
  date_end: string; // ISO 8601 字串
  session_type: string;
  session_name: string;
  country_key: number;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  gmt_offset: string; // "08:00:00" 字串
  year: number;
};

export type Sessions = Session[];
