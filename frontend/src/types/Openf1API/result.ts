export type RaceResult = {
  position: number; // 最終名次
  driver_number: number;
  number_of_laps: number; // 完成圈數
  points: number; // 得分
  dnf: boolean; // Did Not Finish
  dns: boolean; // Did Not Start
  dsq: boolean; // Disqualified
  duration: number; // 比賽用時，單位秒
  gap_to_leader: number; // 與領先者差距，單位秒
  meeting_key: number;
  session_key: number;
};

export type RaceResults = RaceResult[];
