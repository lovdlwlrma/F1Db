import { useState, useEffect } from "react";
import { TelemetryService } from "@/services/telemetry";
import { Driver } from "@/types/Openf1API/drivers";

interface UseDriversReturn {
  drivers: Driver[];
  loading: boolean;
  error: string | null;
}

export const useDrivers = (sessionKey: number | null): UseDriversReturn => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionKey) {
      setDrivers([]);
      return;
    }

    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await TelemetryService.getDrivers(sessionKey);
        setDrivers(data);
      } catch (err) {
        console.error("Failed to fetch drivers:", err);
        setError("Failed to load drivers");
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [sessionKey]);

  return {
    drivers,
    loading,
    error,
  };
};
