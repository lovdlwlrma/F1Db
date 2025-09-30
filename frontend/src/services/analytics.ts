import { Meeting } from '@/types/telemetry';
import { LapRanking, Session, Driver, Stints, Result, RaceControl } from '@/types/analytics';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export class AnalyticsService {
    private static async fetchData<T>(url: string): Promise<T> {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return await response.json();
        } catch (error) {
          console.error('API request failed:', error);
          throw error;
        }
    }

    // Meetings
    static async getMeetings(year: number): Promise<Meeting[]> {
        return this.fetchData<Meeting[]>(`${API_BASE_URL}/openf1/meetings/year/${year}`);
    }

    // Sessions
    static async getSessions(meetingKey: number): Promise<Session[]> {
        return this.fetchData<Session[]>(`${API_BASE_URL}/openf1/sessions/meeting/${meetingKey}`);
    }

    // Drivers
    static async getDrivers(sessionKey: number): Promise<Driver[]> {
        return this.fetchData<Driver[]>(`${API_BASE_URL}/openf1/drivers/sessions/${sessionKey}`);
    }

    static async getRaceSession(meetingKey: number): Promise<Session[]> {
        return this.fetchData<Session[]>(`${API_BASE_URL}/openf1/sessions/race/${meetingKey}`);
    }

    // Lap Rankings
    static async getLapRankings(sessionKey: number): Promise<LapRanking[]> {
        const url = `${API_BASE_URL}/openf1/position/${sessionKey}`;
        return this.fetchData<LapRanking[]>(url);
    }

    // Stints
    static async getStints(sessionKey: number): Promise<Stints[]> {
        return this.fetchData<Stints[]>(`${API_BASE_URL}/openf1/stints/${sessionKey}`);
    }

    static async getResult(sessionKey: number): Promise<Result[]> {
        return this.fetchData<Result[]>(`${API_BASE_URL}/openf1/result/${sessionKey}`);
    }

    // Race Control
    static async getRaceControl(sessionKey: number): Promise<RaceControl[]> {
        return this.fetchData<RaceControl[]>(`${API_BASE_URL}/openf1/race_control/${sessionKey}`);
    }
}