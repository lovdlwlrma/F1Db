import { baseApiClient } from "@/services/baseApiClient";
import { Meeting } from "@/types/Openf1API/meetings";

export class OpenF1Service extends baseApiClient {
  // ========== Meetings ==========
  static async getMeetingsbyLatest(): Promise<Meeting[]> {
    return this.fetchData<Meeting[]>(this.getUrl(`/openf1/meetings/latest`));
  }

  static async getMeetingsbyYear(year: number): Promise<Meeting[]> {
    return this.fetchData<Meeting[]>(
      this.getUrl(`/openf1/meetings/year/${year}`),
    );
  }
}
