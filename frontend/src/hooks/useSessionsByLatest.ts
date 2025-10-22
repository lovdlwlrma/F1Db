import { useState, useEffect } from "react";
import { Session } from "@/types/Openf1API/sessions";
import { OpenF1Service } from "@/services/Openf1API/sessions";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/common.config";

let cache: Session[] | null = null;

export const useSessionsByLatest = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          cache ??
          (await withRetry(
            () => OpenF1Service.getSessionsbyLatest(),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache = data;
        setSessions(data);
      } catch (err) {
        console.error("Failed to fetch latest sessions:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return { sessions, loading, error };
};
