import React, { useState, useEffect } from "react";
import OverviewLayout from "@/layouts/OverviewLayout";
import TopBar from "@/components/overview/TopBar";
import CircuitMap from "@/components/overview/CircuitMap";
import ScheduleTable from "@/components/overview/ScheduleTable";
import CircuitInfo from "@/components/overview/CircuitInfo";
import { OverviewService } from "@/services/overview";
import { Race } from "@/types/race";

const Overview: React.FC = () => {
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNextRace = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await OverviewService.getNextRace();
        setNextRace(response.data);
      } catch (err) {
        console.error("Failed to fetch next race:", err);
        setError("Failed to load race information");
      } finally {
        setLoading(false);
      }
    };

    fetchNextRace();
  }, []);

  if (error) {
    return (
      <OverviewLayout>
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </OverviewLayout>
    );
  }

  return (
    <OverviewLayout>
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
    </OverviewLayout>
  );
};

export default Overview;
