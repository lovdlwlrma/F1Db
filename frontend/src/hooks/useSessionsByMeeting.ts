import { useState, useEffect } from "react";
import { Session } from "@/types/Openf1API/sessions";
import { OpenF1Service } from "@/services/Openf1API/sessions";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/config";

interface UseSessionsByMeetingReturn {
	sessions: Session[];
	selectedSession: Session | null;
	loading: boolean;
	error: Error | null;
	setSelectedSession: (session: Session | null) => void;
}

const cache: { [meetingKey: number]: Session[] } = {};

export const useSessionsByMeeting = (
	meetingKey: number | null
): UseSessionsByMeetingReturn => {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [selectedSession, setSelectedSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

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
				const data =
					cache[meetingKey] ??
					(await withRetry(
						() => OpenF1Service.getSessionsbyMeeting(meetingKey),
						COMMON_CONFIG.RETRY.ATTEMPTS,
						COMMON_CONFIG.RETRY.DELAY
					));

				cache[meetingKey] = data;
				setSessions(data);

				const latestSession = data.at(-1) ?? null;
				setSelectedSession(latestSession);
			} catch (err) {
				console.error("Failed to fetch sessions by meeting:", err);
				setError(err instanceof Error ? err : new Error("Unknown error"));
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
