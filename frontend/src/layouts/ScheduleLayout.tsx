// layouts/ScheduleLayout.tsx
import React from "react";
import { ScheduleData, Race, ViewMode } from "@/types/race";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import RaceDetailModal from "@/components/schedule/RaceDetailModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";

interface ScheduleLayoutProps {
  year: number;
  data: ScheduleData | null;
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedRace: Race | null;
  setSelectedRace: (race: Race | null) => void;
  onRetry?: () => void;
}

export const ScheduleLayout: React.FC<ScheduleLayoutProps> = ({
  year,
  data,
  loading,
  error,
  viewMode,
  setViewMode,
  selectedRace,
  setSelectedRace,
  onRetry,
}) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (!data || !data.races?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-yellow-500 text-2xl font-bold mb-4">
            ⚠️ No Data
          </div>
          <div className="text-lg">無法找到 {year} 年的賽程資料</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      {/* 模式切換按鈕 */}
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

      {/* 賽程顯示 */}
      <ScheduleView
        data={data}
        viewMode={viewMode}
        onRaceClick={setSelectedRace}
      />

      {/* 賽事詳細資料彈窗 */}
      {selectedRace && (
        <RaceDetailModal
          race={selectedRace}
          onClose={() => setSelectedRace(null)}
        />
      )}
    </div>
  );
};
