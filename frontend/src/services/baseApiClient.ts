const API_BASE_URL = "http://localhost:8080/api/v1";

export class baseApiClient {
  protected static async fetchData<T>(
    url: string,
    options?: RequestInit,
  ): Promise<T> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  protected static getUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
  }
}
