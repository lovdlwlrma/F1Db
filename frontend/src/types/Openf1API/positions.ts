export type Position = {
  lap: number;
  dnf: boolean[]; // 每位車手是否 DNF
  rank: number[]; // 每位車手的排名
};

export type Positions = Position[];
