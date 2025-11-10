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
    <div className="bg-gray-800 border-t border-gray-700 relative overflow-hidden h-[58px] flex items-center">
      <div
        ref={scrollContainerRef}
        className="overflow-x-hidden scrollbar-hide h-full flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex items-center px-2"
          style={{ gap: `${itemGap}px` }}
        >
          {duplicatedMessages.map((msg, idx) => {
            const globalIndex = getGlobalIndex(idx);
            const isLatest = globalIndex === messages.length;

            return (
              <React.Fragment key={idx}>
                {/* 左側訊息序號 */}
                <span className="text-gray-400 text-[12px] font-mono self-center select-none px-1">
                  #{globalIndex}
                </span>

                {/* 主要訊息卡片 */}
                <div
                  className={`flex items-center gap-2 px-4 py-[12px] rounded font-mono text-[14px] text-white flex-shrink-0 transition-all duration-300 leading-none
                  ${
                    isLatest
                      ? "bg-gray-700/70 border border-gray-400/50 shadow-[0_0_6px_rgba(255,255,255,0.15)]"
                      : "bg-gray-900/70 border border-gray-700/50"
                  }`}
                >
                  {/* 類別 icon */}
                  <div className="flex items-center justify-center text-gray-200">
                    {getIcon(msg.category)}
                  </div>

                  {/* 旗幟 */}
                  {msg.flag && (
                    <span
                      className={`px-2 py-[2px] rounded font-bold text-white text-[11px] uppercase ${getFlagColor(
                        msg.flag,
                      )}`}
                    >
                      {msg.flag}
                    </span>
                  )}

                  {/* 訊息文字 */}
                  <span className="whitespace-nowrap">{msg.message}</span>

                  {/* 圈數資訊 */}
                  {msg.lap > 0 && (
                    <span className="text-gray-400 ml-1 text-[11px] font-mono">
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
      <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-gray-800 to-transparent pointer-events-none"></div>

      {/* 左側漸層遮罩 */}
      <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-gray-800 to-transparent pointer-events-none"></div>
    </div>
  );
};
