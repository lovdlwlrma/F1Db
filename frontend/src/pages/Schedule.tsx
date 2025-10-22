import React, { useState, useEffect } from "react";
import { ScheduleLayout } from "@/layouts/ScheduleLayout";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import RaceDetailModal from "@/components/schedule/RaceDetailModal";
import { RaceService } from "@/services/race";
import { ScheduleData, Race, ViewMode } from "@/types/race";

export const SchedulePage: React.FC = () => {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const currentYear = 2025;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Starting to fetch schedule data...");
        const scheduleData = await RaceService.getSchedule(currentYear);
        console.log("Schedule data received:", scheduleData);
        setData(scheduleData);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "無法載入賽程資料,請檢查網路連線。";
        console.error("Error fetching schedule data:", err);
        console.error("Error type:", typeof err);
        console.error("Error details:", JSON.stringify(err, null, 2));
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentYear]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl font-bold mb-4">⚠️ Error</div>
          <div className="text-white text-lg mb-6">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.races || data.races.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-2xl font-bold mb-4">
            ⚠️ No Data
          </div>
          <div className="text-white text-lg">
            Can't find schedule data for {currentYear}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScheduleLayout year={data.year}>
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setViewMode("timeline")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            viewMode === "timeline"
              ? "bg-red-500 text-white shadow-lg"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setViewMode("grid")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            viewMode === "grid"
              ? "bg-red-500 text-white shadow-lg"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Grid
        </button>
      </div>

      <ScheduleView
        data={data}
        viewMode={viewMode}
        onRaceClick={setSelectedRace}
      />

      {selectedRace && (
        <RaceDetailModal
          race={selectedRace}
          onClose={() => setSelectedRace(null)}
        />
      )}
    </ScheduleLayout>
  );
};

export default SchedulePage;
