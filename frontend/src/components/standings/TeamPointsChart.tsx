import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trophy } from "lucide-react";
import { SeasonData } from "@/types/standings";

interface TeamPointsChartProps {
  data: SeasonData;
}

export const TeamPointsChart: React.FC<TeamPointsChartProps> = ({ data }) => {
  if (!data || !data.locations || !data.driver_standings) {
    return (
      <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 shadow-2xl border border-gray-700">
        <div className="text-center text-gray-400 py-20">
          No Data to Display
        </div>
      </div>
    );
  }

  const teamColours: Record<string, string> = {};
  data.driver_standings.forEach((driver) => {
    teamColours[driver.team_name] = driver.team_colour;
  });
  const teamNames = Object.keys(teamColours);

  const merged: Record<string, Record<string, number>> = {};

  data.locations.forEach((loc, idx) => {
    const prefix = loc.split("_")[0];
    if (!merged[prefix]) merged[prefix] = {};

    teamNames.forEach((team) => {
      const teamPoints = data.driver_standings
        .filter((d) => d.team_name === team)
        .reduce((sum, driver) => sum + (driver.round_points[idx] || 0), 0);

      if (!merged[prefix][team]) merged[prefix][team] = 0;
      merged[prefix][team] += teamPoints;
    });
  });

  const cumulative: Record<string, number> = {};
  teamNames.forEach((team) => (cumulative[team] = 0));

  const chartData = Object.entries(merged).map(([race, teamPoints]) => {
    const point: any = { race };
    teamNames.forEach((team) => {
      cumulative[team] += teamPoints[team];
      point[team] = cumulative[team];
    });
    return point;
  });

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 shadow-2xl border border-gray-700">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-red-500" />
        Constructor Standings Trend
      </h2>
      <ResponsiveContainer width="100%" height={600}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="race"
            stroke="#9CA3AF"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
          />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            content={({ payload, label }) => {
              if (!payload || payload.length === 0) return null;

              const sorted = [...payload].sort(
                (a, b) => (b.value as number) - (a.value as number),
              );

              return (
                <div
                  style={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    padding: "8px",
                    fontSize: 12,
                    color: "#9CA3AF",
                  }}
                >
                  <div style={{ marginBottom: 4, fontWeight: "bold" }}>
                    {label}
                  </div>
                  {sorted.map((entry) => (
                    <div
                      key={entry.dataKey}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 2,
                      }}
                    >
                      <span style={{ color: entry.color, marginRight: 4 }}>
                        {entry.name}{" "}
                      </span>
                      <span>{entry.value}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />

          {teamNames.map((team) => (
            <Line
              key={team}
              type="monotone"
              dataKey={team}
              stroke={`#${teamColours[team]}`}
              strokeWidth={4}
              dot={{ fill: `#${teamColours[team]}`, r: 5 }}
              activeDot={{ r: 7 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
