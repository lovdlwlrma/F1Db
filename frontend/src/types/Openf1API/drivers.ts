export type Driver = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string; // Hex 色碼字串
  first_name: string;
  last_name: string;
  headshot_url: string;
  country_code: string | null;
};

export type Drivers = Driver[];
