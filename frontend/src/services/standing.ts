import { baseApiClient } from "@/services/baseApiClient";
import { TeamStanding, DriverPositionStats } from "@/types/standings";
import { SeasonStanding } from "@/types/Openf1API/standings";
import { OpenF1Service } from "@/services/Openf1API/standings";

export class StandingsService extends baseApiClient {
  /**
   * 獲取車手積分榜數據
   */
  static async getDriverStandings(year: number): Promise<SeasonStanding[]> {
    return OpenF1Service.getStandings(year);
  }

  /**
   * 計算車隊積分
   */
  static calculateTeamStandings(
    seasonStanding: SeasonStanding,
  ): TeamStanding[] {
    const teamsMap = new Map<string, TeamStanding>();

    seasonStanding.driver_standings.forEach((driver) => {
      if (!teamsMap.has(driver.team_name)) {
        teamsMap.set(driver.team_name, {
          team_name: driver.team_name,
          team_colour: driver.team_colour,
          total_points: 0,
          cumulative_points: new Array(seasonStanding.total_rounds).fill(0),
          drivers: [],
        });
      }

      const team = teamsMap.get(driver.team_name)!;
      team.drivers.push(driver.name_acronym);
      team.total_points +=
        driver.cumulative_points[driver.cumulative_points.length - 1] || 0;

      // 累積每場比賽的車隊積分
      driver.cumulative_points.forEach((points, index) => {
        team.cumulative_points[index] += points;
      });
    });

    return Array.from(teamsMap.values()).sort(
      (a, b) => b.total_points - a.total_points,
    );
  }

  /**
   * 計算車手位置統計(Box Plot 數據)
   */
  static calculatePositionStats(
    seasonStanding: SeasonStanding,
  ): DriverPositionStats[] {
    return seasonStanding.driver_standings
      .map((driver) => {
        // 過濾掉無效位置(-1, 0)
        const validPositions = driver.positions.filter((pos) => pos > 0);
        const sorted = [...validPositions].sort((a, b) => a - b);

        const calculateMedian = (arr: number[]): number => {
          const mid = Math.floor(arr.length / 2);
          return arr.length % 2 === 0
            ? (arr[mid - 1] + arr[mid]) / 2
            : arr[mid];
        };

        const calculateQuartile = (arr: number[], quartile: number): number => {
          const pos = (arr.length - 1) * quartile;
          const base = Math.floor(pos);
          const rest = pos - base;
          if (arr[base + 1] !== undefined) {
            return arr[base] + rest * (arr[base + 1] - arr[base]);
          }
          return arr[base];
        };

        return {
          driver_name: driver.name_acronym,
          team_name: driver.team_name,
          team_colour: driver.team_colour,
          positions: validPositions,
          min: Math.min(...validPositions),
          max: Math.max(...validPositions),
          median: calculateMedian(sorted),
          q1: calculateQuartile(sorted, 0.25),
          q3: calculateQuartile(sorted, 0.75),
        };
      })
      .sort((a, b) => a.median - b.median);
  }
}
