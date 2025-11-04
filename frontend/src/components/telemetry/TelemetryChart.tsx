import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { Lap } from "@/types/Openf1API/laps";
import { Driver } from "@/types/Openf1API/drivers";
import { TelemetryData } from "@/types/Openf1API/telemetry";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface Props {
  telemetry1: TelemetryData[];
  telemetry2?: TelemetryData[];
  driver1: Driver | null;
  driver2?: Driver | null;
  laps1?: Lap[];
  laps2?: Lap[];
}

const TelemetryChart: React.FC<Props> = ({
  telemetry1,
  telemetry2,
  driver1,
  driver2,
  laps1,
  laps2,
}) => {
  if (!telemetry1 || telemetry1.length === 0) return null;

  const chartConfigs: {
    title: string;
    key?: keyof TelemetryData;
    isLapTime?: boolean;
  }[] = [
    { title: "Lap Time", isLapTime: true },
    { title: "Speed", key: "speed" },
    { title: "Throttle", key: "throttle" },
    { title: "Brake", key: "brake" },
    { title: "Gear", key: "n_gear" },
    { title: "RPM", key: "rpm" },
  ];

  const sampleStep = 5;
  const sample = (data: TelemetryData[]) =>
    data.filter((_, i) => i % sampleStep === 0);

  const legendItems: { label: string; color: string }[] = [];
  if (driver1)
    legendItems.push({
      label: driver1.full_name,
      color: `#${driver1.team_colour}`,
    });
  if (driver2)
    legendItems.push({
      label: driver2.full_name,
      color: `#${driver2.team_colour}`,
    });

  // 控制 dataset 顯示/隱藏
  const [hiddenLines, setHiddenLines] = useState<{ [label: string]: boolean }>(
    {},
  );

  const toggleLine = (label: string) => {
    setHiddenLines((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* 統一 Legend */}
      {legendItems.length > 0 && (
        <div className="col-span-2 flex justify-center space-x-4 mt-2">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center space-x-1 cursor-pointer"
              onClick={() => toggleLine(item.label)}
            >
              <span
                className="w-4 h-4 rounded-sm"
                style={{
                  backgroundColor: hiddenLines[item.label]
                    ? "#555"
                    : item.color,
                }}
              ></span>
              <span className="text-white">{item.label}</span>
            </div>
          ))}
        </div>
      )}
      {chartConfigs.map((cfg, idx) => {
        // Lap Time 圖
        if (cfg.isLapTime) {
          if (!laps1 || laps1.length === 0) return null;
          return (
            <div
              key={idx}
              className="col-span-1 bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-700 "
            >
              <h3 className="text-white mb-2">{cfg.title}</h3>
              <Line
                data={{
                  labels: laps1.map((l) => `Lap ${l.lap_number}`),
                  datasets: [
                    driver1 && {
                      label: driver1.full_name,
                      data: laps1.map((l) => l.lap_duration),
                      borderColor: `#${driver1.team_colour}`,
                      backgroundColor: `#${driver1.team_colour}55`,
                      tension: 0.2,
                      hidden: hiddenLines[driver1.full_name] ?? false,
                    },
                    driver2 &&
                      laps2 &&
                      laps2.length > 0 && {
                        label: driver2.full_name,
                        data: laps2.map((l) => l.lap_duration),
                        borderColor: `#${driver2.team_colour}`,
                        backgroundColor: `#${driver2.team_colour}55`,
                        tension: 0.2,
                        hidden: hiddenLines[driver2.full_name] ?? false,
                      },
                  ].filter(Boolean) as any,
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: false,
                      grid: {
                        color: "rgba(255,255,255,0.1)",
                      },
                    },
                    x: {
                      grid: {
                        color: "rgba(255,255,255,0.1)",
                      },
                    },
                  },
                }}
              />
            </div>
          );
        }

        // Telemetry 圖
        const sampled1 = sample(telemetry1);
        const sampled2 = telemetry2 ? sample(telemetry2) : [];
        const startTime1 = new Date(sampled1[0].date).getTime();
        const labels = sampled1.map((d) =>
          ((new Date(d.date).getTime() - startTime1) / 1000).toFixed(2),
        );

        return (
          <div
            key={idx}
            className="col-span-1 bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-700 "
          >
            <h3 className="text-white mb-2">{cfg.title}</h3>
            <Line
              data={{
                labels,
                datasets: [
                  driver1 &&
                    cfg.key && {
                      label: driver1.full_name,
                      data: sampled1.map((d) => Number(d[cfg.key!])),
                      borderColor: `#${driver1.team_colour}`,
                      backgroundColor: `#${driver1.team_colour}55`,
                      tension: 0.2,
                      hidden: hiddenLines[driver1.full_name] ?? false,
                    },
                  driver2 &&
                    telemetry2 &&
                    cfg.key && {
                      label: driver2.full_name,
                      data: sampled2.map((d) => Number(d[cfg.key!])),
                      borderColor: `#${driver2.team_colour}`,
                      backgroundColor: `#${driver2.team_colour}55`,
                      tension: 0.2,
                      hidden: hiddenLines[driver2.full_name] ?? false,
                    },
                ].filter(Boolean) as any,
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: {
                      color: "rgba(255,255,255,0.1)",
                    },
                  },
                  x: {
                    ticks: { maxTicksLimit: 10 },
                    grid: {
                      color: "rgba(255,255,255,0.1)",
                    },
                  },
                },
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TelemetryChart;
