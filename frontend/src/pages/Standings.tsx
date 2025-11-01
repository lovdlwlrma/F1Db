import React from "react";
import { StandingsLayout } from "@/layouts/StandingsLayout";
import { useDriverStandings } from "@/hooks/useStandings";

export const StandingsPage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { standings, loading, error } = useDriverStandings({ year: currentYear });

  const seasonStandings = standings[0];

  return (
    <StandingsLayout
      seasonStandings={seasonStandings}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
    />
  );
};

export default StandingsPage;
