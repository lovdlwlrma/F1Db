import { ConnectionStatus } from "@/types/SSE/connection";

/**
 * 錯誤類型
 */
export enum ErrorType {
  PARSE_ERROR = "PARSE_ERROR", // JSON 解析錯誤
  CONNECTION_ERROR = "CONNECTION_ERROR", // 連線錯誤
  INIT_ERROR = "INIT_ERROR", // 初始化錯誤
  MAX_RETRIES_EXCEEDED = "MAX_RETRIES_EXCEEDED", // 超過最大重試次數
}

/**
 * 錯誤事件資料
 */
export interface ErrorEventData {
  type: ErrorType;
  error: Error | Event;
  event?: string;
  retryCount?: number;
  willRetry?: boolean;
  rawData?: string;
}

/**
 * 狀態變更事件資料
 */
export interface StatusChangeEventData {
  from: ConnectionStatus;
  to: ConnectionStatus;
  timestamp: number;
}

/**
 * 事件回調函數類型
 */
export type EventCallback<T = any> = (data: T) => void;

/**
 * 取消訂閱函數
 */
export type UnsubscribeFunction = () => void;

/**
 * 事件監聽器容器
 */
export interface EventListeners {
  initial: EventCallback[];
  update: EventCallback[];
  error: EventCallback<ErrorEventData>[];
  statusChange: EventCallback<StatusChangeEventData>[];
}

/**
 * 支援的事件名稱
 */
export type EventName = keyof EventListeners;
