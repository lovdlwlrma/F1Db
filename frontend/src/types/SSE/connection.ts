/**
 * 連線狀態
 */
export enum ConnectionStatus {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  RECONNECTING = "RECONNECTING",
  FAILED = "FAILED",
}

/**
 * 連線管理器配置選項
 */
export interface SSEConnectionOptions {
  /** 最大重試次數 (預設: 5) */
  maxRetries?: number;
  /** 初始重試延遲 ms (預設: 1000) */
  initialRetryDelay?: number;
  /** 最大重試延遲 ms (預設: 30000) */
  maxRetryDelay?: number;
  /** 重試延遲倍數 (預設: 2) */
  retryMultiplier?: number;
  /** 是否開啟除錯日誌 (預設: false) */
  debug?: boolean;
}

/**
 * 統計資訊
 */
export interface ConnectionStats {
  status: ConnectionStatus;
  retryCount: number;
  shouldReconnect: boolean;
  listeners: {
    initial: number;
    update: number;
    error: number;
    statusChange: number;
  };
}
