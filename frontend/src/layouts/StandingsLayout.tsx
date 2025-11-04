import React from "react";
import { SeasonStanding } from "@/types/Openf1API/standings";
import { DriverPointsChart } from "@/components/standings/DriverPointsChart";
import { TeamPointsChart } from "@/components/standings/TeamPointsChart";
import { PositionBoxPlot } from "@/components/standings/PositionBoxPlot";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";

interface StandingsLayoutProps {
  seasonStandings: SeasonStanding;
  loading: boolean;
  error: Error | null;
  onRetry?: () => void;
}

export const StandingsLayout: React.FC<StandingsLayoutProps> = ({
  seasonStandings,
  loading,
  error,
  onRetry,
}) => {
  if (error) {
    return <ErrorState message={String(error)} onRetry={onRetry} />;
  }

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 grid grid-cols-5 gap-6">
          {/* 左側 2/3 */}
          <div className="col-span-3 flex flex-col gap-y-2">
            <div className="flex-1">
              <DriverPointsChart data={seasonStandings} />
            </div>
            <div className="flex-1">
              <TeamPointsChart data={seasonStandings} />
            </div>
          </div>

          {/* 右側 1/3 */}
          <div className="col-span-2 h-full">
            <PositionBoxPlot data={seasonStandings} />
          </div>
        </div>
      )}
    </div>
  );
};
export default StandingsLayout;
