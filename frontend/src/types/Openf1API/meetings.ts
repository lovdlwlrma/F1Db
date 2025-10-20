export type Meeting = {
  meeting_key: number;
  circuit_key: number;
  circuit_short_name: string;
  meeting_code: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  meeting_name: string;
  meeting_official_name: string;
  gmt_offset: string; // "08:00:00" 字串
  date_start: string; // ISO 8601 字串
  year: number;
};

export type Meetings = Meeting[];
