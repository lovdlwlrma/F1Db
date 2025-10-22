// layouts/AnalyticsLayout.tsx
import React from "react";
import SelectBar from "@/components/analytics/SelectBar";
import LapRankingChart from "@/components/analytics/LapRankingChart";
import TyreStintsChart from "@/components/analytics/TyreStintsChart";
import RaceStatisticsTable from "@/components/analytics/RaceStatisticsTable";
import RaceControlTimeline from "@/components/analytics/RaceControlTimeline";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import type {
  Meeting,
  Session,
  Driver,
  Stint,
  RaceResult,
  Positions,
  RaceControl,
} from "@/types/Openf1API";

interface AnalyticsLayoutProps {
  // Selection props
  year: number;
  setYear: (year: number) => void;
  meetings: Meeting[];
  selectedMeeting: Meeting | null;
  setSelectedMeeting: (meeting: Meeting | null) => void;
  sessions: Session[];
  selectedSession: Session | null;
  setSelectedSession: (session: Session | null) => void;

  // Analytics data
  lapRankings: Positions | null;
  drivers: Driver[];
  stints: Record<number, Stint[]> | null;
  results: RaceResult[];
  raceControls: RaceControl[];

  // UI state
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const AnalyticsLayout: React.FC<AnalyticsLayoutProps> = ({
  year,
  setYear,
  meetings,
  selectedMeeting,
  setSelectedMeeting,
  lapRankings,
  drivers,
  stints,
  results,
  raceControls,
  loading,
  error,
  onRetry,
}) => {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SelectBar
        year={year}
        setYear={setYear}
        grandPrix={selectedMeeting?.meeting_name ?? ""}
        setGrandPrix={(name) => {
          const meeting = meetings.find((m) => m.meeting_name === name) ?? null;
          setSelectedMeeting(meeting);
        }}
        grandPrixList={meetings.map((m) => m.meeting_name)}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <RaceStatisticsTable
            drivers={drivers}
            results={results}
            lapRankings={lapRankings}
            grandPrixName={selectedMeeting?.meeting_name ?? ""}
          />
          <LapRankingChart
            data={lapRankings}
            drivers={drivers}
            result={results}
            height={600}
          />
          <TyreStintsChart
            stints={stints}
            drivers={drivers}
            results={results}
            height={600}
          />
          <RaceControlTimeline raceControls={raceControls} height={640} />
        </>
      )}
    </div>
  );
};

export default AnalyticsLayout;
