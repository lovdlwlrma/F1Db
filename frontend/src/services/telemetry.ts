import { Meeting } from "@/types/Openf1API/meetings";
import { Session } from "@/types/Openf1API/sessions";
import { Driver } from "@/types/Openf1API/drivers";
import { Lap } from "@/types/Openf1API/laps";
import { TelemetryLap } from "@/types/Openf1API/telemetry";

const API_BASE_URL = "http://localhost:8080/api/v1";

export class TelemetryService {
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

  // Laps
  static async getLaps(
    sessionKey: number,
    driverNumber: number,
  ): Promise<Lap[]> {
    return this.fetchData<Lap[]>(
      `${API_BASE_URL}/openf1/laps/${sessionKey}/${driverNumber}`,
    );
  }

  // Telemetry
  static async getTelemetry(
    sessionKey: number,
    driverNumber: number,
    lapNumber: number,
  ): Promise<TelemetryLap> {
    return this.fetchData<TelemetryLap>(
      `${API_BASE_URL}/openf1/telemetry/${sessionKey}/${driverNumber}/${lapNumber}`,
    );
  }
}
