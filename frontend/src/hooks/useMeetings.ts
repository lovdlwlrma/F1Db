import { useState, useEffect } from "react";
import { TelemetryService } from "@/services/telemetry";
import { Meeting } from "@/types/Openf1API/meetings";

interface UseMeetingsReturn {
  meetings: Meeting[];
  selectedMeeting: Meeting | null;
  loading: boolean;
  error: string | null;
  setSelectedMeeting: (meeting: Meeting | null) => void;
}

export const useMeetings = (year: number): UseMeetingsReturn => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      setError(null);
      setSelectedMeeting(null);

      try {
        const data = await TelemetryService.getMeetings(year);
        setMeetings(data);

        // 自動選擇最新的會議
        const latestMeeting = data.at(-1) ?? null;
        setSelectedMeeting(latestMeeting);
      } catch (err) {
        console.error("Failed to fetch meetings:", err);
        setError("Failed to load meetings");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [year]);

  return {
    meetings,
    selectedMeeting,
    loading,
    error,
    setSelectedMeeting,
  };
};
