import { useState, useEffect } from "react";
import { Meeting } from "@/types/Openf1API/meetings";
import { OpenF1Service } from "@/services/Openf1API/meetings";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/config";

let cache: Meeting[] | null = null;

export const useMeetingsByLatest = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          cache ??
          (await withRetry(
            () => OpenF1Service.getMeetingsbyLatest(),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache = data;
        setMeetings(data);
      } catch (err) {
        console.error("Failed to fetch latest meetings:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  return { meetings, loading, error };
};
