import { useState, useEffect } from "react";
import { OpenF1 } from "@/services/Openf1API";
import { Lap } from "@/types/Openf1API/laps";
import { TelemetryData } from "@/types/Openf1API/telemetry";
import { findFastestLap } from "@/config/telemetry.config";
import { COMMON_CONFIG } from "@/config/config";
import { withRetry } from "@/utils/retry";

const cache: { [key: string]: TelemetryData[] } = {};

interface UseDriverTelemetryParams {
	sessionKey: number | null;
	driverNumber: number | null;
}

interface UseDriverTelemetryReturn {
	laps: Lap[];
	selectedLap: Lap | null;
	telemetryData: TelemetryData[];
	loading: boolean;
	error: Error | null;
	setSelectedLap: (lap: Lap | null) => void;
}

export const useTelemetry = ({
	sessionKey,
	driverNumber,
}: UseDriverTelemetryParams): UseDriverTelemetryReturn => {
	const [laps, setLaps] = useState<Lap[]>([]);
	const [selectedLap, setSelectedLap] = useState<Lap | null>(null);
	const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// 獲取圈速數據
	useEffect(() => {
		if (!sessionKey || !driverNumber) {
			setLaps([]);
			setSelectedLap(null);
			setTelemetryData([]);
			return;
		}

		const fetchLaps = async () => {
			setLoading(true);
			setError(null);
			setSelectedLap(null);
			setTelemetryData([]);

			try {
				const lapData = await OpenF1.LapsService.getLaps(
					sessionKey,
					driverNumber
				);
				setLaps(lapData);

				// 自動選擇最快圈
				const fastestLap = findFastestLap(lapData);
				setSelectedLap(fastestLap);
			} catch (err) {
				console.error("Failed to fetch laps:", err);
				setError(err instanceof Error ? err : new Error("Unknown error"));
			} finally {
				setLoading(false);
			}
		};

		fetchLaps();
	}, [sessionKey, driverNumber]);

	// 獲取遙測數據
	useEffect(() => {
		if (!sessionKey || !driverNumber || !selectedLap) {
			setTelemetryData([]);
			return;
		}

		const fetchTelemetry = async () => {
			const cacheKey = `${sessionKey}-${driverNumber}-${selectedLap.lap_number}`;
			setLoading(true);
			setError(null);

			try {
				let carData =
					cache[cacheKey] ??
					(await withRetry(
						() =>
							OpenF1.TelemetryService.getTelemetry(
								sessionKey,
								driverNumber,
								selectedLap.lap_number
							),
						COMMON_CONFIG.RETRY.ATTEMPTS,
						COMMON_CONFIG.RETRY.DELAY
					));

				let telemetryArray: TelemetryData[] = [];
				if (carData && Array.isArray((carData as any).TelemetryData)) {
					telemetryArray = (carData as any).TelemetryData;
				} else if (Array.isArray(carData)) {
					telemetryArray = carData;
				} else {
					console.warn("Unexpected telemetry format:", carData);
				}

				cache[cacheKey] = telemetryArray;
				setTelemetryData(telemetryArray);
			} catch (err) {
				console.error("Failed to fetch telemetry:", err);
				setError(err instanceof Error ? err : new Error("Unknown error"));
				setTelemetryData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchTelemetry();
	}, [sessionKey, driverNumber, selectedLap]);

	return {
		laps,
		selectedLap,
		telemetryData,
		loading,
		error,
		setSelectedLap,
	};
};
