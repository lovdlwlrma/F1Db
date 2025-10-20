// pages/Telemetry.tsx
import React, { useEffect } from "react";
import TelemetryLayout from "@/layouts/TelemetryLayout";
import { useMeetings } from "@/hooks/useMeetings";
import { useSessions } from "@/hooks/useSessions";
import { useDrivers } from "@/hooks/useDrivers";
import { useDriverTelemetry } from "@/hooks/useDriverTelemetry";
import { useTelemetrySelection } from "@/hooks/useTelemetrySelection";
import { TELEMETRY_CONFIG } from "@/config/telemetry.config";

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
  } = useTelemetrySelection(TELEMETRY_CONFIG.DEFAULT_YEAR);

  // 會議數據
  const {
    meetings,
    selectedMeeting,
    loading: meetingsLoading,
    setSelectedMeeting,
  } = useMeetings(year);

  // 會話數據
  const {
    sessions,
    selectedSession,
    loading: sessionsLoading,
    setSelectedSession,
  } = useSessions(selectedMeeting?.meeting_key ?? null);

  // 車手列表
  const { drivers: availableDrivers, loading: driversLoading } = useDrivers(
    selectedSession?.session_key ?? null,
  );

  // Driver 1 遙測數據
  const {
    laps: laps1,
    selectedLap: selectedLap1,
    telemetryData: telemetryData1,
    loading: telemetry1Loading,
    setSelectedLap: setSelectedLap1,
  } = useDriverTelemetry({
    sessionKey: selectedSession?.session_key ?? null,
    driverNumber: selectedDriver1?.driver_number ?? null,
  });

  // Driver 2 遙測數據
  const {
    laps: laps2,
    selectedLap: selectedLap2,
    telemetryData: telemetryData2,
    loading: telemetry2Loading,
    setSelectedLap: setSelectedLap2,
  } = useDriverTelemetry({
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
