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
import { TrendingUp } from "lucide-react";
import { SeasonData } from "@/types/standings";

interface DriverPointsChartProps {
  data: SeasonData;
}

export const DriverPointsChart: React.FC<DriverPointsChartProps> = ({
  data,
}) => {
  if (!data || !data.locations || !data.driver_standings) {
    return (
      <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 shadow-2xl border border-gray-700">
        <div className="text-center text-gray-400 py-20">
          No Data to Display
        </div>
      </div>
    );
  }

  const chartData: any[] = [];

  // 用 Map 先分組
  const raceMap = new Map<string, number[]>();
  data.locations.forEach((location, idx) => {
    const prefix = location.split("_")[0]; // 取前綴
    if (!raceMap.has(prefix)) {
      raceMap.set(prefix, Array(data.driver_standings.length).fill(0));
    }
    data.driver_standings.forEach((driver, driverIdx) => {
      const current = raceMap.get(prefix)!;
      // 這裡使用累積積分最後一場作為合併後的值
      current[driverIdx] = driver.cumulative_points[idx];
    });
  });

  // 轉成 chartData
  Array.from(raceMap.entries()).forEach(([raceName, points]) => {
    const point: any = { race: raceName };
    data.driver_standings.forEach((driver, idx) => {
      point[driver.name_acronym] = points[idx];
    });
    chartData.push(point);
  });

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 shadow-2xl border border-gray-700">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-red-500" />
        Driver Standings Trend
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
                        {entry.name}
                      </span>
                      <span>{entry.value}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />

          {data.driver_standings.map((driver) => (
            <Line
              key={driver.name_acronym}
              type="monotone"
              dataKey={driver.name_acronym}
              stroke={`#${driver.team_colour}`}
              strokeWidth={3}
              dot={{ fill: `#${driver.team_colour}`, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
