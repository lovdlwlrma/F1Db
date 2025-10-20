import { useState, useEffect } from "react";
import { TelemetryService } from "@/services/telemetry";
import { Lap } from "@/types/Openf1API/laps";
import { TelemetryData } from "@/types/Openf1API/telemetry";
import { findFastestLap } from "@/config/telemetry.config";

interface UseDriverTelemetryParams {
  sessionKey: number | null;
  driverNumber: number | null;
}

interface UseDriverTelemetryReturn {
  laps: Lap[];
  selectedLap: Lap | null;
  telemetryData: TelemetryData[];
  loading: boolean;
  error: string | null;
  setSelectedLap: (lap: Lap | null) => void;
}

export const useDriverTelemetry = ({
  sessionKey,
  driverNumber,
}: UseDriverTelemetryParams): UseDriverTelemetryReturn => {
  const [laps, setLaps] = useState<Lap[]>([]);
  const [selectedLap, setSelectedLap] = useState<Lap | null>(null);
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 獲取圈速數據
  useEffect(() => {
    if (!sessionKey || !driverNumber) {
      setLaps([]);
      setSelectedLap(null);
      setTelemetryData([]);
      return;
    }

    const fetchLaps = async () => {
      setLoading(true);
      setError(null);
      setSelectedLap(null);
      setTelemetryData([]);

      try {
        const lapData = await TelemetryService.getLaps(
          sessionKey,
          driverNumber,
        );
        setLaps(lapData);

        // 自動選擇最快圈
        const fastestLap = findFastestLap(lapData);
        setSelectedLap(fastestLap);
      } catch (err) {
        console.error("Failed to fetch laps:", err);
        setError("Failed to load lap data");
      } finally {
        setLoading(false);
      }
    };

    fetchLaps();
  }, [sessionKey, driverNumber]);

  // 獲取遙測數據
  useEffect(() => {
    if (!sessionKey || !driverNumber || !selectedLap) {
      setTelemetryData([]);
      return;
    }

    const fetchTelemetry = async () => {
      setLoading(true);
      setError(null);

      try {
        const carData = await TelemetryService.getTelemetry(
          sessionKey,
          driverNumber,
          selectedLap.lap_number,
        );
        setTelemetryData(carData.TelemetryData ?? []);
      } catch (err) {
        console.error("Failed to fetch telemetry:", err);
        setError("Failed to load telemetry data");
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
  }, [sessionKey, driverNumber, selectedLap]);

  return {
    laps,
    selectedLap,
    telemetryData,
    loading,
    error,
    setSelectedLap,
  };
};
