import React, { useEffect, useState } from 'react';
import { Race } from '@/types/race';

interface TopBarProps {
  nextRace: Race | null;
  loading: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ nextRace, loading }) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!nextRace?.start_date) return;

    const updateDays = () => {
      const now = new Date();
      const raceDate = new Date(nextRace.start_date);
      const diff = raceDate.getTime() - now.getTime();

      if (diff <= 0) {
        setDaysLeft(0);
        return;
      }

      const days = Math.ceil(diff / (1000 * 60 * 60 * 24)); // 向上取整
      setDaysLeft(days);
    };

    updateDays();
    const intervalId = setInterval(updateDays, 1000 * 60 * 60); // 每小時更新一次就好
    return () => clearInterval(intervalId);
  }, [nextRace]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50 p-6 rounded-lg mb-4 -mt-2">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600/30 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-600/30 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!nextRace) {
    return (
      <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50 p-6 rounded-lg mb-4 -mt-2">
        <h2 className="text-2xl font-bold text-white mb-2">No Upcoming Races</h2>
        <p className="text-gray-300">No upcoming F1 races found.</p>
      </div>
    );
  }

  const raceTitle = nextRace.title;
  const raceName = nextRace.name;
  const country = nextRace.city;
  const circuitName = nextRace.circuit?.name ?? '';
  const countryFlag = nextRace.country_flag_image_url;

  return (
    <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-red-500/20 p-3 rounded-lg mb-2 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8 pl-4">
          {countryFlag && (
            <img
              src={countryFlag}
              alt={`${country} flag`}
              className="w-16 h-12 object-cover rounded shadow-md border border-white/20"
            />
          )}
          <div className="flex flex-col text-left">
            <h2
              className="text-2xl font-bold text-white mb-1"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                textShadow: '0 0 6px #ff0000, 0 0 10px #ff0000',
              }}
            >
              {raceTitle}
            </h2>
            <p className="text-lg">
              <span className="font-bold text-white">{raceName}</span>
              <span className="text-gray-400"> • {country}</span>
              <span className="text-gray-400"> • {circuitName}</span>
            </p>
          </div>
        </div>

        {daysLeft !== null && (
          <div className="text-right flex flex-col items-center bg-gray-800/60 backdrop-blur-sm px-6 py-2 rounded-lg border border-white/20 shadow-inner">
            <div
              className="text-xl font-bold text-white mb-1 text-center"
              style={{ textShadow: '0 0 6px #00ffff, 0 0 10px #00ffff' }}
            >
              {daysLeft} {daysLeft === 1 ? "day" : "days"}
            </div>
            <div
              className="text-gray-300 text-sm uppercase tracking-wider text-center"
              style={{ textShadow: '0 0 3px #00ffff' }}
            >
              until race
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
