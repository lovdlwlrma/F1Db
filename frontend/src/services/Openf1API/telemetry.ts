import { baseApiClient } from "@/services/baseApiClient";
import { TelemetryLap } from "@/types/Openf1API/telemetry";

export class OpenF1Service extends baseApiClient {
  // ========== Telemetry ==========
  static async getTelemetry(
    sessionKey: number,
    driverNumber: number,
    lapNumber: number,
  ): Promise<TelemetryLap> {
    return this.fetchData<TelemetryLap>(
      this.getUrl(
        `/openf1/telemetry/${sessionKey}/${driverNumber}/${lapNumber}`,
      ),
    );
  }
}
