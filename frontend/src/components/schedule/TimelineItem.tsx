import React from "react";
import { MapPin, Calendar, Flag } from "lucide-react";
import { Race } from "@/types/race";

interface TimelineItemProps {
  race: Race;
  onClick: (race: Race) => void;
  isPast: boolean;
  isUpcoming: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  race,
  onClick,
  isPast,
  isUpcoming,
}) => {
  const getMonthName = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "long" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative flex items-start gap-6 group">
      <div
        className={`absolute left-5 w-7 h-7 rounded-full border-4 transition-all ${
          isUpcoming
            ? "bg-red-500 border-red-300 animate-pulse shadow-lg shadow-red-500/50"
            : isPast
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-800 border-red-500 group-hover:bg-red-500"
        }`}
      >
        {isUpcoming && (
          <Flag className="w-4 h-4 text-white absolute -top-1 -left-1" />
        )}
      </div>

      <div className="ml-20 flex-1">
        <button
          onClick={() => onClick(race)}
          className={`w-full text-left p-6 rounded-lg transition-all transform hover:scale-[1.02] ${
            isUpcoming
              ? "bg-gradient-to-r from-red-600/40 to-red-500/30 border-2 border-red-500"
              : isPast
                ? "bg-gray-800/40 border border-gray-700"
                : "bg-gray-800 border border-gray-700 hover:border-red-500 hover:shadow-lg"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm text-gray-400 mb-1">
                {race.round === 0 ? "Season Test" : `Round ${race.round}`} ·{" "}
                {getMonthName(race.start_date)}
              </div>
              <h3
                className={`text-2xl font-bold mb-2 ${
                  isPast ? "text-gray-400" : "text-white"
                }`}
              >
                {race.name}
              </h3>
            </div>
            {isUpcoming && (
              <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                Live
              </span>
            )}
            {isPast && (
              <span className="px-3 py-1 bg-gray-700 text-gray-400 text-sm font-semibold rounded-full">
                Completed
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div
              className={`flex items-center gap-2 ${
                isPast ? "text-gray-500" : "text-gray-300"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{race.circuit.name}</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                isPast ? "text-gray-500" : "text-gray-300"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(race.start_date)} - {formatDate(race.end_date)}
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
