import { useState, useEffect } from "react";
import { Driver } from "@/types/Openf1API/drivers";
import { OpenF1Service } from "@/services/Openf1API/drivers";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/common.config";

let cache: Driver[] | null = null;

export const useDriversByLatest = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          cache ??
          (await withRetry(
            () => OpenF1Service.getDriversbyLatest(),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache = data;
        setDrivers(data);
      } catch (err) {
        console.error("Failed to fetch latest drivers:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  return { drivers, loading, error };
};
