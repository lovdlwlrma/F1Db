import { useState, useCallback } from "react";
import { Driver } from "@/types/Openf1API/drivers";

interface UseTelemetrySelectionReturn {
  year: number;
  selectedDriver1: Driver | null;
  selectedDriver2: Driver | null;
  setYear: (year: number) => void;
  setSelectedDriver1: (driver: Driver | null) => void;
  setSelectedDriver2: (driver: Driver | null) => void;
  resetDriverSelections: () => void;
}

export const useTelemetrySelection = (
  initialYear: number = 2025,
): UseTelemetrySelectionReturn => {
  const [year, setYear] = useState(initialYear);
  const [selectedDriver1, setSelectedDriver1] = useState<Driver | null>(null);
  const [selectedDriver2, setSelectedDriver2] = useState<Driver | null>(null);

  const resetDriverSelections = useCallback(() => {
    setSelectedDriver1(null);
    setSelectedDriver2(null);
  }, []);

  return {
    year,
    selectedDriver1,
    selectedDriver2,
    setYear,
    setSelectedDriver1,
    setSelectedDriver2,
    resetDriverSelections,
  };
};
