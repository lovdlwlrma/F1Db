import { baseApiClient } from "@/services/baseApiClient";
import { RaceControl } from "@/types/Openf1API/raceControl";

export class OpenF1Service extends baseApiClient {
  // ========== Race Control ==========
  static async getRaceControlbySession(
    sessionKey: number,
  ): Promise<RaceControl[]> {
    return this.fetchData<RaceControl[]>(
      this.getUrl(`/openf1/race_control/${sessionKey}`),
    );
  }
}
