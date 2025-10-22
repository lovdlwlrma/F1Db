import { useState, useEffect } from "react";
import { Session } from "@/types/Openf1API/sessions";
import { OpenF1Service } from "@/services/Openf1API/sessions";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/common.config";

interface UseSessionsByYearProps {
  year: number;
}

const cache: { [year: number]: Session[] } = {};

export const useSessionsByYear = ({ year }: UseSessionsByYearProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          cache[year] ??
          (await withRetry(
            () => OpenF1Service.getSessionsbyYear(year),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache[year] = data;
        setSessions(data);
      } catch (err) {
        console.error("Failed to fetch sessions by year:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [year]);

  return { sessions, loading, error };
};
