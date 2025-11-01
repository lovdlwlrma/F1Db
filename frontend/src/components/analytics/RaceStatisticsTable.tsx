import { useMemo } from "react";
import { Driver } from "@/types/Openf1API/drivers";
import { RaceResult } from "@/types/Openf1API/result";
import { Positions } from "@/types/Openf1API/positions";
import { TeamStats } from "@/types/analytics";
import { Trophy, Clock, Award, TrendingUp, AlertCircle } from "lucide-react";

const POINTS: number[] = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

interface Props {
  drivers: Driver[];
  results: RaceResult[];
  lapRankings: Positions | null;
  grandPrixName: string;
}

export default function RaceStatisticsTable({
  drivers,
  results,
  lapRankings,
}: Props) {
  const driverMap = useMemo(() => {
    const map: Record<number, Driver> = {};
    drivers.forEach((d) => (map[d.driver_number] = d));
    return map;
  }, [drivers]);

  // 計算車手積分
  const getDriverPoints = (
    position: number | undefined,
    dnf: boolean,
    dns: boolean,
    dsq: boolean,
  ): number => {
    if (dnf || dns || dsq || position === undefined || position > 10) return 0;
    return POINTS[position - 1] || 0;
  };

  // 過濾有效結果（排除 position 為 undefined 的）
  const validResults = useMemo(() => {
    return results.filter((r) => r.position !== undefined);
  }, [results]);

  // 計算車隊統計
  const teamStats = useMemo(() => {
    const teams: Record<string, TeamStats> = {};

    validResults.forEach((result) => {
      const driver = driverMap[result.driver_number];
      if (!driver) return;

      const points = getDriverPoints(
        result.position,
        result.dnf,
        result.dns,
        result.dsq,
      );

      if (!teams[driver.team_name]) {
        teams[driver.team_name] = {
          teamName: driver.team_name,
          teamColor: driver.team_colour,
          points: 0,
          drivers: [],
        };
      }

      teams[driver.team_name].points += points;
      teams[driver.team_name].drivers.push({
        driverNumber: result.driver_number,
        name: driver.full_name,
        position: result.position,
        points: points,
        dnf: result.dnf,
        dns: result.dns,
        dsq: result.dsq,
      });
    });

    // 為每個車隊的車手排序（按排名，undefined 放最後）
    Object.values(teams).forEach((team) => {
      team.drivers.sort((a, b) => {
        if (a.position === undefined) return 1;
        if (b.position === undefined) return -1;
        return a.position - b.position;
      });
    });

    // 按車隊積分排序
    return Object.values(teams).sort((a, b) => b.points - a.points);
  }, [validResults, driverMap]);

  // 獲取前三名車手（只計算有效排名的）
  const podiumDrivers = useMemo(() => {
    return validResults
      .filter(
        (r) =>
          r.position !== undefined &&
          r.position <= 3 &&
          !r.dnf &&
          !r.dns &&
          !r.dsq,
      )
      .sort((a, b) => a.position! - b.position!)
      .map((r) => ({
        ...r,
        driver: driverMap[r.driver_number],
        points: getDriverPoints(r.position, r.dnf, r.dns, r.dsq),
      }));
  }, [validResults, driverMap]);

  // 計算統計數據
  const raceStats = useMemo(() => {
    const finishers = validResults.filter(
      (r) => !r.dnf && !r.dns && !r.dsq,
    ).length;
    const dnfCount = results.filter((r) => r.dnf).length;
    const dnsCount = results.filter((r) => r.dns).length;
    const dsqCount = results.filter((r) => r.dsq).length;
    const totalDrivers = results.length;
    const validDrivers = validResults.length;
    const totalLaps = lapRankings?.length || 0;

    return {
      totalLaps,
      dnfCount,
      dnsCount,
      dsqCount,
      finishers,
      totalDrivers,
      validDrivers,
      completionRate:
        validDrivers > 0 ? Math.round((finishers / validDrivers) * 100) : 0,
    };
  }, [results, validResults, lapRankings]);

  const getStatusText = (result: {
    dnf: boolean;
    dns: boolean;
    dsq: boolean;
  }) => {
    if (result.dsq) return "DSQ";
    if (result.dns) return "DNS";
    if (result.dnf) return "DNF";
    return "Finished";
  };

  const getStatusColor = (result: {
    dnf: boolean;
    dns: boolean;
    dsq: boolean;
  }) => {
    if (result.dsq) return "bg-orange-500/20 text-orange-400";
    if (result.dns) return "bg-gray-500/20 text-gray-400";
    if (result.dnf) return "bg-red-500/20 text-red-400";
    return "bg-green-500/20 text-green-400";
  };

  // 檢查是否有資料
  const hasData = drivers.length > 0 && results.length > 0;

  // 空資料狀態
  if (!hasData) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-gray-500" />
          <h3 className="text-xl font-semibold text-white">
            No Race Results Available
          </h3>
          <p className="text-gray-400 max-w-md">
            Race results will be available some time after the race has
            finished. The chart may currently contain slight inaccuracies.
            Please select a different Grand Prix or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* 左側：領獎台 + 比賽統計 */}
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Podium
          </div>

          {podiumDrivers.length > 0 ? (
            <div className="space-y-3">
              {podiumDrivers.map((result, index) => {
                const positions = ["🥇", "🥈", "🥉"];
                const bgGradients = [
                  "from-yellow-500/20 to-yellow-600/10",
                  "from-gray-400/20 to-gray-500/10",
                  "from-amber-600/20 to-amber-700/10",
                ];

                return (
                  <div
                    key={result.driver_number}
                    className={`bg-gradient-to-r ${bgGradients[index]} border border-gray-600/50 rounded-xl p-4 hover:scale-105 transition-transform`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-3xl">{positions[index]}</span>
                        <div>
                          <div className="font-semibold text-white">
                            {result.driver?.full_name}
                          </div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: `#${result.driver?.team_colour}` }}
                          >
                            {result.driver?.team_name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          P{result.position}
                        </div>
                        <div className="text-sm text-gray-400">
                          {result.points} points
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-800/60 border border-gray-600/50 rounded-xl p-6 text-center">
              <p className="text-gray-400">Podium data not available yet</p>
            </div>
          )}

          {/* 比賽統計 */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2 text-xl font-semibold text-white">
              <TrendingUp className="w-6 h-6 text-green-500" />
              Race Statistics
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-blue-400">
                  {raceStats.totalLaps}
                </div>
                <div className="text-xs text-gray-300">Total Laps</div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-purple-400">
                  {raceStats.completionRate}%
                </div>
                <div className="text-xs text-gray-300">Completion Rate</div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-green-400">
                  {raceStats.finishers}
                </div>
                <div className="text-xs text-gray-300">Finishers</div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-red-400">
                  {raceStats.dnfCount}
                </div>
                <div className="text-xs text-gray-300">DNFs</div>
              </div>
            </div>

            {/* 額外統計 */}
            {(raceStats.dnsCount > 0 || raceStats.dsqCount > 0) && (
              <div className="grid grid-cols-2 gap-3">
                {raceStats.dnsCount > 0 && (
                  <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-gray-400">
                      {raceStats.dnsCount}
                    </div>
                    <div className="text-xs text-gray-300">DNS</div>
                  </div>
                )}

                {raceStats.dsqCount > 0 && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-orange-400">
                      {raceStats.dsqCount}
                    </div>
                    <div className="text-xs text-gray-300">DSQ</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 中間：車隊積分榜 */}
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
            <Award className="w-6 h-6 text-blue-500" />
            Team Points
          </div>

          {teamStats.length > 0 ? (
            <div className="space-y-3">
              {teamStats.slice(0, 5).map((team, index) => (
                <div
                  key={team.teamName}
                  className="bg-gray-800/60 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-800/80 transition-colors"
                  style={{ padding: "1.2rem" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-gray-400">
                        #{index + 1}
                      </div>
                      <div>
                        <div
                          className="font-semibold"
                          style={{ color: `#${team.teamColor}` }}
                        >
                          {team.teamName}
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {team.points} points
                    </div>
                  </div>

                  <div className="space-y-1">
                    {team.drivers.map((driver) => (
                      <div
                        key={`${team.teamName}-${driver.driverNumber}`}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-300">{driver.name}</span>
                        <span className="text-gray-400">
                          {driver.dnf && " DNF"} {driver.dns && " DNS"}{" "}
                          {driver.dsq && " DSQ"}
                          {driver.position !== undefined &&
                          driver.position !== null
                            ? `P${driver.position}`
                            : ""}{" "}
                          ({driver.points} points)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/60 border border-gray-600/50 rounded-xl p-6 text-center">
              <p className="text-gray-400">Team standings not available yet</p>
            </div>
          )}
        </div>

        {/* 右側：車手完賽詳情 */}
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
            <Clock className="w-6 h-6 text-green-500" />
            Finishers Details
          </div>

          {validResults.length > 0 ? (
            <div className="bg-gray-800/60 border border-gray-600/50 rounded-xl p-4 flex-1">
              <div className="space-y-2">
                {validResults
                  .sort((a, b) => {
                    const posA = a.position;
                    const posB = b.position;

                    if (posA == null && posB == null) return 0;
                    if (posA == null) return 1;
                    if (posB == null) return -1;

                    return posA - posB;
                  })
                  .map((result) => {
                    const driver = driverMap[result.driver_number];
                    if (!driver) return null;

                    const points = getDriverPoints(
                      result.position,
                      result.dnf,
                      result.dns,
                      result.dsq,
                    );

                    return (
                      <div
                        key={result.driver_number}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-center text-gray-400">
                            {result.position != null && result.position
                              ? `P${result.position}`
                              : `${result.dnf ? "" : result.dns ? "" : result.dsq ? "" : "Finished"}`}
                          </span>
                          <span
                            className="text-m font-medium px-2"
                            style={{ color: `#${driver.team_colour}` }}
                          >
                            {driver.full_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-300">{points} points</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${getStatusColor(result)} w-16`}
                          >
                            {getStatusText(result)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/60 border border-gray-600/50 rounded-xl p-6 text-center">
              <p className="text-gray-400">Race results not available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
