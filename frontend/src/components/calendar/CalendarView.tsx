import React from "react";
import { CalendarData, Race, ViewMode } from "@/types/calendar";
import { RaceCard } from "./RaceCard";
import { TimelineItem } from "./TimelineItem";
import { isPastRace, isUpcomingRace, groupRacesByMonth } from "./helpers";

interface CalendarViewProps {
  data: CalendarData;
  viewMode: ViewMode;
  onRaceClick: (race: Race) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  data,
  viewMode,
  onRaceClick,
}) => {
  if (viewMode === "grid") {
    const groupedRaces = groupRacesByMonth(data.races);

    return (
      <div className="space-y-8">
        {Object.entries(groupedRaces).map(([month, races]) => (
          <div key={month} className="space-y-4">
            <h3 className="text-2xl font-bold text-white border-l-4 border-red-500 pl-4">
              {month}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {races.map((race) => (
                <RaceCard
                  key={race.meeting_key}
                  race={race}
                  onClick={onRaceClick}
                  isPast={isPastRace(race)}
                  isUpcoming={isUpcomingRace(race)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Timeline View
  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 via-red-600 to-red-500"></div>

      <div className="space-y-6">
        {data.races.map((race) => (
          <TimelineItem
            key={race.meeting_key}
            race={race}
            onClick={onRaceClick}
            isPast={isPastRace(race)}
            isUpcoming={isUpcomingRace(race)}
          />
        ))}
      </div>
    </div>
  );
};
