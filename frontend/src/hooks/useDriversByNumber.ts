import { useState, useEffect } from "react";
import { Driver } from "@/types/Openf1API/drivers";
import { OpenF1Service } from "@/services/Openf1API/drivers";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/config";

interface UseDriversByNumberProps {
  driverNumber: number | null;
}

const cache: { [driverNumber: number]: Driver[] } = {};

export const useDriversByNumber = ({
  driverNumber,
}: UseDriversByNumberProps) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!driverNumber) {
      setDrivers([]);
      return;
    }

    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          cache[driverNumber] ??
          (await withRetry(
            () => OpenF1Service.getDriversbyNumber(driverNumber),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache[driverNumber] = data;
        setDrivers(data);
      } catch (err) {
        console.error("Failed to fetch drivers by number:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [driverNumber]);

  return { drivers, loading, error };
};
