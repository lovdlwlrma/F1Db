import { baseApiClient } from "@/services/baseApiClient";
import { Stints } from "@/types/Openf1API/stints";

export class OpenF1Service extends baseApiClient {
  // ========== Stints ==========
  static async getStintsbySession(sessionKey: number): Promise<Stints> {
    return this.fetchData<Stints>(this.getUrl(`/openf1/stints/${sessionKey}`));
  }
}
