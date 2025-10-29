import React from "react";
import { RaceControlData } from "@/types/LiveTiming/liveTiming";
import { useRaceControlScroll } from "@/hooks/useRaceControlScroll";
import { getFlagColor, getIcon } from "@/utils/livetiming";

interface RaceControlBarProps {
  messages: RaceControlData[];
  scrollSpeed?: number; // 滾動速度(像素/秒)，預設 60
  maxVisible?: number; // 最大可見項目數量，預設 5
  itemGap?: number; // 項目間距(px)，預設 10
}

export const RaceControlBar: React.FC<RaceControlBarProps> = ({
  messages,
  scrollSpeed = 60,
  maxVisible = 5,
  itemGap = 10,
}) => {
  const {
    setIsPaused,
    scrollContainerRef,
    duplicatedMessages,
    getGlobalIndex,
  } = useRaceControlScroll({
    messages,
    scrollSpeed,
    maxVisible,
  });

  if (!messages || messages.length === 0) return null;

  return (
    <div className="bg-gray-800 border-b border-gray-700 relative overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="overflow-x-hidden scrollbar-hide"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex py-2 px-4" style={{ gap: `${itemGap}px` }}>
          {duplicatedMessages.map((msg, idx) => {
            const globalIndex = getGlobalIndex(idx);
            const isLatest = globalIndex === messages.length;
            return (
              <React.Fragment key={idx}>
                <span className="text-gray-300 text-[10px]">
                  #{globalIndex}
                </span>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs text-white flex-shrink-0 transition-all duration-300
                  ${
                    isLatest
                      ? "bg-gray-700/60 border border-gray-300/60 shadow-[0_0_10px_rgba(255,255,255,0.15)]"
                      : "bg-gray-900/70 border border-gray-700/50"
                  }`}
                >
                  {getIcon(msg.category)}
                  {msg.flag && (
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-white text-[10px] ${getFlagColor(
                        msg.flag,
                      )}`}
                    >
                      {msg.flag}
                    </span>
                  )}
                  <span className="whitespace-nowrap">{msg.message}</span>
                  {msg.lap && (
                    <span className="text-gray-400 ml-1 text-[10px]">
                      Lap {msg.lap}
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 右側漸層遮罩 */}
      <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-gray-800 to-transparent pointer-events-none"></div>

      {/* 左側漸層遮罩 */}
      <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-gray-800 to-transparent pointer-events-none"></div>
    </div>
  );
};
