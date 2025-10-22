import { useState, useEffect } from "react";
import { Driver } from "@/types/Openf1API/drivers";
import { OpenF1Service } from "@/services/Openf1API/drivers";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/common.config";

interface UseDriversBySessionProps {
  sessionKey: number | null;
}

const cache: { [sessionKey: number]: Driver[] } = {};

export const useDriversBySession = ({
  sessionKey,
}: UseDriversBySessionProps) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionKey) {
      setDrivers([]);
      return;
    }

    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          cache[sessionKey] ??
          (await withRetry(
            () => OpenF1Service.getDriversbySession(sessionKey),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache[sessionKey] = data;
        setDrivers(data);
      } catch (err) {
        console.error("Failed to fetch drivers by session:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [sessionKey]);

  return { drivers, loading, error };
};
