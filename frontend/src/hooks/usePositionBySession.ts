import { useState, useEffect } from "react";
import { Position } from "@/types/Openf1API/positions";
import { OpenF1Service } from "@/services/Openf1API/positions";
import { withRetry } from "@/utils/retry";
import { COMMON_CONFIG } from "@/config/config";

interface UsePositionsBySessionProps {
	sessionKey: number | null;
}

const cache: { [sessionKey: number]: Position[] } = {};

export const usePositionsBySession = ({
	sessionKey,
}: UsePositionsBySessionProps) => {
	const [positions, setPositions] = useState<Position[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!sessionKey) {
			setPositions([]);
			return;
		}

		const fetchPositions = async () => {
			setLoading(true);
			setError(null);
			try {
				const data =
					cache[sessionKey] ??
					(await withRetry(
						() => OpenF1Service.getPositionsbySession(sessionKey),
						COMMON_CONFIG.RETRY.ATTEMPTS,
						COMMON_CONFIG.RETRY.DELAY
					));

				cache[sessionKey] = data;
				setPositions(data);
			} catch (err) {
				console.error("Failed to fetch positions by session:", err);
				setError(err instanceof Error ? err : new Error("Unknown error"));
			} finally {
				setLoading(false);
			}
		};

		fetchPositions();
	}, [sessionKey]);

	return { positions, loading, error };
};
