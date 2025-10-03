import React, { useState, useEffect } from "react";
import { StandingsLayout } from "@/layouts/Standings";
import { DriverPointsChart } from "@/components/standings/DriverPointsChart";
import { TeamPointsChart } from "@/components/standings/TeamPointsChart";
import { PositionBoxPlot } from "@/components/standings/PositionBoxPlot";
import { StandingsService } from "@/services/standings";
import { SeasonData } from "@/types/standings";

const CACHE_KEY = "seasonDataCache";
const CACHE_EXPIRY_HOURS = 6;

export const StandingsPage: React.FC = () => {
  const [data, setData] = useState<SeasonData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            timestamp: number;
            data: SeasonData[];
          };
          const ageHours = (Date.now() - parsed.timestamp) / 1000 / 3600;
          if (ageHours < CACHE_EXPIRY_HOURS) {
            setData(parsed.data);
            setLoading(false);
            return;
          }
        }

        const seasonData =
          await StandingsService.getDriverStanding(currentYear);
        setData(seasonData);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: seasonData }),
        );
      } catch (err) {
        setError("Failed to load data. Please check your API connection.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentYear]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl font-bold mb-4">⚠️ Error</div>
          <div className="text-white text-lg">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0 || !data[0]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-2xl font-bold mb-4">
            ⚠️ No Data
          </div>
          <div className="text-white text-lg">
            No season data found for {currentYear}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  const seasonData = data[0];

  return (
    <StandingsLayout year={seasonData.year}>
      <DriverPointsChart data={seasonData} />
      <TeamPointsChart data={seasonData} />
      <PositionBoxPlot data={seasonData} />
    </StandingsLayout>
  );
};

export default StandingsPage;
