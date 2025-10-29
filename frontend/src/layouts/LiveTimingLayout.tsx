import React from "react";
import { Topbar } from "@/components/liveTiming/TopBar";
import { LiveTimingTable } from "@/components/liveTiming/LiveTimingTable";
import { RaceControlBar } from "@/components/liveTiming/RaceControlBar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";

interface LiveTimingLayoutProps {
  session: any;
  weather: any;
  drivers: any;
  raceControl: any;
  connectionStatus: string;
  updateCount: number;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const LiveTimingLayout: React.FC<LiveTimingLayoutProps> = ({
  session,
  weather,
  drivers,
  raceControl,
  connectionStatus,
  updateCount,
  loading,
  error,
  onRetry,
}) => {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  return (
    <div className="flex flex-col gap-8">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div>
          <Topbar
            session={session}
            weather={weather}
            connectionStatus={connectionStatus}
            updateCount={updateCount}
          />
          <LiveTimingTable drivers={drivers} />
          <RaceControlBar messages={raceControl} />
        </div>
      )}
    </div>
  );
};

export default LiveTimingLayout;
