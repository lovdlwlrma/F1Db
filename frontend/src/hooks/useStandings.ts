import { useState, useEffect } from "react";
import { SeasonStanding } from "@/types/Openf1API/standings";
import { OpenF1Service } from "@/services/Openf1API/standings";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/common.config";

interface UseDriverStandingsProps {
  year: number;
}

const cache: { [year: number]: SeasonStanding[] } = {};

export const useDriverStandings = ({ year }: UseDriverStandingsProps) => {
  const [standings, setStandings] = useState<SeasonStanding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          cache[year] ??
          (await withRetry(
            () => OpenF1Service.getStandings(year),
            COMMON_CONFIG.RETRY.ATTEMPTS,
            COMMON_CONFIG.RETRY.DELAY,
          ));

        cache[year] = data;
        setStandings(data);
      } catch (err) {
        console.error("Failed to fetch driver standings:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [year]);

  return { standings, loading, error };
};
