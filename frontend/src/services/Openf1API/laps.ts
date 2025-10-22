import { baseApiClient } from "@/services/baseApiClient";
import { Lap } from "@/types/Openf1API/laps";

export class OpenF1Service extends baseApiClient {
  // ========== Laps ==========
  static async getLaps(
    sessionKey: number,
    driverNumber: number,
  ): Promise<Lap[]> {
    return this.fetchData<Lap[]>(
      this.getUrl(`/openf1/laps/${sessionKey}/${driverNumber}`),
    );
  }
}
