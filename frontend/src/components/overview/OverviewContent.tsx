import React from "react";
import TopBar from "@/components/overview/TopBar";
import CircuitMap from "@/components/overview/CircuitMap";
import ScheduleTable from "@/components/overview/ScheduleTable";
import CircuitInfo from "@/components/overview/CircuitInfo";
import { Race } from "@/types/race";

interface OverviewContentProps {
  nextRace: Race | null;
  loading: boolean;
}

const OverviewContent: React.FC<OverviewContentProps> = ({
  nextRace,
  loading,
}) => {
  return (
    <div className="space-y-4">
      <TopBar nextRace={nextRace} loading={loading} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-full">
          <CircuitMap nextRace={nextRace} loading={loading} />
        </div>
        <div className="h-full">
          <ScheduleTable nextRace={nextRace} loading={loading} />
        </div>
      </div>

      <CircuitInfo nextRace={nextRace} loading={loading} />
    </div>
  );
};

export default OverviewContent;
