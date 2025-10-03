import { NextRaceApiResponse } from "@/types/race";

const API_BASE_URL = "http://localhost:8080/api/v1";

export class OverviewService {
  private static async fetchData<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  static async getNextRace(): Promise<NextRaceApiResponse> {
    return this.fetchData<NextRaceApiResponse>(`${API_BASE_URL}/race/next`);
  }
}
