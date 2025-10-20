import { useState, useEffect } from "react";
import { OverviewService } from "@/services/overview";
import { Race } from "@/types/race";

interface UseNextRaceReturn {
  nextRace: Race | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useNextRace = (): UseNextRaceReturn => {
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNextRace = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await OverviewService.getNextRace();
      setNextRace(response.data);
    } catch (err) {
      console.error("Failed to fetch next race:", err);
      setError("Failed to load race information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextRace();
  }, []);

  return { nextRace, loading, error, refetch: fetchNextRace };
};
