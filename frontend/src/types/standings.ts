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
