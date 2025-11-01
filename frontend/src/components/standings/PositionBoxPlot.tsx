import React from "react";
import { Target } from "lucide-react";
import { SeasonStanding } from "@/types/Openf1API/standings";

interface PositionBoxPlotProps {
  data: SeasonStanding;
}

export const PositionBoxPlot: React.FC<PositionBoxPlotProps> = ({ data }) => {
  if (!data || !data.driver_standings) {
    return (
      <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 shadow-2xl border border-gray-700">
        <div className="text-center text-gray-400 py-20">No data available</div>
      </div>
    );
  }

  const boxPlotData = data.driver_standings
    .map((driver) => {
      const validPos = driver.positions.filter((p) => p > 0); // exclude DNF (-1) or 0
      if (validPos.length === 0) return null;

      const sorted = [...validPos].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const median = sorted[Math.floor(sorted.length * 0.5)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const min = Math.min(...validPos);
      const max = Math.max(...validPos);

      return {
        name: driver.name_acronym,
        min,
        q1,
        median,
        q3,
        max,
        colour: driver.team_colour,
      };
    })
    .filter(Boolean) as {
    name: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    colour: string;
  }[];

  boxPlotData.sort((a, b) => a.median - b.median);

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 shadow-2xl border border-gray-700 relative">
      <h2 className="text-sm font-bold mb-4 -mt-1 flex items-center gap-2">
        <Target className="text-red-500" />
        Driver Finish Position Distribution
      </h2>

      <div className="relative">
        {boxPlotData.map((driver) => (
          <div key={driver.name} className="relative">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm flex-[0.1]">{driver.name}</span>
              <div className="flex-1 relative h-7 bg-gray-700/30 rounded-lg">
                <div
                  className="absolute h-full flex items-center"
                  style={{
                    left: `${((driver.min - 1) / 19) * 100}%`,
                    width: `${((driver.max - driver.min) / 19) * 100}%`,
                  }}
                >
                  {/* Whisker line */}
                  <div
                    className="absolute h-0.5 bg-gray-500"
                    style={{ width: "100%", top: "50%" }}
                  />
                  {/* Interquartile box */}
                  <div
                    className="absolute h-6 rounded border-2 opacity-80"
                    style={{
                      left: `${
                        ((driver.q1 - driver.min) / (driver.max - driver.min)) *
                        100
                      }%`,
                      width: `${
                        ((driver.q3 - driver.q1) / (driver.max - driver.min)) *
                        100
                      }%`,
                      backgroundColor: `#${driver.colour}40`,
                      borderColor: `#${driver.colour}`,
                    }}
                  />
                  {/* Median line */}
                  <div
                    className="absolute h-6 w-1 rounded opacity-90"
                    style={{
                      left: `${
                        ((driver.median - driver.min) /
                          (driver.max - driver.min)) *
                        100
                      }%`,
                      backgroundColor: `#${driver.colour}`,
                    }}
                  />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-0.5 border-l border-dashed border-gray-400"
                  style={{ left: `${((10 - 1) / 19) * 100}%` }}
                />
              </div>
              <div className="text-sm text-gray-400 flex-[0.22] text-right">
                P{driver.min} - P{driver.max}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
