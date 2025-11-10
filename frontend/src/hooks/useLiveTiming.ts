import { useState, useEffect, useRef, useMemo } from "react";
import { F1LiveTimingService } from "@/services/SSE/liveTiming";
import type { F1State } from "@/types/SSE/store";
import { ConnectionStatus } from "@/types/SSE/connection";
import { LiveTimingData } from "@/types/LiveTiming/liveTiming";

function transformF1Data(state: F1State | null): LiveTimingData | null {
	if (!state) return null;

	try {
		const session = {
			name: state.SessionInfo?.Meeting?.Name || "",
			flagURL: state.SessionInfo?.Meeting?.Country?.Code
				? `https://flagcdn.com/w80/${state.SessionInfo.Meeting.Country.Code.toLowerCase()}.png`
				: "",
			type: state.SessionInfo?.Name || "",
			trackStatus: state.TrackStatus?.Message || "",
			lapsCompleted: state.LapCount?.CurrentLap || 0,
			totalLaps: state.LapCount?.TotalLaps || 0,
		};

		// 轉換 weather 資料
		const weather = {
			airTemp: parseFloat(state.WeatherData?.AirTemp || "0"),
			humidity: parseFloat(state.WeatherData?.Humidity || "0"),
			pressure: parseFloat(state.WeatherData?.Pressure || "0"),
			rainfall: parseFloat(state.WeatherData?.Rainfall || "0"),
			trackTemp: parseFloat(state.WeatherData?.TrackTemp || "0"),
			windDirection: parseFloat(state.WeatherData?.WindDirection || "0"),
			windSpeed: parseFloat(state.WeatherData?.WindSpeed || "0"),
		};

		// 轉換 race control 資料
		const raceControl = Object.values(
			state.RaceControlMessages?.Messages || {}
		).map((msg: any) => ({
			category: msg.Category || "",
			flag: msg.Flag,
			lap: parseInt(msg.Lap || "0", 10),
			message: msg.Message || "",
			scope: msg.Scope,
			sector: msg.Sector ? parseInt(msg.Sector, 10) : undefined,
			utc: msg.Utc || "",
		}));

		// 轉換 drivers 資料
		const drivers = Object.entries(state.TimingData?.Lines || {})
			.map(([racingNumber, driver]: [string, any]) => {
				const driverInfo = state.DriverList?.[racingNumber];
				const timingAppDriver = state.TimingAppData?.Lines?.[racingNumber];
				const timingStatsDriver = state.TimingStats?.Lines?.[racingNumber];

				return {
					position: parseInt(driver.Position || "0", 10),
					driverCode: driverInfo?.Tla || racingNumber,
					driverNumber: racingNumber,
					teamColour: driverInfo?.TeamColour || "FFFFFF",
					teamLogo: driverInfo?.TeamName,
					leaderGap: (driver.Position == 1) ? "Leader" : driver.GapToLeader || "-",
					intervalGap: (driver.Position == 1) ? "Interval" : driver.IntervalToPositionAhead?.Value || "-",
					tyreCompound: (timingAppDriver?.Stints?.[
						timingAppDriver.Stints.length - 1
					]?.Compound || "MEDIUM") as any,
					tyreAge: (() => {
						const currentStint =
							timingAppDriver?.Stints?.[timingAppDriver.Stints.length - 1];
						if (!currentStint) return "0";
						const age =
							(currentStint.TotalLaps || 0) - (currentStint.StartLaps || 0);
						return age.toString();
					})(),
					bestLap: driver.BestLapTime?.Value,
					lastLap: driver.LastLapTime
						? {
								overallFastest: driver.LastLapTime.OverallFastest || false,
								personalFastest: driver.LastLapTime.PersonalFastest || false,
								value: driver.LastLapTime.Value || "",
							}
						: undefined,
					Sectors: driver.Sectors
						? Object.values(driver.Sectors).map((sector: any) => ({
								overallFastest: sector.OverallFastest || false,
								personalFastest: sector.PersonalFastest || false,
								previousValue: sector.PreviousValue || "",
								segments: sector.Segments
									? Object.entries(sector.Segments)
											.sort(([keyA], [keyB]) => Number(keyA) - Number(keyB))
											.map(([_, value]) => value as { Status: number }) // 強制型別
									: [],
								stopped: sector.Stopped || false,
								value: sector.Value || "",
							}))
						: undefined,
					bestSectors: (() => {
						const bs = timingStatsDriver?.BestSectors;
						let arr: any[] = [];
						if (Array.isArray(bs)) {
							arr = bs;
						} else if (bs && typeof bs === "object") {
							arr = Object.keys(bs)
								.sort((a, b) => Number(a) - Number(b))
								.map((k) => bs[k]);
						}
						return arr.map((b: any) => ({
							Position: b?.Position ?? 0,
							Value: b?.Value || "",
						}));
					})(),
					isPit: driver.InPit || false,
					pitStops: driver.NumberOfPitStops || 0,
					pitInfo: driver.PitOut ? 1 : 0,
					topSpeed: timingStatsDriver?.BestSpeeds
						? {
								FL: parseFloat(timingStatsDriver?.BestSpeeds?.FL?.Value || "0"),
								I1: parseFloat(timingStatsDriver?.BestSpeeds?.I1?.Value || "0"),
								I2: parseFloat(timingStatsDriver?.BestSpeeds?.I2?.Value || "0"),
								ST: parseFloat(timingStatsDriver?.BestSpeeds?.ST?.Value || "0"),
							}
						: undefined,
				};
			})
			.filter((d) => d.position > 0)
			.sort((a, b) => a.position - b.position);

		return {
			session,
			weather,
			raceControl,
			drivers,
		};
	} catch (error) {
		console.error("Error transforming F1 data:", error);
		return null;
	}
}

/**
 * 使用 F1 即時資料（含轉換）
 */
export function useLiveTiming() {
	const [data, setData] = useState<F1State | null>(null);
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
		ConnectionStatus.DISCONNECTED
	);
	const [isInitialized, setIsInitialized] = useState(false);
	const serviceRef = useRef<F1LiveTimingService | null>(null);

	// 使用 useMemo 進行資料轉換，避免不必要的重新計算
	const liveTimingData = useMemo(() => transformF1Data(data), [data]);

	useEffect(() => {
		// 初始化服務
		const service = new F1LiveTimingService({
			debug: true,
			enableSnapshot: false,
		});
		serviceRef.current = service;

		// 訂閱資料變更
		const unsubscribeData = service.subscribe((newState) => {
			setData(newState);
			setIsInitialized(service.isInitialized());
		});

		// 訂閱連線狀態
		let statusCheckInterval: NodeJS.Timeout;
		const checkStatus = () => {
			setConnectionStatus(service.getConnectionStatus());
			setIsInitialized(service.isInitialized());
		};

		// 啟動服務
		service.start();

		// 定期檢查狀態（每秒）
		statusCheckInterval = setInterval(checkStatus, 1000);
		checkStatus();

		// 清理
		return () => {
			clearInterval(statusCheckInterval);
			unsubscribeData();
			service.destroy();
		};
	}, []);

	return {
		rawData: data,
		data: liveTimingData,
		connectionStatus,
		isInitialized,
		isConnected: connectionStatus === ConnectionStatus.CONNECTED,
		service: serviceRef.current,
	};
}
