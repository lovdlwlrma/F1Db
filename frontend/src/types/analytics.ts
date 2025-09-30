export interface PositionEntry {
    date: string; // ISO string
    driver_number: number;
    position: number;
    session_key: number;
    meeting_key: number;
}

export type PositionResponse = Record<string, PositionEntry[]>;

export interface Session {
    session_key: number;
    meeting_key: number;
    name?: string;
    track?: string;
    date?: string;
}

export interface LapRanking {
    lap: number;
    rank: number[];
    dnf: boolean[];
}

export type SessionLapRankingResponse = LapRanking[];

export interface Driver {
    driver_number: number;
    full_name: string;
    team_name: string;
    team_colour: string;
    name_acronym: string;
}

export interface Stints {
    compound: string;
    driver_number: number;
    lap_end: number;
    lap_start: number;
    meeting_key: number;
    session_key: number;
    stint_number: number;
    tyre_age_at_start: number;
}

export type SessionStintsResponse = Stints[];

export interface Result {
    driver_number: number;
    position: number;
    dnf: boolean;
    dns: boolean;
    dsq: boolean;
}

export type SessionResultResponse = Result[];

export interface TeamStats {
    teamName: string;
    teamColor: string;
    points: number;
    drivers: Array<{
        driverNumber: number;
        name: string;
        position: number | undefined;
        points: number;
        dnf: boolean;
        dns: boolean;
        dsq: boolean;
    }>;
}

export interface RaceControl {
    meeting_key: number;
    session_key: number;
    date: string;
    driver_number: number | null;
    lap_number: number;
    category: string;
    flag: string | null;
    scope: string | null;
    sector: string | null;
    message: string;
  }

export type SessionRaceControlResponse = RaceControl[];