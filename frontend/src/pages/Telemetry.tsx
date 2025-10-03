import React, { useState, useEffect } from "react";
import SelectBar from "@/components/telemetry/SelectBar";
import TelemetryChart from "@/components/telemetry/TelemetryChart";
import { TelemetryService } from "@/services/telemetry";
import {
  Meeting,
  Session,
  Driver,
  LapData,
  TelemetryData,
} from "@/types/telemetry";

const TelemetryPage: React.FC = () => {
  const [year, setYear] = useState(2025);
  const [grandPrix, setGrandPrix] = useState<Meeting | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);

  // Driver1
  const [selectedDriver1, setSelectedDriver1] = useState<Driver | null>(null);
  const [laps1, setLaps1] = useState<LapData[]>([]);
  const [selectedLap1, setSelectedLap1] = useState<LapData | null>(null);
  const [telemetryDriver1, setTelemetryDriver1] = useState<TelemetryData[]>([]);

  // Driver2
  const [selectedDriver2, setSelectedDriver2] = useState<Driver | null>(null);
  const [laps2, setLaps2] = useState<LapData[]>([]);
  const [selectedLap2, setSelectedLap2] = useState<LapData | null>(null);
  const [telemetryDriver2, setTelemetryDriver2] = useState<TelemetryData[]>([]);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [loading, setLoading] = useState(false);

  /** --- 年份變更 → 抓 meetings & 自動選最新 grandPrix --- */
  useEffect(() => {
    const fetchMeetings = async () => {
      // 清空下層
      setGrandPrix(null);
      setSession(null);
      setSessions([]);
      setAvailableDrivers([]);
      setSelectedDriver1(null);
      setSelectedLap1(null);
      setTelemetryDriver1([]);
      setSelectedDriver2(null);
      setSelectedLap2(null);
      setTelemetryDriver2([]);
      setLaps1([]);
      setLaps2([]);

      setLoading(true);
      try {
        const data = await TelemetryService.getMeetings(year);
        setMeetings(data);
        const latestMeeting = data.at(-1) ?? null;
        setGrandPrix(latestMeeting);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [year]);

  /** --- grandPrix 變更 → 抓 sessions & 自動選最新 session --- */
  useEffect(() => {
    if (!grandPrix) return;

    const fetchSessions = async () => {
      // 清空下層
      setAvailableDrivers([]);
      setSelectedDriver1(null);
      setSelectedLap1(null);
      setTelemetryDriver1([]);
      setSelectedDriver2(null);
      setSelectedLap2(null);
      setTelemetryDriver2([]);
      setLaps1([]);
      setLaps2([]);

      setLoading(true);
      try {
        const data = await TelemetryService.getSessions(grandPrix.meeting_key);
        setSessions(data);
        const latestSession = data.at(-1) ?? null;
        setSession(latestSession);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [grandPrix]);

  /** --- session 變更 → 抓 drivers & 自動選第一個 driver1 --- */
  useEffect(() => {
    if (!session) return;

    const fetchDrivers = async () => {
      // 清空下層
      setAvailableDrivers([]);
      setSelectedDriver1(null);
      setSelectedLap1(null);
      setTelemetryDriver1([]);
      setSelectedDriver2(null);
      setSelectedLap2(null);
      setTelemetryDriver2([]);
      setLaps1([]);
      setLaps2([]);

      setLoading(true);
      try {
        const data = await TelemetryService.getDrivers(session.session_key);
        setAvailableDrivers(data);
        const firstDriver = data[0] ?? null;
        setSelectedDriver1(firstDriver);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, [session]);

  /** --- Driver1 變更 → 抓 laps & 自動選最快圈 --- */
  useEffect(() => {
    if (!session || !selectedDriver1) return;

    const fetchLaps = async () => {
      setSelectedLap1(null);
      setLaps1([]);
      setTelemetryDriver1([]);

      setLoading(true);
      try {
        const lapData = await TelemetryService.getLaps(
          session.session_key,
          selectedDriver1.driver_number,
        );
        setLaps1(lapData);

        const valid = lapData.filter(
          (l) =>
            l.lap_duration !== null &&
            l.lap_number !== 1 &&
            l.lap_number !== lapData.length,
        );
        const fastestLap =
          valid.length > 0
            ? valid.reduce(
                (p, c) => (p.lap_duration! < c.lap_duration! ? p : c),
                valid[0],
              )
            : null;
        setSelectedLap1(fastestLap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLaps();
  }, [session, selectedDriver1]);

  /** --- Driver2 變更 → 抓 laps --- */
  useEffect(() => {
    if (!session || !selectedDriver2) return;

    const fetchLaps = async () => {
      setSelectedLap2(null);
      setLaps2([]);
      setTelemetryDriver2([]);

      setLoading(true);
      try {
        const lapData = await TelemetryService.getLaps(
          session.session_key,
          selectedDriver2.driver_number,
        );
        setLaps2(lapData);

        const valid = lapData.filter(
          (l) =>
            l.lap_duration !== null &&
            l.lap_number !== 1 &&
            l.lap_number !== lapData.length,
        );
        const fastestLap =
          valid.length > 0
            ? valid.reduce(
                (p, c) => (p.lap_duration! < c.lap_duration! ? p : c),
                valid[0],
              )
            : null;
        setSelectedLap2(fastestLap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLaps();
  }, [session, selectedDriver2]);

  /** --- Driver1 telemetry --- */
  useEffect(() => {
    if (!session || !selectedDriver1 || !selectedLap1) return;

    const fetchTelemetry = async () => {
      setTelemetryDriver1([]);
      setLoading(true);
      try {
        const carData = await TelemetryService.getTelemetry(
          session.session_key,
          selectedDriver1.driver_number,
          selectedLap1.lap_number,
        );
        setTelemetryDriver1(carData.TelemetryData ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTelemetry();
  }, [session, selectedDriver1, selectedLap1]);

  /** --- Driver2 telemetry --- */
  useEffect(() => {
    if (!session || !selectedDriver2 || !selectedLap2) return;

    const fetchTelemetry = async () => {
      setTelemetryDriver2([]);
      setLoading(true);
      try {
        const carData = await TelemetryService.getTelemetry(
          session.session_key,
          selectedDriver2.driver_number,
          selectedLap2.lap_number,
        );
        setTelemetryDriver2(carData.TelemetryData ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTelemetry();
  }, [session, selectedDriver2, selectedLap2]);

  return (
    <div className="p-4">
      <SelectBar
        year={year}
        setYear={setYear}
        country={grandPrix?.meeting_name ?? ""}
        setCountry={(name) => {
          const meeting = meetings.find((m) => m.meeting_name === name) ?? null;
          setGrandPrix(meeting);
        }}
        sessionName={session?.session_name ?? ""}
        setSessionName={(name) => {
          const s = sessions.find((s) => s.session_name === name) ?? null;
          setSession(s);
        }}
        raceNames={meetings.map((m) => m.meeting_name) ?? []}
        sessionTypes={sessions.map((s) => s.session_name) ?? []}
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
            <div className="text-white text-xl">Loading...</div>
          </div>
        </div>
      ) : (
        <TelemetryChart
          telemetry1={telemetryDriver1}
          telemetry2={telemetryDriver2}
          driver1={selectedDriver1}
          driver2={selectedDriver2}
          laps1={laps1}
          laps2={laps2}
        />
      )}
    </div>
  );
};

export default TelemetryPage;
