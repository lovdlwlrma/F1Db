import React from "react";
import { useSchedule } from "@/hooks/useSchedule";
import { ScheduleLayout } from "@/layouts/ScheduleLayout";
import { COMMON_CONFIG } from "@/config/config";

const Schedule: React.FC = () => {
  const currentYear = COMMON_CONFIG.DEFAULT_YEAR;
  const {
    data,
    loading,
    selectedRace,
    setSelectedRace,
    viewMode,
    setViewMode,
  } = useSchedule(currentYear);

  return (
    <ScheduleLayout
      year={currentYear}
      data={data}
      viewMode={viewMode}
      setViewMode={setViewMode}
      selectedRace={selectedRace}
      setSelectedRace={setSelectedRace}
      loading={loading}
      error={null}
      onRetry={() => window.location.reload()}
    />
  );
};

export default Schedule;
