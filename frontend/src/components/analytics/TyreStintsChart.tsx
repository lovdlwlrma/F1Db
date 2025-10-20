import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Driver } from "@/types/Openf1API/drivers";
import { Stint } from "@/types/Openf1API/stints";
import { RaceResult } from "@/types/Openf1API/result";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface Props {
  stints?: Record<number, Stint[]> | null;
  drivers?: Driver[];
  results?: RaceResult[];
  height?: number;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function TyreStintsChart({
  stints,
  drivers = [],
  results = [],
  height = 300,
}: Props) {
  const driverMap = useMemo(() => {
    const map: Record<number, Driver> = {};
    drivers.forEach((d) => (map[d.driver_number] = d));
    return map;
  }, [drivers]);

  const resultMap = useMemo(() => {
    const map: Record<number, number> = {};
    results.forEach((r) => (map[r.driver_number] = r.position));
    return map;
  }, [results]);

  const tyreColors = {
    SOFT: "#E10600",
    MEDIUM: "#F7E700",
    HARD: "#FFFFFF",
    INTERMEDIATE: "#43B02A",
    WET: "#0067AD",
    DNF: "#555555",
  };

  const chartData = useMemo(() => {
    if (!stints) return { labels: [], datasets: [] };

    const driverNumbers = Object.keys(stints)
      .map((n) => parseInt(n))
      .sort((a, b) => {
        const pa = resultMap[a] ?? Infinity;
        const pb = resultMap[b] ?? Infinity;
        if (pa !== pb) return pa - pb;

        const da = driverMap[a];
        const db = driverMap[b];
        if (!da || !db) return a - b;

        if (da.team_name < db.team_name) return -1;
        if (da.team_name > db.team_name) return 1;

        return da.driver_number - db.driver_number;
      });

    const maxLap = Math.max(
      ...Object.values(stints)
        .flat()
        .map((s) => s.lap_end),
    );
    const maxStints = Math.max(
      ...Object.values(stints).map((driverStints) => driverStints.length),
    );

    const datasets = [];
    for (let stintIndex = 0; stintIndex < maxStints; stintIndex++) {
      const data = driverNumbers.map((driverNumber) => {
        const driverStints = stints[driverNumber] || [];
        const sortedStints = driverStints.sort(
          (a, b) => a.lap_start - b.lap_start,
        );
        const stint = sortedStints[stintIndex];
        if (!stint) return 0;
        return stint.lap_end - stint.lap_start + 1;
      });

      const compounds = driverNumbers
        .map((driverNumber) => {
          const driverStints = stints[driverNumber] || [];
          const sortedStints = driverStints.sort(
            (a, b) => a.lap_start - b.lap_start,
          );
          return sortedStints[stintIndex]?.compound;
        })
        .filter(Boolean);

      if (compounds.length === 0) continue;

      const backgroundColors = driverNumbers.map((driverNumber) => {
        const driverStints = stints[driverNumber] || [];
        const sortedStints = driverStints.sort(
          (a, b) => a.lap_start - b.lap_start,
        );
        const stint = sortedStints[stintIndex];
        if (!stint) return "transparent";
        const hex =
          tyreColors[stint.compound as keyof typeof tyreColors] ||
          tyreColors.DNF;
        return hexToRgba(hex, 1);
      });

      datasets.push({
        label: `Stint ${stintIndex + 1}`,
        data,
        backgroundColor: backgroundColors,
        borderColor: "#000000",
        borderWidth: 1.5,
        borderRadius: {
          topLeft: 12,
          topRight: 12,
          bottomLeft: 12,
          bottomRight: 12,
        },
        borderSkipped: false,
      });
    }

    const grayData = driverNumbers.map((driverNumber) => {
      const totalLaps = (stints[driverNumber] || []).reduce(
        (sum, s) => sum + (s.lap_end - s.lap_start + 1),
        0,
      );
      return Math.max(0, maxLap - totalLaps);
    });

    if (grayData.some((v) => v > 0)) {
      datasets.push({
        label: "DNF/Missing",
        data: grayData,
        backgroundColor: tyreColors.DNF,
        borderColor: "#000000",
        borderWidth: 1.5,
        borderRadius: {
          topLeft: 12,
          topRight: 12,
          bottomLeft: 12,
          bottomRight: 12,
        },
        borderSkipped: false,
      });
    }

    return {
      labels: driverNumbers.map((n) => driverMap[n]?.name_acronym || `#${n}`),
      datasets: datasets.filter((d) => d.data.some((v) => v > 0)),
    };
  }, [stints, driverMap, resultMap]);

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          boxWidth: 10,
          padding: 10,
          usePointStyle: true,
          generateLabels: () => {
            return Object.entries(tyreColors).map(([name, color], index) => ({
              text: name,
              fillStyle: color,
              fontColor: "#ffffff",
              lineWidth: 0.5,
              index,
            }));
          },
        },
      },

      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleFont: { weight: "bold" },
        callbacks: {
          label: (ctx) => {
            if (!stints) return "";

            // driverNumber
            const driverNumbers = Object.keys(stints)
              .map(Number)
              .sort((a, b) => {
                const pa = resultMap[a] ?? Infinity;
                const pb = resultMap[b] ?? Infinity;
                if (pa !== pb) return pa - pb;

                const da = driverMap[a];
                const db = driverMap[b];
                if (!da || !db) return a - b;
                if (da.team_name < db.team_name) return -1;
                if (da.team_name > db.team_name) return 1;
                return da.driver_number - db.driver_number;
              });
            const driverNumber = driverNumbers[ctx.dataIndex];
            const driverStints = (stints[driverNumber] || []).sort(
              (a, b) => a.lap_start - b.lap_start,
            );

            const laps = ctx.raw as number;

            // 找出對應 laps 的 stint
            const stint = driverStints.find(
              (s) => s.lap_end - s.lap_start + 1 === laps,
            );

            if (!stint) {
              // 如果找不到，代表這段是補全的 DNF/Missing
              return "DNF/Missing";
            }

            return `${stint.compound} | Stint ${stint.stint_number}: Lap ${stint.lap_start}-${stint.lap_end} (${stint.lap_end - stint.lap_start + 1} laps)`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: "rgba(255,255,255,0.3)", drawTicks: true },
      },
      y: {
        stacked: true,
        title: { display: false },
        ticks: {
          stepSize: 1,
          autoSkip: false,
          font: { size: 12 },
          color: (ctx) => {
            const label = chartData.labels?.[ctx.index] as string;
            const driver = Object.values(driverMap).find(
              (d) =>
                d.name_acronym === label || `#${d.driver_number}` === label,
            );
            return driver ? `#${driver.team_colour}` : "#ffffff";
          },
        },
      },
    },
    datasets: {
      bar: {
        barThickness: 12,
        maxBarThickness: 12,
        borderSkipped: false,
      },
    },
  };

  return (
    <div className="w-full" style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
