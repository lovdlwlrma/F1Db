export type SeasonStanding = {
  year: number;
  total_rounds: number;
  locations: string[]; // 每場比賽標識
  driver_standings: DriverStanding[];
};

export type DriverStanding = {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string; // Hex 色碼
  headshot_url: string;
  round_points: number[]; // 每場比賽獲得的積分
  cumulative_points: number[]; // 累積積分
  positions: number[]; // 每場比賽排名 (-1 代表未參加或 DNF)
};
