import { useState, useEffect } from "react";
import { TelemetryService } from "@/services/telemetry";
import { Session } from "@/types/Openf1API/sessions";

interface UseSessionsReturn {
  sessions: Session[];
  selectedSession: Session | null;
  loading: boolean;
  error: string | null;
  setSelectedSession: (session: Session | null) => void;
}

export const useSessions = (meetingKey: number | null): UseSessionsReturn => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingKey) {
      setSessions([]);
      setSelectedSession(null);
      return;
    }

    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      setSelectedSession(null);

      try {
        const data = await TelemetryService.getSessions(meetingKey);
        setSessions(data);

        // 自動選擇最新的 session
        const latestSession = data.at(-1) ?? null;
        setSelectedSession(latestSession);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setError("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [meetingKey]);

  return {
    sessions,
    selectedSession,
    loading,
    error,
    setSelectedSession,
  };
};
