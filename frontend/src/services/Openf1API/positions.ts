import { baseApiClient } from "@/services/baseApiClient";
import { Position } from "@/types/Openf1API/positions";

export class OpenF1Service extends baseApiClient {
  // ========== Positions ==========
  static async getPositionsbySession(sessionKey: number): Promise<Position[]> {
    return this.fetchData<Position[]>(
      this.getUrl(`/openf1/position/${sessionKey}`),
    );
  }
}
