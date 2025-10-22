// pages/AnalyticsPage.tsx
import React, { useState, useEffect } from "react";
import AnalyticsLayout from "@/layouts/AnalyticsLayout";
import { useMeetingsByYear } from "@/hooks/useMeetingsbyYear";
import { useSessionsByMeeting } from "@/hooks/useSessionsByMeeting";
import { useDriversBySession } from "@/hooks/useDriversbySession";
import { usePositionsBySession } from "@/hooks/usePositionbySession";
import { useStintsBySession } from "@/hooks/useStintsBySession";
import { useResultBySession } from "@/hooks/useResultBySession";
import { useRaceControlBySession } from "@/hooks/useRaceControlbySession";
import { COMMON_CONFIG, ANALYTICS_CONFIG } from "@/config/common.config";

const AnalyticsPage: React.FC = () => {
  const [year, setYear] = useState(COMMON_CONFIG.DEFAULT_YEAR);

  // Meeting
  const {
    meetings,
    selectedMeeting,
    loading: meetingsLoading,
    setSelectedMeeting,
  } = useMeetingsByYear(year);

  // Session
  const {
    sessions,
    selectedSession,
    loading: sessionsLoading,
    setSelectedSession,
  } = useSessionsByMeeting(selectedMeeting?.meeting_key ?? null);

  // 當 sessions 載入後，自動選擇 Race session
  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      const raceSession =
        sessions.find(
          (s) => s.session_name === ANALYTICS_CONFIG.SESSION_TYPE,
        ) || sessions[0];
      setSelectedSession(raceSession);
    }
  }, [sessions, selectedSession, setSelectedSession]);

  // Lap Rankings
  const { positions, loading: lapRankingsLoading } = usePositionsBySession({
    sessionKey: selectedSession?.session_key ?? null,
  });

  // Drivers
  const { drivers, loading: driversLoading } = useDriversBySession({
    sessionKey: selectedSession?.session_key ?? null,
  });

  // Stints
  const { stints, loading: stintsLoading } = useStintsBySession({
    sessionKey: selectedSession?.session_key ?? null,
  });

  // Results
  const { results, loading: resultsLoading } = useResultBySession({
    sessionKey: selectedSession?.session_key ?? null,
  });

  // Race Controls
  const { raceControls, loading: raceControlsLoading } =
    useRaceControlBySession({
      sessionKey: selectedSession?.session_key ?? null,
    });

  // 合併所有 loading 狀態
  const loading =
    meetingsLoading ||
    sessionsLoading ||
    lapRankingsLoading ||
    driversLoading ||
    stintsLoading ||
    resultsLoading ||
    raceControlsLoading;

  return (
    <AnalyticsLayout
      year={year}
      setYear={setYear}
      meetings={meetings}
      selectedMeeting={selectedMeeting}
      setSelectedMeeting={setSelectedMeeting}
      sessions={sessions}
      selectedSession={selectedSession}
      setSelectedSession={setSelectedSession}
      lapRankings={positions}
      drivers={drivers}
      stints={stints}
      results={results}
      raceControls={raceControls}
      loading={loading}
      error={null}
      onRetry={() => window.location.reload()}
    />
  );
};

export default AnalyticsPage;
