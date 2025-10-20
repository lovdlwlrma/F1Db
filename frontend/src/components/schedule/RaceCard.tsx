import React from "react";
import { MapPin, Clock, Flag } from "lucide-react";
import { Race } from "@/types/race";

interface RaceCardProps {
  race: Race;
  onClick: (race: Race) => void;
  isPast: boolean;
  isUpcoming: boolean;
}

export const RaceCard: React.FC<RaceCardProps> = ({
  race,
  onClick,
  isPast,
  isUpcoming,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <button
      onClick={() => onClick(race)}
      className={`text-left p-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-xl ${
        isUpcoming
          ? "bg-gradient-to-br from-red-600 to-red-700 border-2 border-red-400 animate-pulse"
          : isPast
            ? "bg-gray-800/60 border border-gray-700"
            : "bg-gray-800 border border-gray-700 hover:border-red-500"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-sm font-mono px-2 py-1 rounded ${
            isUpcoming ? "bg-white text-red-600" : "bg-gray-700 text-gray-300"
          }`}
        >
          {race.round === 0 ? "Test" : `Round ${race.round}`}
        </span>
        {isUpcoming && <Flag className="w-5 h-5 text-white animate-bounce" />}
      </div>

      <h4
        className={`font-bold mb-2 ${isPast ? "text-gray-400" : "text-white"}`}
      >
        {race.name}
      </h4>

      <div className="space-y-1 text-sm">
        <div
          className={`flex items-center gap-2 ${
            isPast ? "text-gray-500" : "text-gray-300"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{race.city}</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            isPast ? "text-gray-500" : "text-gray-300"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatDate(race.start_date)}</span>
        </div>
      </div>

      {isPast && (
        <div className="mt-2 text-xs text-gray-600 font-semibold">
          Completed
        </div>
      )}
    </button>
  );
};
