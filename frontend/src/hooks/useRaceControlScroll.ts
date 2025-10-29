import { useState, useEffect, useRef } from "react";
import { RaceControlData } from "@/types/LiveTiming/liveTiming";

interface UseRaceControlScrollOptions {
  messages: RaceControlData[];
  scrollSpeed?: number;
  maxVisible?: number;
}

interface UseRaceControlScrollReturn {
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  duplicatedMessages: RaceControlData[];
  latestMessages: RaceControlData[];
  getGlobalIndex: (idx: number) => number;
}

export const useRaceControlScroll = ({
  messages,
  scrollSpeed = 60,
  maxVisible = 5,
}: UseRaceControlScrollOptions): UseRaceControlScrollReturn => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const messagesLengthRef = useRef<number>(0);

  const latestMessages = messages.slice(-maxVisible);
  const duplicatedMessages = [...latestMessages, ...latestMessages];

  const getGlobalIndex = (idx: number): number => {
    return (
      messages.length -
      latestMessages.length +
      (idx % latestMessages.length) +
      1
    );
  };

  // 當訊息更新時，重置滾動位置
  useEffect(() => {
    if (messages.length !== messagesLengthRef.current) {
      scrollPositionRef.current = 0;
      messagesLengthRef.current = messages.length;

      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const contentWidth = container.scrollWidth / 2;
        container.scrollLeft = contentWidth - container.clientWidth;
        scrollPositionRef.current = contentWidth - container.clientWidth;
      }
    }
  }, [messages.length]);

  // 平滑滾動動畫
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isPaused) return;

    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
      }

      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      scrollPositionRef.current += scrollSpeed * deltaTime;

      const contentWidth = container.scrollWidth / 2;

      if (scrollPositionRef.current >= contentWidth) {
        scrollPositionRef.current -= contentWidth;
      }

      container.scrollLeft = scrollPositionRef.current;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, scrollSpeed, messages.length]);

  return {
    isPaused,
    setIsPaused,
    scrollContainerRef,
    duplicatedMessages,
    latestMessages,
    getGlobalIndex,
  };
};
