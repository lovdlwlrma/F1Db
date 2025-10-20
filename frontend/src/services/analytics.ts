import { Meeting } from "@/types/Openf1API/meetings";
import { Session } from "@/types/Openf1API/sessions";
import { Driver } from "@/types/Openf1API/drivers";
import { Stints } from "@/types/Openf1API/stints";
import { RaceResult } from "@/types/Openf1API/result";
import { Position } from "@/types/Openf1API/positions";
import { RaceControl } from "@/types/Openf1API/raceControl";

const API_BASE_URL = "http://localhost:8080/api/v1";

export class AnalyticsService {
  private static async fetchData<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Meetings
  static async getMeetings(year: number): Promise<Meeting[]> {
    return this.fetchData<Meeting[]>(
      `${API_BASE_URL}/openf1/meetings/year/${year}`,
    );
  }

  // Sessions
  static async getSessions(meetingKey: number): Promise<Session[]> {
    return this.fetchData<Session[]>(
      `${API_BASE_URL}/openf1/sessions/meeting/${meetingKey}`,
    );
  }

  // Drivers
  static async getDrivers(sessionKey: number): Promise<Driver[]> {
    return this.fetchData<Driver[]>(
      `${API_BASE_URL}/openf1/drivers/sessions/${sessionKey}`,
    );
  }

  static async getRaceSession(meetingKey: number): Promise<Session[]> {
    return this.fetchData<Session[]>(
      `${API_BASE_URL}/openf1/sessions/race/${meetingKey}`,
    );
  }

  // Lap Rankings
  static async getLapRankings(sessionKey: number): Promise<Position[]> {
    const url = `${API_BASE_URL}/openf1/position/${sessionKey}`;
    return this.fetchData<Position[]>(url);
  }

  // Stints
  static async getStints(sessionKey: number): Promise<Stints[]> {
    return this.fetchData<Stints[]>(
      `${API_BASE_URL}/openf1/stints/${sessionKey}`,
    );
  }

  static async getResult(sessionKey: number): Promise<RaceResult[]> {
    return this.fetchData<RaceResult[]>(
      `${API_BASE_URL}/openf1/result/${sessionKey}`,
    );
  }

  // Race Control
  static async getRaceControl(sessionKey: number): Promise<RaceControl[]> {
    return this.fetchData<RaceControl[]>(
      `${API_BASE_URL}/openf1/race_control/${sessionKey}`,
    );
  }
}
