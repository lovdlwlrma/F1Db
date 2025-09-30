import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Driver, LapRanking, Result } from "@/types/analytics";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  data?: LapRanking[] | null;
  drivers?: Driver[];
  result?: Result[];
  height?: number;
}

export default function LapRankingChart({
  data,
  drivers = [],
  result = [],
  height = 400,
}: Props) {
  const driverMap = useMemo(() => {
    const map: Record<number, Driver> = {};
    drivers.forEach((d) => {
      map[d.driver_number] = d;
    });
    return map;
  }, [drivers]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };

    // 取得所有車手編號
    const driverSet = new Set<number>();
    data.forEach((lap) => lap.rank?.forEach((d) => driverSet.add(d)));
    const driversSorted = Array.from(driverSet).sort((a, b) => a - b);

    const datasets = driversSorted.map((drv) => {
      // 處理完整的 lap ranking 資料
      const values = data.map((lap) => {
        if (!lap.rank) return null;
        const idx = lap.rank.indexOf(drv);
        return idx >= 0 ? idx + 1 : null;
      });

      // 找 result 資料
      const res = result.find((r) => r.driver_number === drv);
      const isDNF = res?.dnf ?? false;

      // 如果有 result 資料且與最後一圈不同，則替換最後一個值
      if (res && values.length > 0) {
        values[values.length - 1] = res.position ?? values[values.length - 1];
      }      

      // DNF flags (用於畫虛線) - 檢查每一圈是否DNF
      const dnfFlags = data.map((lap) => {
        if (!lap.rank || !lap.dnf) return false;
        const idx = lap.rank.indexOf(drv);
        return idx >= 0 ? lap.dnf[idx] : false;
      });
      
      // 如果車手最終DNF，將最後一格也標記為DNF
      if (isDNF && dnfFlags.length > 0) {
        dnfFlags[dnfFlags.length - 1] = true;
      }

      const color = driverMap[drv]?.team_colour
        ? `#${driverMap[drv].team_colour}`
        : "#888";

      return {
        label: driverMap[drv]?.full_name ?? `#${drv}`,
        data: values,
        borderColor: color,
        backgroundColor: color,
        tension: 0,
        spanGaps: true, // 改為 true 讓線段連續
        fill: false,
        segment: {
          borderDash: (ctx: any) => {
            const i = ctx.p0DataIndex;
            // 如果當前點或下一個點是 DNF，就畫虛線
            if (dnfFlags[i] || (dnfFlags[i + 1] !== undefined && dnfFlags[i + 1])) {
              return [5, 5]; // 虛線樣式
            }
            return []; // 實線
          },
        },
      };
    });

    // 標籤：使用原本的 lap 編號
    const labels = data.map((lap) => lap.lap);

    return {
      labels,
      datasets,
    };
  }, [data, driverMap, result]);

  const leftYAxisLabels = useMemo(() => {
    if (!data || data.length === 0) return {};

    const firstLap = data[0];
    if (!firstLap || !firstLap.rank) return {};

    const labels: Record<number, { label: string; color: string }> = {};
    const maxRank = firstLap.rank.length;

    for (let position = 1; position <= maxRank; position++) {
      const driverNumber = firstLap.rank[position - 1];
      labels[position] = {
        label: driverMap[driverNumber]?.name_acronym ?? `#${driverNumber}`,
        color: driverMap[driverNumber]?.team_colour
          ? `#${driverMap[driverNumber].team_colour}`
          : "#888",
      };
    }

    return labels;
  }, [data, driverMap]);

  const yAxisRange = useMemo(() => {
    if (!data || data.length === 0) return { min: 1, max: 20 };

    const allRanks = new Set<number>();
    data.forEach((lap) => {
      lap.rank?.forEach((_, index) => {
        allRanks.add(index + 1);
      });
    });

    const min = Math.min(...Array.from(allRanks));
    const max = Math.max(...Array.from(allRanks));

    return { min, max };
  }, [data]);

  // 🔹 右側軸 = result (包含DNF車手)
  const rightYAxisLabels = useMemo(() => {
    if (!result || result.length === 0) return {};

    const labels: Record<number, { label: string; color: string }> = {};

    // 先處理所有完賽車手
    result.filter(r => !r.dnf).forEach((r) => {
      labels[r.position] = {
        label:
          driverMap[r.driver_number]?.name_acronym ?? `#${r.driver_number}`,
        color: driverMap[r.driver_number]?.team_colour
          ? `#${driverMap[r.driver_number].team_colour}`
          : "#888",
      };
    });

    // 處理DNF車手，將他們放在較後的位置
    const dnfDrivers = result.filter(r => r.dnf);
    const maxFinishedPosition = Math.max(...result.filter(r => !r.dnf).map(r => r.position), 0);
    
    dnfDrivers.forEach((r, index) => {
      const dnfPosition = maxFinishedPosition + index + 1;
      labels[dnfPosition] = {
        label: driverMap[r.driver_number]?.name_acronym ?? `#${r.driver_number}`,
        color: driverMap[r.driver_number]?.team_colour
          ? `#${driverMap[r.driver_number].team_colour}`
          : "#888",
      };
    });

    return labels;
  }, [result, driverMap]);

  return (
    <div className="w-full" style={{ height }}>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              reverse: true,
              ticks: {
                padding: 0,
                stepSize: 1,
                font: { size: 12 },
                callback: function (value) {
                  const val = Number(value);
                  return leftYAxisLabels[val]?.label || val;
                },
                color: function (context) {
                  const val = Number(context.tick?.value);
                  return leftYAxisLabels[val]?.color ?? "#000";
                },
              },
              title: { display: false },
              beginAtZero: false,
              position: "left",
              min: yAxisRange.min,
              max: yAxisRange.max,
              offset: true,
            },
            y2: {
              type: "linear" as const,
              reverse: true,
              position: "right" as const,
              grid: { display: false },
              ticks: {
                padding: 0,
                stepSize: 1,
                font: { size: 12 },
                callback: function (value) {
                  const val = Number(value);
                  return rightYAxisLabels[val]?.label || val;
                },
                color: function (context) {
                  const val = Number(context.tick?.value);
                  return rightYAxisLabels[val]?.color ?? "#000";
                },
              },
              title: { display: false },
              beginAtZero: false,
              min: yAxisRange.min,
              max: yAxisRange.max,
              offset: true,
            },
            x: {
              title: { display: false },
              offset: true,
              ticks: {
                padding: 0,
                font: { size: 12 },
              },
              grid: { color: "rgba(255,255,255,0.3)", drawTicks: true },
            },
          },
        }}
      />
    </div>
  );
}