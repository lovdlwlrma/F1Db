import React from 'react';
import { Race } from '@/types/race';

interface ScheduleTableProps {
  nextRace: Race | null;
  loading: boolean;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ nextRace, loading }) => {
  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return 'TBD';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 h-[460px]">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center h-[72px]">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!nextRace || !nextRace.sessions) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 h-[250px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">📅</div>
          <p className="text-gray-400">No schedule information available</p>
        </div>
      </div>
    );
  }

  // 使用 sessions 陣列
  const sessions = nextRace.sessions
    .map((s) => ({
      key: s.name, // 或 s.type+s.name 保證唯一
      label: s.name,
      startDate: s.start_date,
      type: s.type,
    }))
    .filter((s) => s.startDate);

  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 h-full shadow-lg">
      <div
        className="grid gap-3 h-full"
        style={{ gridTemplateRows: `repeat(${sessions.length}, 1fr)` }}
      >
        {sessions.map((session) => (
          <div
            key={session.key}
            className={`flex justify-between items-center p-3 rounded-lg transition transform hover:scale-[1.02] hover:shadow-md ${
              session.type === 'Race'
                ? 'bg-gradient-to-r from-red-600/30 to-red-500/20 border border-red-500/40'
                : 'bg-gray-800/40 border border-gray-700/40'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div
                className={`w-3 h-3 rounded-full ${
                  session.type === 'Race'
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-gray-500'
                }`}
              />
              <span
                className={`font-semibold tracking-wide text-ellipsis overflow-hidden whitespace-nowrap ${
                  session.type === 'Race' ? 'text-red-300' : 'text-gray-200'
                }`}
              >
                {session.label}
              </span>
            </div>
            <span
              className={`text-sm font-mono ml-4 flex-shrink-0 text-right ${
                session.type === 'Race' ? 'text-red-200' : 'text-gray-400'
              }`}
            >
              {formatDateTime(session.startDate)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleTable;
