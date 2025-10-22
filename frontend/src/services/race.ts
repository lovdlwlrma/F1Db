import { NextRaceApiResponse, ScheduleData } from "@/types/race";
import { baseApiClient } from "./baseApiClient";

interface BackendApiResponse {
  count: number;
  data: { [key: string]: any };
  message: string;
}

export class RaceService extends baseApiClient {
  // ========== Next Race ==========
  static async getNextRace(): Promise<NextRaceApiResponse> {
    return this.fetchData<NextRaceApiResponse>(this.getUrl("/race/next"));
  }

  // ========== Schedule ==========
  static async getSchedule(year: number): Promise<ScheduleData> {
    try {
      console.log("Fetching schedule for year:", year);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(this.getUrl("/race/all"), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch schedule: ${response.status} ${response.statusText}`,
        );
      }

      const apiResponse: BackendApiResponse = await response.json();
      console.log("API Response:", apiResponse);

      if (!apiResponse.data) {
        throw new Error("Invalid API response: data is missing");
      }

      // 將物件轉換成陣列
      const racesArray = Object.values(apiResponse.data);
      console.log("Successfully parsed data, races count:", racesArray.length);

      return {
        year: year,
        races: racesArray,
      };
    } catch (error) {
      console.error("Error in RaceService.getSchedule:", error);
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
      }
      throw error;
    }
  }
}
