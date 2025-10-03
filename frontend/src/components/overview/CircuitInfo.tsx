import React from "react";
import { Race } from "@/types/race";
import { MapPin, Flag, Clock, Map, Hash, AudioWaveform } from "lucide-react";

interface CircuitInfoProps {
  nextRace: Race | null;
  loading: boolean;
}

const CircuitInfo: React.FC<CircuitInfoProps> = ({ nextRace, loading }) => {
  if (loading) {
    return (
      <div className="bg-gray-900/80 rounded-lg p-6 animate-pulse shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!nextRace) {
    return (
      <div className="bg-gray-900/80 rounded-lg p-6 text-center text-gray-400 shadow-lg">
        No circuit info available
      </div>
    );
  }

  const race = nextRace;
  const circuit = race.circuit;

  // 將 circuit.info 轉成 key-value
  const circuitInfoMap: Record<string, string> = {};
  if (circuit?.info) {
    circuit.info.forEach((item) => {
      circuitInfoMap[item.key] =
        item.value + (item.annotation ? ` ${item.annotation}` : "");
    });
  }

  const infoCards = [
    { label: "Country", value: race.country, icon: MapPin },
    { label: "Circuit", value: circuit?.name, icon: Flag },
    {
      label: "Number of Laps",
      value: circuitInfoMap["Number of Laps"],
      icon: Hash,
    },
    {
      label: "Circuit Length",
      value: circuitInfoMap["Circuit Length"],
      icon: AudioWaveform,
    },
    {
      label: "Race Distance",
      value: circuitInfoMap["Race Distance"],
      icon: Map,
    },
    {
      label: "Fastest Lap Time",
      value: circuitInfoMap["Lap Record"],
      icon: Clock,
    },
  ].filter((item) => item.value);

  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-4 shadow-lg border border-gray-700/40">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {infoCards.map((item, idx) => {
          const Icon = item.icon!;
          const isFastestLap = item.label.toLowerCase().includes("fastest");

          let lapParts: string[] = [];
          if (isFastestLap && typeof item.value === "string") {
            const match = item.value.match(/^([\d:.]+)\s+(.+)$/);
            if (match) {
              lapParts = [match[1], match[2]]; // [圈速, 車手 + 年份]
            } else {
              lapParts = [item.value];
            }
          }

          return (
            <div
              key={idx}
              className="flex items-center p-3 bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/40 shadow-md hover:shadow-red-500/50 hover:scale-[1.02] transition-transform duration-200 h-18"
            >
              <Icon className="w-6 h-6 text-red-400 flex-shrink-0" />

              <div className="flex flex-col ml-3 text-left">
                <p className="text-sm text-gray-400">{item.label}</p>
                {isFastestLap ? (
                  <div className="text-white font-semibold text-lg break-words flex items-baseline">
                    <span className="mr-3">{lapParts[0]}</span>
                    {lapParts[1] && (
                      <span className="text-gray-300 text-sm">
                        {lapParts[1]}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-white font-semibold text-lg">
                    {item.value}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CircuitInfo;
