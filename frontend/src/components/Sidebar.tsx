import React from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BarChart3,
  ChevronsRight,
  ChevronsLeft,
  Gauge,
  Calendar,
  Trophy,
  Activity,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  activePage?: string;
  onPageChange?: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onToggle,
  activePage = "Overview",
  onPageChange,
}) => {
  const menuItems = [
    { icon: <LayoutDashboard size={28} />, label: "Overview" },
    { icon: <Gauge size={28} />, label: "Live Timing" },
    { icon: <Activity size={28} />, label: "Telemetry" },
    { icon: <BarChart3 size={28} />, label: "Analytics" },
    { icon: <Trophy size={28} />, label: "Standings" },
    { icon: <Calendar size={28} />, label: "Schedule" },
  ];

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex flex-row items-center p-2 transition-all duration-300">
        {/* 左側內容包一層，展開時 w-auto，收攏時 w-0 overflow-hidden */}
        <div
          className={`flex flex-col justify-center transition-all duration-500 ease-in-out ${open ? "w-auto mr-2" : "w-0 mr-0 overflow-hidden"}`}
        >
          <div
            className={`
              text-base font-bold tracking-widest text-red-400 drop-shadow-[0_0_5px_rgba(255,0,0,0.7)]
              transition-all duration-300 ease-in-out
              ${open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
              pointer-events-none
            `}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            F1 Dashboard
          </div>
        </div>
        <Button
          variant="ghost"
          className={`
            flex items-center left-0.5
            text-gray-300 hover:text-white hover:bg-red-600/30
            transition-all duration-300
            [&_svg]:w-7 [&_svg]:h-7
            p-0 w-10 h-10
            relative
            ${open ? "-translate-x-1" : "translate-x-0"}
          `}
          onClick={onToggle}
        >
          <div className="relative w-7 h-7">
            <ChevronsRight
              size={28}
              className={`absolute inset-0 transition-all duration-300 ${
                open
                  ? "opacity-0 rotate-90 scale-75"
                  : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <ChevronsLeft
              size={28}
              className={`absolute inset-0 transition-all duration-300 ${
                open
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-90 scale-75"
              }`}
            />
          </div>
        </Button>
      </div>
      <div
        className={`
          h-px bg-gradient-to-r from-red-500/60 via-red-400/80 to-red-500/60
          transition-all duration-300 ease-in-out mx-2
          ${open ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}
        `}
      />

      <nav className="flex flex-col mt-4 space-y-6 flex-1">
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            className={`relative flex items-center h-12 rounded-md cursor-pointer group ${
              open ? "px-3" : "px-0"
            } ${
              activePage === item.label
                ? "text-white bg-red-600/50 border-r-2 border-red-400 shadow-lg shadow-red-900/30 scale-[1.01] translate-x-[-2px]"
                : "text-gray-300 hover:text-white hover:bg-red-600/30 hover:scale-[1.01]"
            }`}
            style={{
              transition:
                "color 300ms ease-out, background-color 300ms ease-out, border-color 300ms ease-out, box-shadow 300ms ease-out, transform 300ms ease-out",
            }}
            onClick={() => onPageChange?.(item.label)}
          >
            <div className="absolute left-4 flex items-center justify-center w-7 h-7">
              {item.icon}
            </div>

            <div
              className={`
                  absolute left-16 transition-all duration-300 pointer-events-none
                  ${open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                `}
            >
              <span
                className="text-lg font-medium whitespace-nowrap"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </nav>
      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500/80 via-red-400 to-red-500/80 shadow-lg shadow-red-500/50" />
    </div>
  );
};

export default Sidebar;
