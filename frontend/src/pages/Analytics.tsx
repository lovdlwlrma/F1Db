import React, { useState, useEffect } from "react";
import AnalyticsLayout from "@/layouts/AnalyticsLayout";
import SelectBar from "@/components/analytics/SelectBar";
import LapRankingChart from "@/components/analytics/LapRankingChart";
import TyreStintsChart from "@/components/analytics/TyreStintsChart";
import RaceStatisticsTable from "@/components/analytics/RaceStatisticsTable";
import RaceControlTimeline from "@/components/analytics/RaceControlTimeline";
import {
	Driver,
	Session,
	Stints,
	Result,
	SessionLapRankingResponse,
	RaceControl,
} from "@/types/analytics";
import { AnalyticsService } from "@/services/analytics";
import { Meeting } from "@/types/telemetry";
import { withRetry } from "@/utils/retry";

interface Cache {
	meetings: { [year: number]: Meeting[] };
	sessions: { [meetingKey: number]: Session[] };
	lapRankings: { [sessionKey: number]: SessionLapRankingResponse };
	drivers: { [sessionKey: number]: Driver[] };
	stints: { [sessionKey: number]: Record<number, Stints[]> };
	results: { [sessionKey: number]: Result[] };
	raceControls: { [sessionKey: number]: RaceControl[] };
}

const AnalyticsPage: React.FC = () => {
	const [year, setYear] = useState(2025);
	const [grandPrix, setGrandPrix] = useState<Meeting | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [lapRankings, setLapRankings] =
		useState<SessionLapRankingResponse | null>(null);
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [stints, setStints] = useState<Record<number, Stints[]> | null>(null);
	const [results, setResults] = useState<Result[]>([]);
	const [raceControls, setRaceControls] = useState<RaceControl[]>([]);
	const [cache, setCache] = useState<Cache>({
		meetings: {},
		sessions: {},
		lapRankings: {},
		drivers: {},
		stints: {},
		results: {},
		raceControls: {},
	});

	/** --- 清空資料 --- */
	const resetData = () => {
		setSession(null);
		setLapRankings(null);
		setDrivers([]);
		setStints(null);
		setResults([]);
		setRaceControls([]);
	};

	/** --- 1. 取得 meetings --- */
	useEffect(() => {
		resetData();
		setGrandPrix(null);
		const fetchMeetings = async () => {
			try {
				const meetings =
					cache.meetings[year] ??
					(await withRetry(() => AnalyticsService.getMeetings(year), 3, 1500));
				setCache((prev) => ({
					...prev,
					meetings: { ...prev.meetings, [year]: meetings },
				}));
				setGrandPrix(meetings.at(-1) ?? null);
			} catch (err) {
				console.error(err);
			}
		};
		fetchMeetings();
	}, [year]);

	/** --- 2. 取得 race session --- */
	useEffect(() => {
		if (!grandPrix) return;
		resetData();
		const fetchRaceSession = async () => {
			try {
				const sessions =
					cache.sessions[grandPrix.meeting_key] ??
					(await withRetry(
						() => AnalyticsService.getRaceSession(grandPrix.meeting_key),
						3,
						1500
					));
				setCache((prev) => ({
					...prev,
					sessions: { ...prev.sessions, [grandPrix.meeting_key]: sessions },
				}));
				setSession(sessions.at(0) ?? null);
			} catch (err) {
				console.error(err);
			}
		};
		fetchRaceSession();
	}, [grandPrix]);

	/** --- 3. 取得 lap rankings --- */
	useEffect(() => {
		if (!session) return;
		setLapRankings(null);
		setDrivers([]);
		const fetchLapRankings = async () => {
			try {
				const res =
					cache.lapRankings[session.session_key] ??
					(await withRetry(
						() => AnalyticsService.getLapRankings(session.session_key),
						3,
						1500
					));
				setCache((prev) => ({
					...prev,
					lapRankings: { ...prev.lapRankings, [session.session_key]: res },
				}));
				setLapRankings(res);
			} catch (err) {
				console.error(err);
			}
		};
		fetchLapRankings();
	}, [session]);

	/** --- 4. 取得車手資料 --- */
	useEffect(() => {
		if (!session) return;
		setDrivers([]);
		const fetchDrivers = async () => {
			try {
				const res =
					cache.drivers[session.session_key] ??
					(await withRetry(
						() => AnalyticsService.getDrivers(session.session_key),
						3,
						1500
					));
				setCache((prev) => ({
					...prev,
					drivers: { ...prev.drivers, [session.session_key]: res },
				}));
				setDrivers(res);
			} catch (err) {
				console.error(err);
			}
		};
		fetchDrivers();
	}, [session]);

	/** --- 5. 取得車手 stints --- */
	useEffect(() => {
		if (!session) return;
		setStints(null);
		const fetchStints = async () => {
			try {
				const res =
					cache.stints[session.session_key] ??
					(await withRetry(
						() => AnalyticsService.getStints(session.session_key),
						3,
						1500
					));
				setCache((prev) => ({
					...prev,
					stints: { ...prev.stints, [session.session_key]: res },
				}));
				setStints(res);
			} catch (err) {
				console.error(err);
			}
		};
		fetchStints();
	}, [session]);

	/** --- 6. 取得比賽結果 --- */
	useEffect(() => {
		if (!session) return;
		setResults([]);
		const fetchResults = async () => {
			try {
				const res =
					cache.results[session.session_key] ??
					(await withRetry(
						() => AnalyticsService.getResult(session.session_key),
						3,
						1500
					));
				setCache((prev) => ({
					...prev,
					results: { ...prev.results, [session.session_key]: res },
				}));
				setResults(res);
			} catch (err) {
				console.error(err);
			}
		};
		fetchResults();
	}, [session]);

	/** --- 7. 取得 race control 資料 --- */
	useEffect(() => {
		if (!session) return;
		setRaceControls([]);
		const fetchRaceControls = async () => {
			try {
				const res =
					cache.raceControls[session.session_key] ??
					(await withRetry(
						() => AnalyticsService.getRaceControl(session.session_key),
						3,
						1500
					));
				setCache((prev) => ({
					...prev,
					raceControls: { ...prev.raceControls, [session.session_key]: res },
				}));
				setRaceControls(res);
			} catch (err) {
				console.error(err);
			}
		};
		fetchRaceControls();
	}, [session]);

	// Chart 是否準備好
	const isTableReady = drivers.length > 0 && results.length > 0 && lapRankings;
	const isLapRankingReady = lapRankings && drivers.length > 0;
	const isStintReady = stints && drivers.length > 0 && results.length > 0;
	const loading = isTableReady && isLapRankingReady && isStintReady;

	return (
		<AnalyticsLayout>
			<div className="flex flex-col min-h-screen">
				<SelectBar
					year={year}
					setYear={setYear}
					grandPrix={grandPrix?.meeting_name ?? ""}
					setGrandPrix={(name) => {
						const meeting =
							cache.meetings[year]?.find((m) => m.meeting_name === name) ??
							null;
						resetData();
						setGrandPrix(meeting);
					}}
					grandPrixList={cache.meetings[year]?.map((m) => m.meeting_name) ?? []}
				/>

				{!loading ? (
					<div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
						<div className="text-center">
							<div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
							<div className="text-white text-xl">Loading...</div>
						</div>
					</div>
				) : (
					<>
						<RaceStatisticsTable
							drivers={drivers}
							results={results}
							lapRankings={lapRankings}
							grandPrixName={grandPrix?.meeting_name ?? ""}
						/>
						<LapRankingChart
							data={lapRankings}
							drivers={drivers}
							result={results}
							height={600}
						/>
						<TyreStintsChart
							stints={stints}
							drivers={drivers}
							results={results}
							height={600}
						/>
						<RaceControlTimeline raceControls={raceControls} height={640} />
					</>
				)}
			</div>
		</AnalyticsLayout>
	);
};

export default AnalyticsPage;
