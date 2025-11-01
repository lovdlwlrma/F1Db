import React from "react";
import { Race } from "@/types/race";

interface CircuitMapProps {
  nextRace: Race | null;
  loading: boolean;
}

const CircuitMap: React.FC<CircuitMapProps> = ({ nextRace, loading }) => {
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 h-[460px]">
        <div className="animate-pulse">
          <div className="aspect-[16/9] bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!nextRace) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="aspect-[16/9] flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">🏁</div>
            <p className="text-gray-400">No circuit information available</p>
          </div>
        </div>
      </div>
    );
  }

  const getCircuitImage = (grandPrixName: string) => {
    const country = grandPrixName.replace(/ Grand Prix$/i, "");
    return `/Circuit/${country}.avif`;
  };

  return (
    <div className="bg-gray-900 rounded-lg">
      <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4 mt-4">
        <img
          src={getCircuitImage(nextRace.name)}
          alt={`${nextRace.name} circuit map`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
      </div>
    </div>
  );
};

export default CircuitMap;
