import { baseApiClient } from "@/services/baseApiClient";
import { SeasonStanding } from "@/types/Openf1API/standings";

export class OpenF1Service extends baseApiClient {
  // ========== Standings ==========
  static async getStandings(year: number): Promise<SeasonStanding[]> {
    const data = await this.fetchData<SeasonStanding | SeasonStanding[]>(
      this.getUrl(`/openf1/standings/${year}`),
    );
    return Array.isArray(data) ? data : [data];
  }
}
