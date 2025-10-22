import { baseApiClient } from "@/services/baseApiClient";
import { Session } from "@/types/Openf1API/sessions";

export class OpenF1Service extends baseApiClient {
  // ========== Sessions ==========
  static async getSessionsbyLatest(): Promise<Session[]> {
    return this.fetchData<Session[]>(
      this.getUrl(`/openf1/sessions/meeting/latest`),
    );
  }

  static async getSessionsbyYear(year: number): Promise<Session[]> {
    return this.fetchData<Session[]>(
      this.getUrl(`/openf1/sessions/year/${year}`),
    );
  }

  static async getSessionsbyMeeting(meetingKey: number): Promise<Session[]> {
    return this.fetchData<Session[]>(
      this.getUrl(`/openf1/sessions/meeting/${meetingKey}`),
    );
  }

  static async getRaceSessionbyMeeting(meetingKey: number): Promise<Session[]> {
    return this.fetchData<Session[]>(
      this.getUrl(`/openf1/sessions/race/${meetingKey}`),
    );
  }
}
