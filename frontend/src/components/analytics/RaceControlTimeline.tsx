import React, { useMemo } from 'react';
import { Flag, Clock, AlertTriangle, Info, Gavel } from 'lucide-react';
import { RaceControl } from '@/types/analytics';

interface RaceControlTimelineProps {
  raceControls: RaceControl[];
  height?: number;
}

const RaceControlTimeline: React.FC<RaceControlTimelineProps> = ({ 
  raceControls, 
  height = 600 
}) => {
  const sortedControls = useMemo(() => {
    return [...raceControls].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [raceControls]);

  /** 判斷是否為 FIA Stewards 類型 */
  const isInvestigation = (message: string) => {
    return message?.toUpperCase().includes("FIA STEWARDS");
  };

  const getCategoryIcon = (category: string, message: string) => {
    if (isInvestigation(message)) return <Gavel className="w-4 h-4" />;
    switch (category.toLowerCase()) {
      case 'flag':
        return <Flag className="w-4 h-4" />;
      case 'other':
        return <Info className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string, flag: string | null, message: string) => {
    if (isInvestigation(message)) {
      return 'bg-pink-600 text-white border-pink-500';
    }

    if (category.toLowerCase() === 'flag' && flag) {
      switch (flag.toLowerCase()) {
        case 'green': return 'bg-green-500 text-green-100 border-green-400';
        case 'yellow':
        case 'double yellow': return 'bg-yellow-500 text-yellow-100 border-yellow-400';
        case 'red': return 'bg-red-500 text-red-100 border-red-400';
        case 'blue': return 'bg-blue-500 text-blue-100 border-blue-400';
        case 'black': return 'bg-gray-800 text-gray-100 border-gray-600';
        case 'white': return 'bg-gray-200 text-gray-800 border-gray-400';
        case 'checkered': return 'bg-gradient-to-r from-gray-800 to-white text-gray-800 border-gray-400';
        default: return 'bg-purple-500 text-purple-100 border-purple-400';
      }
    }

    switch (category.toLowerCase()) {
      case 'other': return 'bg-gray-600 text-gray-100 border-gray-500';
      case 'safetycar': return 'bg-orange-500 text-orange-100 border-orange-400';
      case 'drs': return 'bg-cyan-500 text-cyan-100 border-cyan-400';
      default: return 'bg-indigo-500 text-indigo-100 border-indigo-400';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDriverInfo = (driverNumber: number | null, lapNumber: number) => {
    const parts = [];
    if (driverNumber) parts.push(`Driver #${driverNumber}`);
    if (lapNumber > 0) parts.push(`Lap ${lapNumber}`);
    return parts.join(' • ');
  };

  if (sortedControls.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="text-center text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No race control events</p>
          <p className="text-sm">Race control data will appear here during the session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-500 p-3 rounded-xl">
          <Flag className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Race Control Timeline</h2>
      </div>

      {/* Fixed statistics bar - top right */}
      <div className="absolute top-6 right-6">
        <div className="grid grid-cols-5 gap-3 text-center mr-2">
          {["Flag", "SafetyCar", "DRS", "FIA", "Other"].map((category) => {
            const count = sortedControls.filter((c) => category === "FIA" ? isInvestigation(c.message) : c.category.toLowerCase() === category.toLowerCase()).length;
            return (
              <div key={category} className="bg-gray-800 rounded-lg px-3 py-2 min-w-[90px]">
                <div className="text-base font-bold text-white">{count}</div>
                <div className="text-[10px] text-gray-400">{category === "SafetyCar" ? "Safety Car" : category}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Scroll Area */}
      <div className="relative overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 pr-2" style={{ height: `${height - 150}px` }}>
        <div className="space-y-4">
          {sortedControls.map((control) => (
            <div className="relative flex items-start gap-9 group">
            {/* 左側彩色條 */}
            <div className={`absolute left-16 top-0 bottom-0 w-1 rounded ${isInvestigation(control.message) ? 'bg-pink-600' : getCategoryColor(control.category, control.flag, control.message).split(' ')[0]}`}></div>
          
            {/* Icon */}
            <div className="relative z-10 flex-shrink-0 self-center ml-2">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getCategoryColor(control.category, control.flag, control.message)} transition-transform duration-200 group-hover:scale-110 shadow-md`}>
                {getCategoryIcon(control.category, control.message)}
              </div>
            </div>
          
            {/* Event card */}
            <div className="flex-1 min-w-0 bg-gray-800/80 rounded-lg border border-gray-700 px-4 py-3 group-hover:border-gray-600 group-hover:bg-gray-750 transition-all duration-200 shadow-sm">
              
              {/* 第一行：標籤 + driver/lap/sector + 時間 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border shadow-sm ${getCategoryColor(control.category, control.flag, control.message)}`}>
                    {isInvestigation(control.message) ? "FIA" : control.flag ? `${control.category} - ${control.flag}` : control.category}
                  </span>
          
                  {(control.driver_number || control.lap_number > 0 || control.sector) && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {formatDriverInfo(control.driver_number, control.lap_number) && (
                        <span>{formatDriverInfo(control.driver_number, control.lap_number)}</span>
                      )}
                      {control.sector && (
                        <span>Sector {control.sector}</span>
                      )}
                    </div>
                  )}
          
                </div>
          
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Clock className="w-3 h-3" />
                  {formatTime(control.date)}
                </div>
              </div>
          
              <p className="text-white text-sm leading-snug">{control.message}</p>
            </div>
          </div>
          
          ))}
        </div>
      </div>
    </div>
  );
};

export default RaceControlTimeline;
