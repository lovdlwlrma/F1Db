import { useState, useEffect } from "react";
import { RaceControl } from "@/types/Openf1API/raceControl";
import { OpenF1Service } from "@/services/Openf1API/raceControl";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/config";

interface UseRaceControlBySessionProps {
	sessionKey: number | null;
}

const cache: { [sessionKey: number]: RaceControl[] } = {};

export const useRaceControlBySession = ({
	sessionKey,
}: UseRaceControlBySessionProps) => {
	const [raceControls, setRaceControls] = useState<RaceControl[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!sessionKey) {
			setRaceControls([]);
			return;
		}

		const fetchRaceControl = async () => {
			setLoading(true);
			setError(null);
			try {
				const data =
					cache[sessionKey] ??
					(await withRetry(
						() => OpenF1Service.getRaceControlbySession(sessionKey),
						COMMON_CONFIG.RETRY.ATTEMPTS,
						COMMON_CONFIG.RETRY.DELAY
					));

				cache[sessionKey] = data;
				setRaceControls(data);
			} catch (err) {
				console.error("Failed to fetch race control by session:", err);
				setError(err instanceof Error ? err : new Error("Unknown error"));
			} finally {
				setLoading(false);
			}
		};

		fetchRaceControl();
	}, [sessionKey]);

	return { raceControls, loading, error };
};
