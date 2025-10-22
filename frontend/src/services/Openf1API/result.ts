import { baseApiClient } from "@/services/baseApiClient";
import { RaceResult } from "@/types/Openf1API/result";

export class OpenF1Service extends baseApiClient {
  // ========== Results ==========
  static async getResultbySession(sessionKey: number): Promise<RaceResult[]> {
    return this.fetchData<RaceResult[]>(
      this.getUrl(`/openf1/result/${sessionKey}`),
    );
  }
}
