import { useState, useEffect } from "react";
import { Lap } from "@/types/Openf1API/laps";
import { OpenF1Service } from "@/services/Openf1API/laps";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/common.config";

interface UseLapsProps {
  sessionKey: number | null;
  driverNumber: number | null;
}

// 使用複合 key 進行緩存: "sessionKey-driverNumber"
const cache: { [key: string]: Lap[] } = {};

export const useLaps = ({ sessionKey, driverNumber }: UseLapsProps) => {
  const [laps, setLaps] = useState<Lap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionKey || !driverNumber) {
      setLaps([]);
      return;
    }

    const fetchLaps = async () => {
      const cacheKey = `${sessionKey}-${driverNumber}`;
      setLoading(true);
      setError(null);
      try {
        const data =
          cache[cacheKey] ??
          (await withRetry(
            () => OpenF1Service.getLaps(sessionKey, driverNumber),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache[cacheKey] = data;
        setLaps(data);
      } catch (err) {
        console.error("Failed to fetch laps:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchLaps();
  }, [sessionKey, driverNumber]);

  return { laps, loading, error };
};
