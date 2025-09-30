import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Driver, LapData } from "@/types/telemetry";

interface Props {
  year: number;
  setYear: (y: number) => void;
  country: string;
  setCountry: (c: string) => void;
  sessionName: string;
  setSessionName: (s: string) => void;
  raceNames: string[];
  sessionTypes: string[];
  availableDrivers: Driver[];

  selectedDriver1: Driver | null;
  setSelectedDriver1: (driver: Driver | null) => void;
  selectedLap1: LapData | null;
  setSelectedLap1: (lap: LapData | null) => void;

  selectedDriver2: Driver | null;
  setSelectedDriver2: (driver: Driver | null) => void;
  selectedLap2: LapData | null;
  setSelectedLap2: (lap: LapData | null) => void;

  laps1: LapData[];
  laps2: LapData[];
}

const SelectBar: React.FC<Props> = ({
  year, setYear,
  country, setCountry,
  sessionName, setSessionName,
  raceNames, sessionTypes,
  availableDrivers,
  selectedDriver1, setSelectedDriver1,
  selectedDriver2, setSelectedDriver2,
  laps1, selectedLap1, setSelectedLap1,
  laps2, selectedLap2, setSelectedLap2
}) => {
  const selectContentClass = "bg-gray-800 text-white shadow-lg rounded-md overflow-y-auto";
  const selectItemClass = "hover:bg-gray-700 px-2 py-1 rounded";

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-4">
      {/* 第一行 */}
      <div className="flex gap-4 w-full justify-center flex-wrap">
        {/* Year */}
        <Select value={year.toString()} onValueChange={val => setYear(Number(val))}>
          <SelectTrigger className="w-28 bg-gray-700 text-white rounded">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className={selectContentClass} style={{ minWidth: '100%' }}>
            <SelectGroup>
              {[2023, 2024, 2025].map((y, idx) => (
                <SelectItem key={`year-${y}-${idx}`} value={y.toString()} className={selectItemClass}>{y}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Grand Prix */}
        <Select value={country} onValueChange={val => setCountry(val)}>
          <SelectTrigger className="w-72 bg-gray-700 text-white rounded">
            <SelectValue placeholder="Race" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            <SelectGroup>
              {raceNames.map((name, idx) => (
                <SelectItem key={`race-${name}-${idx}`} value={name} className={selectItemClass}>{name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Session Name */}
        <Select value={sessionName} onValueChange={val => setSessionName(val)}>
          <SelectTrigger className="w-40 bg-gray-700 text-white rounded">
            <SelectValue placeholder="Session" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            <SelectGroup>
              {sessionTypes.map((name, idx) => (
                <SelectItem key={`session-${name}-${idx}`} value={name} className={selectItemClass}>{name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* 第二行 */}
      {/* Driver 1 + Lap 1 */}
      <div className="flex gap-4">
        <Select
          value={selectedDriver1 ? String(selectedDriver1.driver_number) : ""}
          onValueChange={val => {
            const driver = availableDrivers.find(d => String(d.driver_number) === val);
            setSelectedDriver1(driver ?? null);
          }}
        >
          <SelectTrigger className="w-48 bg-gray-700 text-white rounded">
            <SelectValue placeholder="Select Driver 1" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            <SelectGroup>
              {availableDrivers.map(d => (
                <SelectItem key={`d1-${d.driver_number}`} value={String(d.driver_number)} className={selectItemClass}>
                  <span style={{ color: `#${d.team_colour}` }}>{d.full_name}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Lap 1 */}
        <Select
          value={selectedLap1 ? String(selectedLap1.lap_number) : ""}
          onValueChange={val => {
            const lap = laps1.find(l => String(l.lap_number) === val);
            setSelectedLap1(lap ?? null);
          }}
        >
          <SelectTrigger className="w-28 bg-gray-700 text-white rounded">
            <SelectValue placeholder="Lap" />
          </SelectTrigger>
          <SelectContent className={selectContentClass} style={{ minWidth: '100%' }}>
            <SelectGroup>
              {laps1.length > 0
                ? laps1.map(l => (
                    <SelectItem
                      key={`lap1-${l.lap_number}`}
                      value={String(l.lap_number)}
                      className={selectItemClass}
                    >
                      Lap {l.lap_number}
                    </SelectItem>
                  ))
                : <SelectItem value="no-laps" disabled>No laps</SelectItem>}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Driver 2 + Lap 2 */}
      <div className="flex gap-4">
        <Select
          value={selectedDriver2 ? String(selectedDriver2.driver_number) : ""}
          onValueChange={val => {
            const driver = availableDrivers.find(d => String(d.driver_number) === val);
            setSelectedDriver2(driver ?? null);
          }}
        >
          <SelectTrigger className="w-48 bg-gray-700 text-white rounded">
            <SelectValue placeholder="Driver 2 (optional)" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            <SelectGroup>
              {availableDrivers.map(d => (
                <SelectItem key={`d2-${d.driver_number}`} value={String(d.driver_number)} className={selectItemClass}>
                  <span style={{ color: `#${d.team_colour}` }}>{d.full_name}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Lap 2 (只有選 driver2 才能操作) */}
        <Select
          value={selectedLap2 ? String(selectedLap2.lap_number) : ""}
          onValueChange={val => {
            const lap = laps2.find(l => String(l.lap_number) === val);
            setSelectedLap2(lap ?? null);
          }}
          disabled={!selectedDriver2}
        >
          <SelectTrigger className="w-28 bg-gray-700 text-white rounded">
            <SelectValue placeholder="Lap" />
          </SelectTrigger>
          <SelectContent className={selectContentClass} style={{ minWidth: '100%' }}>
            <SelectGroup>
              {laps2.length > 0
                ? laps2.map(l => (
                    <SelectItem
                      key={`lap2-${l.lap_number}`}
                      value={String(l.lap_number)}
                      className={selectItemClass}
                    >
                      Lap {l.lap_number}
                    </SelectItem>
                  ))
                : <SelectItem value="no-laps" disabled>No laps</SelectItem>}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SelectBar;
