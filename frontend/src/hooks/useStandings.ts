import { useState, useEffect } from "react";
import { SeasonStanding } from "@/types/Openf1API/standings";
import { OpenF1Service } from "@/services/Openf1API/standings";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/config";

interface UseDriverStandingsProps {
  year: number;
}

const CACHE_KEY = "driverStandingsCache";
const CACHE_EXPIRY_HOURS = 12;

export const useDriverStandings = ({ year }: UseDriverStandingsProps) => {
  const [standings, setStandings] = useState<SeasonStanding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            timestamp: number;
            data: SeasonStanding[];
          };
          const ageHours = (Date.now() - parsed.timestamp) / 1000 / 3600;
          if (ageHours < CACHE_EXPIRY_HOURS) {
            setStandings(parsed.data);
            setLoading(false);
            return;
          }
        }

        const data = await withRetry(
          () => OpenF1Service.getStandings(year),
          COMMON_CONFIG.RETRY.ATTEMPTS,
          COMMON_CONFIG.RETRY.DELAY,
        );

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data }),
        );
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
