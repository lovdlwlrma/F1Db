import { baseApiClient } from "@/services/baseApiClient";
import { Driver } from "@/types/Openf1API/drivers";

export class OpenF1Service extends baseApiClient {
  // ========== Drivers ==========
  static async getDriversbyLatest(): Promise<Driver[]> {
    return this.fetchData<Driver[]>(this.getUrl(`/openf1/drivers/latest`));
  }

  static async getDriversbySession(sessionKey: number): Promise<Driver[]> {
    return this.fetchData<Driver[]>(
      this.getUrl(`/openf1/drivers/sessions/${sessionKey}`),
    );
  }

  static async getDriversbyNumber(number: number): Promise<Driver[]> {
    return this.fetchData<Driver[]>(
      this.getUrl(`/openf1/drivers/number/${number}`),
    );
  }
}
