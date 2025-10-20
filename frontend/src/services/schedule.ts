import { ScheduleData } from "@/types/race";

// 後端回傳的格式
interface BackendApiResponse {
  count: number;
  data: { [key: string]: any }; // data 是物件不是陣列
  message: string;
}

export class ScheduleService {
  // 使用你的後端 API
  private static readonly BASE_URL = "http://localhost:8080/api/v1"; // 改成你的後端路徑

  static async getSchedule(year: number): Promise<ScheduleData> {
    try {
      console.log("Fetching schedule for year:", year);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${this.BASE_URL}/race/all`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

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
      console.error("Error in ScheduleService.getSchedule:", error);
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
      }
      throw error;
    }
  }
}
