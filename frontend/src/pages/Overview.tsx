import React from "react";
import OverviewLayout from "@/layouts/OverviewLayout";
import OverviewContent from "@/components/overview/OverviewContent";
import ErrorState from "@/components/common/ErrorState";
import { useNextRace } from "@/hooks/useNextRace";

const Overview: React.FC = () => {
  const { nextRace, loading, error, refetch } = useNextRace();

  return (
    <OverviewLayout>
      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <OverviewContent nextRace={nextRace} loading={loading} />
      )}
    </OverviewLayout>
  );
};

export default Overview;
