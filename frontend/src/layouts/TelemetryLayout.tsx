import React from "react";
import SelectBar from "@/components/telemetry/SelectBar";
import TelemetryChart from "@/components/telemetry/TelemetryChart";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import { Meeting } from "@/types/Openf1API/meetings";
import { Session } from "@/types/Openf1API/sessions";
import { Driver } from "@/types/Openf1API/drivers";
import { Lap } from "@/types/Openf1API/laps";
import { TelemetryData } from "@/types/Openf1API/telemetry";

interface TelemetryLayoutProps {
  // Selection props
  year: number;
  setYear: (year: number) => void;
  meetings: Meeting[];
  selectedMeeting: Meeting | null;
  setSelectedMeeting: (meeting: Meeting | null) => void;
  sessions: Session[];
  selectedSession: Session | null;
  setSelectedSession: (session: Session | null) => void;

  // Driver props
  availableDrivers: Driver[];
  selectedDriver1: Driver | null;
  setSelectedDriver1: (driver: Driver | null) => void;
  selectedDriver2: Driver | null;
  setSelectedDriver2: (driver: Driver | null) => void;

  // Lap props
  laps1: Lap[];
  selectedLap1: Lap | null;
  setSelectedLap1: (lap: Lap | null) => void;
  laps2: Lap[];
  selectedLap2: Lap | null;
  setSelectedLap2: (lap: Lap | null) => void;

  // Telemetry data
  telemetryData1: TelemetryData[];
  telemetryData2: TelemetryData[];

  // UI state
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const TelemetryLayout: React.FC<TelemetryLayoutProps> = ({
  year,
  setYear,
  meetings,
  selectedMeeting,
  setSelectedMeeting,
  sessions,
  selectedSession,
  setSelectedSession,
  availableDrivers,
  selectedDriver1,
  setSelectedDriver1,
  selectedDriver2,
  setSelectedDriver2,
  laps1,
  selectedLap1,
  setSelectedLap1,
  laps2,
  selectedLap2,
  setSelectedLap2,
  telemetryData1,
  telemetryData2,
  loading,
  error,
  onRetry,
}) => {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  return (
    <div className="p-4">
      <SelectBar
        year={year}
        setYear={setYear}
        country={selectedMeeting?.meeting_name ?? ""}
        setCountry={(name) => {
          const meeting = meetings.find((m) => m.meeting_name === name) ?? null;
          setSelectedMeeting(meeting);
        }}
        sessionName={selectedSession?.session_name ?? ""}
        setSessionName={(name) => {
          const session = sessions.find((s) => s.session_name === name) ?? null;
          setSelectedSession(session);
        }}
        raceNames={meetings.map((m) => m.meeting_name)}
        sessionTypes={sessions.map((s) => s.session_name)}
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
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <TelemetryChart
          telemetry1={telemetryData1}
          telemetry2={telemetryData2}
          driver1={selectedDriver1}
          driver2={selectedDriver2}
          laps1={laps1}
          laps2={laps2}
        />
      )}
    </div>
  );
};

export default TelemetryLayout;
