import React from "react";
import { SessionData, WeatherData } from "@/types/LiveTiming/liveTiming";
import {
	Thermometer,
	Activity,
	Droplets,
	Wind,
	Gauge,
	Compass,
	CloudRain,
} from "lucide-react";

interface TopbarProps {
	session: SessionData;
	weather: WeatherData;
	connectionStatus: string;
	updateCount: number;
}

const statusColorMap: Record<string, string> = {
	AllClear: "bg-green-600 text-white",
	Yellow: "bg-yellow-500 text-white",
	VSCDeployed: "bg-yellow-500 text-white",
	VSCEnding: "bg-yellow-500 text-white",
	Red: "bg-red-600 text-white",
	SafetyCar: "bg-orange-500 text-white",
	Default: "bg-gray-600 text-white",
};

export const Topbar: React.FC<TopbarProps> = ({
	session,
	weather,
	connectionStatus,
	updateCount,
}) => {
	return (
		<div className="bg-gray-900 border-b border-gray-700 px-4 h-[50px] flex items-center">
			<div className="flex items-center justify-between w-full">
				{/* Left: Session Info */}
				<div className="flex items-center gap-3 min-w-0 flex-shrink-0">
					<div className="flex items-center gap-4 text-sm whitespace-nowrap">
						<span className="text-white text-l font-semibold truncate">
							{session.name} - {session.type}
						</span>
						<span
							className={`px-2 py-0.5 rounded text-xs font-bold ${
								statusColorMap[session.trackStatus] || statusColorMap.Default
							}`}
						>
							{session.trackStatus}
						</span>
						<span className="text-white font-bold">
							Lap {session.lapsCompleted} / {session.totalLaps}
						</span>
					</div>
				</div>

				{/* Center: Weather Info */}
				<div className="flex items-center gap-4 text-sm flex-shrink min-w-0 justify-center">
					<div className="flex items-center gap-1.5">
						<Thermometer className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
						<span className="text-white font-medium">{weather.airTemp}°C</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Activity className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
						<span className="text-white font-medium">
							{weather.trackTemp}°C
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Droplets className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
						<span className="text-white font-medium">{weather.humidity}%</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Wind className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
						<span className="text-white font-medium">
							{weather.windSpeed}m/s
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Compass className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
						<span className="text-white font-medium">
							{weather.windDirection}°
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<CloudRain className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
						<span className="text-white font-medium">{weather.rainfall}mm</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Gauge className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
						<span className="text-white font-medium">
							{weather.pressure}hPa
						</span>
					</div>
				</div>

				{/* Right: Connection Status */}
				<div className="flex items-center gap-3 text-xs flex-shrink-0">
					<div className="flex items-center gap-2">
						<div
							className={`w-2 h-2 rounded-full ${
								connectionStatus === "CONNECTED"
									? "bg-green-500"
									: connectionStatus === "RECONNECTING"
										? "bg-yellow-500"
										: "bg-red-500"
							}`}
						/>
						<span className="text-gray-400 capitalize">{connectionStatus}</span>
					</div>
					<div className="text-gray-400">
						<span className="text-white font-medium">{updateCount}</span>{" "}
						updates
					</div>
				</div>
			</div>
		</div>
	);
};
