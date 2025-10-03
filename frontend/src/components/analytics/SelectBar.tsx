import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  year: number;
  setYear: (y: number) => void;
  grandPrix: string;
  setGrandPrix: (g: string) => void;
  grandPrixList: string[];
}

const SelectBar: React.FC<Props> = ({
  year,
  setYear,
  grandPrix,
  setGrandPrix,
  grandPrixList,
}) => {
  const selectContentClass =
    "bg-gray-800 text-white shadow-lg rounded-md overflow-y-auto";
  const selectItemClass = "hover:bg-gray-700 px-2 py-1 rounded";

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-4">
      {/* Year */}
      <Select
        value={year.toString()}
        onValueChange={(val) => setYear(Number(val))}
      >
        <SelectTrigger className="w-32 bg-gray-700 text-white rounded">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className={selectContentClass}>
          <SelectGroup>
            {[2023, 2024, 2025].map((y) => (
              <SelectItem
                key={`year-${y}`}
                value={y.toString()}
                className={selectItemClass}
              >
                {y}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Grand Prix */}
      <Select value={grandPrix} onValueChange={(val) => setGrandPrix(val)}>
        <SelectTrigger className="w-56 bg-gray-700 text-white rounded">
          <SelectValue placeholder="Grand Prix" />
        </SelectTrigger>
        <SelectContent className={selectContentClass}>
          <SelectGroup>
            {grandPrixList.map((name) => (
              <SelectItem
                key={`gp-${name}`}
                value={name}
                className={selectItemClass}
              >
                {name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectBar;
