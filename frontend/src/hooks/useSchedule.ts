import { useState, useEffect } from "react";
import { RaceService } from "@/services/race";
import { ScheduleData, Race, ViewMode } from "@/types/race";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/config";

const cache: { [year: number]: ScheduleData } = {};

export const useSchedule = (year: number) => {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const scheduleData =
          cache[year] ??
          (await withRetry(
            () => RaceService.getSchedule(year),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache[year] = scheduleData;
        setData(scheduleData);
      } catch (err) {
        console.error("Failed to fetch sessions by year:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  return {
    data,
    loading,
    error,
    selectedRace,
    setSelectedRace,
    viewMode,
    setViewMode,
  };
};