import React from "react";
import { Flag, AlertTriangle, Zap } from "lucide-react";

export const getFlagColor = (flag?: string): string => {
  if (!flag) return "bg-gray-600";

  const colors: Record<string, string> = {
    GREEN: "bg-green-600",
    YELLOW: "bg-yellow-500",
    RED: "bg-red-600",
    BLUE: "bg-blue-500",
    CHEQUERED: "bg-gray-700",
    CLEAR: "bg-gray-600",
    "DOUBLE YELLOW": "bg-yellow-600",
  };

  return colors[flag] || "bg-gray-600";
};

export const getIcon = (category: string): React.ReactNode => {
  switch (category) {
    case "Flag":
      return <Flag className="w-4 h-4 text-white" />;
    case "Drs":
      return <Zap className="w-4 h-4 text-yellow-400" />;
    case "SafetyCar":
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    default:
      return null;
  }
};

export const SectorCell = ({
  sector,
  bestSector,
}: {
  sector?: {
    value?: string;
    previousValue?: string;
    overallFastest?: boolean;
    personalFastest?: boolean;
  };
  bestSector?: {
    Position?: number;
    Value?: string;
  };
}) => {
  const isEmpty = !sector?.value;

  let sectorColorClass = "text-gray-300";
  if (sector?.overallFastest) sectorColorClass = "text-purple-400 font-bold";
  else if (sector?.personalFastest)
    sectorColorClass = "text-green-400 font-bold";
  else if (isEmpty) sectorColorClass = "text-white/40";

  let bestColorClass = "text-green-400";
  if (bestSector?.Position == 1) bestColorClass = "text-purple-400 font-bold";

  return (
    <td
      className={`px-3 py-2 text-center font-mono leading-none ${sectorColorClass}`}
    >
      <div className="flex flex-col items-center gap-[2px]">
        <span className={`${sectorColorClass} text-[12px]`}>
          {isEmpty ? sector?.previousValue : sector?.value}
        </span>
        <span className={`${bestColorClass} text-[8px] leading-none`}>
          {bestSector?.Value}
        </span>
      </div>
    </td>
  );
};

export function SegmentBar({ segments }: { segments?: { Status: number }[] }) {
  if (!segments || segments.length === 0) return null;

  const getColor = (Status: number) => {
    switch (Status) {
      case 2048:
        return "bg-yellow-500";
      case 2049:
        return "bg-green-400";
      case 2051:
        return "bg-purple-500";
      default:
        return "bg-gray-700";
    }
  };

  return (
    <div className="flex items-center justify-center gap-[2px] m-0 p-0">
      {segments.map((seg, idx) => (
        <div
          key={idx}
          className={`w-[3px] h-4 rounded-sm ${getColor(seg.Status)}`}
        />
      ))}
    </div>
  );
}

export function lapTimeToSeconds(lap: string): number {
  if (!lap) return 0;
  const parts = lap.split(":"); // ["1", "20.764"]
  if (parts.length !== 2) return 0;
  const minutes = parseFloat(parts[0]);
  const seconds = parseFloat(parts[1]);
  return minutes * 60 + seconds;
}

export function formatLapTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3); // 保留三位毫秒
  return `${m}:${s.padStart(6, "0")}`; // 確保秒部分至少有 2 位數
}
