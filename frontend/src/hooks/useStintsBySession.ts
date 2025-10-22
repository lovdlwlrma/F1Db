import { useState, useEffect } from "react";
import { Stints } from "@/types/Openf1API/stints";
import { OpenF1Service } from "@/services/Openf1API/stints";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/common.config";

interface UseStintsBySessionProps {
  sessionKey: number | null;
}

const cache: { [sessionKey: number]: Stints } = {};

export const useStintsBySession = ({ sessionKey }: UseStintsBySessionProps) => {
  const [stints, setStints] = useState<Stints | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionKey) {
      setStints(null);
      return;
    }

    const fetchStints = async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          cache[sessionKey] ??
          (await withRetry(
            () => OpenF1Service.getStintsbySession(sessionKey),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache[sessionKey] = data;
        setStints(data);
      } catch (err) {
        console.error("Failed to fetch stints by session:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchStints();
  }, [sessionKey]);

  return { stints, loading, error };
};
