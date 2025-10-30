import React from "react";
import { SectorCell, SegmentBar, lapTimeToSeconds } from "@/utils/livetiming";
import { DriversData } from "@/types/LiveTiming/liveTiming";

interface LiveTimingTableProps {
  drivers: DriversData[];
}

export const LiveTimingTable: React.FC<LiveTimingTableProps> = ({
  drivers,
}) => {
  const allBestLaps = drivers
    .map((d) => lapTimeToSeconds(d.bestLap || ""))
    .filter((n) => n > 0);
  const fastestLap =
    allBestLaps.length > 0 ? Math.min(...allBestLaps) : undefined;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-xs table-fixed border-separate border-spacing-0">
        <thead className="bg-gray-800 text-gray-300 uppercase sticky top-0 text-[10px]">
          <tr>
            <th className="px-3 py-2 text-center w-12">Pos</th>
            <th className="px-3 py-2 text-center w-14">Driver</th>
            <th className="px-3 py-2 text-center w-20">Leader</th>
            <th className="px-3 py-2 text-center w-20">Interval</th>
            <th className="px-3 py-2 text-center w-20">Best Lap</th>
            <th className="px-3 py-2 text-center w-20">Last Lap</th>
            <th className="px-3 py-2 text-center w-20">Sector1</th>
            <th className="px-3 py-2 text-center w-20">Sector2</th>
            <th className="px-3 py-2 text-center w-20">Sector3</th>
            <th className="px-3 py-2 text-center w-16">MiniSec1</th>
            <th className="px-3 py-2 text-center w-16">MiniSec2</th>
            <th className="px-3 py-2 text-center w-16">MiniSec3</th>
            <th className="px-3 py-2 text-center w-16">Tyre</th>
            <th className="px-3 py-2 text-center w-12">Pits</th>
            <th className="px-3 py-2 text-center w-14">I1</th>
            <th className="px-3 py-2 text-center w-14">I2</th>
            <th className="px-3 py-2 text-center w-14">ST</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {drivers.map((driver) => (
            <tr
              key={driver.driverNumber}
              className={`hover:bg-gray-800 transition-colors ${driver.isPit ? "bg-yellow-900/20" : ""}`}
            >
              <td className="px-3 py-2 text-center font-bold text-white leading-none">
                {driver.isPit ? (
                  <span className="ml-1 text-[8px] bg-yellow-600 text-black px-1 py-0.5 rounded font-bold">
                    PIT
                  </span>
                ) : (
                  driver.position
                )}
              </td>
              <td
                className="px-3 py-2 font-bold text-white leading-none"
                style={{ color: `#${driver.teamColour}` }}
              >
                {driver.driverCode}
              </td>
              <td className="px-3 py-2 text-center text-gray-300 font-mono leading-none">
                {driver.leaderGap}
              </td>
              <td className="px-3 py-2 text-center text-gray-300 font-mono leading-none">
                {driver.intervalGap}
              </td>
              <td
                className={`px-3 py-2 text-center font-mono leading-none ${
                  lapTimeToSeconds(driver.bestLap ?? "") === fastestLap
                    ? "text-purple-400"
                    : "text-gray-300"
                }`}
              >
                {driver.bestLap}
              </td>
              <td className="px-3 py-2 text-center text-gray-300 font-mono leading-none">
                {driver.lastLap?.value}
              </td>
              <SectorCell
                sector={driver?.Sectors?.["0"]}
                bestSector={driver?.bestSectors?.["0"]}
              />
              <SectorCell
                sector={driver?.Sectors?.["1"]}
                bestSector={driver?.bestSectors?.["1"]}
              />
              <SectorCell
                sector={driver?.Sectors?.["2"]}
                bestSector={driver?.bestSectors?.["2"]}
              />
              <td className="px-3 py-2 text-center">
                <SegmentBar segments={driver?.Sectors?.["0"]?.segments} />
              </td>
              <td className="px-3 py-2 text-center">
                <SegmentBar segments={driver?.Sectors?.["1"]?.segments} />
              </td>
              <td className="px-3 py-2 text-center">
                <SegmentBar segments={driver?.Sectors?.["2"]?.segments} />
              </td>
              <td className="px-3 py-2 text-center leading-none">
                <div className="flex items-center justify-center gap-1">
                  <img
                    src={`/tyre/${driver.tyreCompound.toLowerCase()}.png`}
                    alt={driver.tyreCompound}
                    className="w-5 h-5 inline-block"
                  />
                  <span className="text-gray-300 leading-none">
                    {driver.tyreAge}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-center text-gray-300 leading-none">
                {driver.pitStops}
              </td>
              <td className="px-3 py-2 text-center text-gray-300 font-mono leading-none">
                {driver.topSpeed?.I1}
              </td>
              <td className="px-3 py-2 text-center text-gray-300 font-mono leading-none">
                {driver.topSpeed?.I2}
              </td>
              <td className="px-3 py-2 text-center text-gray-300 font-mono leading-none">
                {driver.topSpeed?.ST}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
