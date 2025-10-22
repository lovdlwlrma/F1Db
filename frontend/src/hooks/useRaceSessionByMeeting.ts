import { useState, useEffect } from "react";
import { Session } from "@/types/Openf1API/sessions";
import { OpenF1Service } from "@/services/Openf1API/sessions";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/config";

interface UseRaceSessionByMeetingProps {
	meetingKey: number | null;
}

const cache: { [meetingKey: number]: Session[] } = {};

export const useRaceSessionByMeeting = ({
	meetingKey,
}: UseRaceSessionByMeetingProps) => {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!meetingKey) {
			setSessions([]);
			return;
		}

		const fetchRaceSession = async () => {
			setLoading(true);
			setError(null);
			try {
				const data =
					cache[meetingKey] ??
					(await withRetry(
						() => OpenF1Service.getRaceSessionbyMeeting(meetingKey),
						COMMON_CONFIG.RETRY.ATTEMPTS,
						COMMON_CONFIG.RETRY.DELAY
					));

				cache[meetingKey] = data;
				setSessions(data);
			} catch (err) {
				console.error("Failed to fetch race session by meeting:", err);
				setError(err instanceof Error ? err : new Error("Unknown error"));
			} finally {
				setLoading(false);
			}
		};

		fetchRaceSession();
	}, [meetingKey]);

	return { sessions, loading, error };
};
