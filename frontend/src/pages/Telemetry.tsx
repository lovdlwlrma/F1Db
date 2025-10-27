import React, { useEffect } from "react";
import TelemetryLayout from "@/layouts/TelemetryLayout";
import { useMeetingsByYear } from "@/hooks/useMeetingsByYear";
import { useSessionsByMeeting } from "@/hooks/useSessionsByMeeting";
import { useDriversBySession } from "@/hooks/useDriversBySession";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useTelemetrySelection } from "@/hooks/useTelemetrySelection";
import { COMMON_CONFIG } from "@/config/config";

const Telemetry: React.FC = () => {
  // 用戶選擇狀態
  const {
    year,
    selectedDriver1,
    selectedDriver2,
    setYear,
    setSelectedDriver1,
    setSelectedDriver2,
    resetDriverSelections,
  } = useTelemetrySelection(COMMON_CONFIG.DEFAULT_YEAR);

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

  // Driver
  const { drivers: availableDrivers, loading: driversLoading } =
    useDriversBySession({
      sessionKey: selectedSession?.session_key ?? null,
    });

  // Driver 1 Telemetry
  const {
    laps: laps1,
    selectedLap: selectedLap1,
    telemetryData: telemetryData1,
    loading: telemetry1Loading,
    setSelectedLap: setSelectedLap1,
  } = useTelemetry({
    sessionKey: selectedSession?.session_key ?? null,
    driverNumber: selectedDriver1?.driver_number ?? null,
  });

  // Driver 2 Telemetry
  const {
    laps: laps2,
    selectedLap: selectedLap2,
    telemetryData: telemetryData2,
    loading: telemetry2Loading,
    setSelectedLap: setSelectedLap2,
  } = useTelemetry({
    sessionKey: selectedSession?.session_key ?? null,
    driverNumber: selectedDriver2?.driver_number ?? null,
  });

  // 當 session 改變時，重置車手選擇
  useEffect(() => {
    resetDriverSelections();
  }, [selectedSession, resetDriverSelections]);

  // 當有可用車手時，自動選擇第一個
  useEffect(() => {
    if (availableDrivers.length > 0 && !selectedDriver1) {
      setSelectedDriver1(availableDrivers[0]);
    }
  }, [availableDrivers, selectedDriver1, setSelectedDriver1]);

  // 合併所有 loading 狀態
  const loading =
    meetingsLoading ||
    sessionsLoading ||
    driversLoading ||
    telemetry1Loading ||
    telemetry2Loading;

  return (
    <TelemetryLayout
      year={year}
      setYear={setYear}
      meetings={meetings}
      selectedMeeting={selectedMeeting}
      setSelectedMeeting={setSelectedMeeting}
      sessions={sessions}
      selectedSession={selectedSession}
      setSelectedSession={setSelectedSession}
      availableDrivers={availableDrivers}
      selectedDriver1={selectedDriver1}
      setSelectedDriver1={setSelectedDriver1}
      selectedDriver2={selectedDriver2}
      setSelectedDriver2={setSelectedDriver2}
      laps1={laps1}
      selectedLap1={selectedLap1}
      setSelectedLap1={setSelectedLap1}
      laps2={laps2}
      selectedLap2={selectedLap2}
      setSelectedLap2={setSelectedLap2}
      telemetryData1={telemetryData1}
      telemetryData2={telemetryData2}
      loading={loading}
      error={null}
      onRetry={() => window.location.reload()}
    />
  );
};

export default Telemetry;
