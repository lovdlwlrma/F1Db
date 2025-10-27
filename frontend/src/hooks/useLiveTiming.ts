import { useState, useEffect, useRef } from "react";
import { F1LiveTimingService } from "@/services/SSE/liveTiming";
import type { F1State } from "@/types/SSE/store";
import { ConnectionStatus } from "@/types/SSE/connection";

/**
 * 使用 F1 即時資料
 */
export function useLiveTiming() {
  const [data, setData] = useState<F1State | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED,
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const serviceRef = useRef<F1LiveTimingService | null>(null);

  useEffect(() => {
    // 初始化服務
    const service = new F1LiveTimingService({
      debug: true,
      enableSnapshot: false,
    });
    serviceRef.current = service;

    // 訂閱資料變更
    const unsubscribeData = service.subscribe((newState) => {
      setData(newState);
      setIsInitialized(service.isInitialized());
    });

    // 訂閱連線狀態
    let statusCheckInterval: NodeJS.Timeout;
    const checkStatus = () => {
      setConnectionStatus(service.getConnectionStatus());
      setIsInitialized(service.isInitialized());
    };

    // 啟動服務
    service.start();

    // 定期檢查狀態（每秒）
    statusCheckInterval = setInterval(checkStatus, 1000);
    checkStatus();

    // 清理
    return () => {
      clearInterval(statusCheckInterval);
      unsubscribeData();
      service.destroy();
    };
  }, []);

  return {
    data,
    connectionStatus,
    isInitialized,
    isConnected: connectionStatus === ConnectionStatus.CONNECTED,
    service: serviceRef.current,
  };
}

/**
 * 使用特定部分的 F1 資料（細粒度訂閱）
 *
 * @example
 * const timingData = useF1DataSelector((state) => state.TimingData);
 */
export function useF1DataSelector<T>(selector: (state: F1State) => T) {
  const [selectedData, setSelectedData] = useState<T | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED,
  );
  const serviceRef = useRef<F1LiveTimingService | null>(null);

  useEffect(() => {
    const service = new F1LiveTimingService({
      debug: true,
    });
    serviceRef.current = service;

    // 訂閱選擇的資料
    const unsubscribe = service.subscribeSelector(selector, (data) => {
      setSelectedData(data);
    });

    // 訂閱連線狀態
    let statusCheckInterval: NodeJS.Timeout;
    const checkStatus = () => {
      setConnectionStatus(service.getConnectionStatus());
    };

    service.start();
    statusCheckInterval = setInterval(checkStatus, 1000);
    checkStatus();

    return () => {
      clearInterval(statusCheckInterval);
      unsubscribe();
      service.destroy();
    };
  }, []);

  return {
    data: selectedData,
    connectionStatus,
    isConnected: connectionStatus === ConnectionStatus.CONNECTED,
    service: serviceRef.current,
  };
}
