import { useState, useEffect } from "react";
import { RaceResult } from "@/types/Openf1API/result";
import { OpenF1Service } from "@/services/Openf1API/result";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/config";

interface UseResultBySessionProps {
  sessionKey: number | null;
}

const cache: { [sessionKey: number]: RaceResult[] } = {};

export const useResultBySession = ({ sessionKey }: UseResultBySessionProps) => {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionKey) {
      setResults([]);
      return;
    }

    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          cache[sessionKey] ??
          (await withRetry(
            () => OpenF1Service.getResultbySession(sessionKey),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache[sessionKey] = data;
        setResults(data);
      } catch (err) {
        console.error("Failed to fetch result by session:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionKey]);

  return { results, loading, error };
};
