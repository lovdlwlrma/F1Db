import { useState, useEffect } from "react";
import { Meeting } from "@/types/Openf1API/meetings";
import { OpenF1Service } from "@/services/Openf1API/meetings";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/config";

interface UseMeetingsByYearReturn {
  meetings: Meeting[];
  selectedMeeting: Meeting | null;
  loading: boolean;
  error: Error | null;
  setSelectedMeeting: (meeting: Meeting | null) => void;
}

const cache: { [year: number]: Meeting[] } = {};

export const useMeetingsByYear = (year: number): UseMeetingsByYearReturn => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      setError(null);
      setSelectedMeeting(null);

      try {
        const data =
          cache[year] ??
          (await withRetry(
            () => OpenF1Service.getMeetingsbyYear(year),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache[year] = data;
        setMeetings(data);

        const latestMeeting = data.at(-1) ?? null;
        setSelectedMeeting(latestMeeting);
      } catch (err) {
        console.error("Failed to fetch meetings by year:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [year]);

  return {
    meetings,
    selectedMeeting,
    loading,
    error,
    setSelectedMeeting,
  };
};
