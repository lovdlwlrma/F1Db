export interface SeasonData {
  year: number;
  total_rounds: number;
  locations: string[];
  driver_standings: DriverStanding[];
}

export interface DriverStanding {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  headshot_url: string;
  round_points: number[];
  cumulative_points: number[];
  positions: number[];
}

export interface TeamStanding {
  team_name: string;
  team_colour: string;
  total_points: number;
  cumulative_points: number[];
  drivers: string[];
}

export interface DriverPositionStats {
  driver_name: string;
  team_name: string;
  team_colour: string;
  positions: number[];
  min: number;
  max: number;
  median: number;
  q1: number;
  q3: number;
}
