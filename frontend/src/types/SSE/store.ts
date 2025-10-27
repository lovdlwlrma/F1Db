import type * as LiveTiming from "@/types/LiveTiming";

// ==================== Store 狀態 ====================

/**
 * F1 完整狀態
 * 對應 Initial 事件的完整資料結構
 */
export interface F1State {
  DriverList?: LiveTiming.DriverList;
  ExtrapolatedClock?: LiveTiming.ExtrapolatedClock;
  HeartBeat?: LiveTiming.Heartbeat;
  LapCount?: LiveTiming.LapCount;
  PitLaneTimeCollection?: LiveTiming.PitLaneTimeCollection;
  RaceControlMessages?: LiveTiming.RaceControlMessages;
  SessionData?: LiveTiming.SessionData;
  SessionInfo?: LiveTiming.SessionInfo;
  SessionStatus?: LiveTiming.SessionStatus;
  TeamRadio?: LiveTiming.TeamRadio;
  TimingAppData?: LiveTiming.TimingAppData;
  TimingData?: LiveTiming.TimingData;
  TimingStats?: LiveTiming.TimingStats;
  TrackStatus?: LiveTiming.TrackStatus;
  WeatherData?: LiveTiming.WeatherData;
}

/**
 * 部分狀態更新（對應 Update 事件）
 */
export type F1StateUpdate = Partial<F1State>;

// ==================== 訂閱機制 ====================

/**
 * 訂閱回調函數
 */
export type SubscribeCallback = (state: F1State) => void;

/**
 * 選擇器函數（用於細粒度訂閱）
 */
export type Selector<T = any> = (state: F1State) => T;

/**
 * 選擇器訂閱回調
 */
export type SelectorCallback<T = any> = (selected: T) => void;

/**
 * 取消訂閱函數
 */
export type Unsubscribe = () => void;

// ==================== Store 配置 ====================

/**
 * Data Store 配置選項
 */
export interface DataStoreOptions {
  /** 是否開啟除錯日誌 */
  debug?: boolean;
  /** 是否啟用狀態快照（用於 time-travel） */
  enableSnapshot?: boolean;
  /** 最大快照數量 */
  maxSnapshots?: number;
}

// ==================== 狀態快照 ====================

/**
 * 狀態快照
 */
export interface StateSnapshot {
  /** 快照 ID */
  id: string;
  /** 快照時間戳 */
  timestamp: number;
  /** 狀態資料 */
  state: F1State;
  /** 快照來源 */
  source: "initial" | "update";
}

// ==================== Store 統計 ====================

/**
 * Store 統計資訊
 */
export interface StoreStats {
  /** 是否已初始化 */
  initialized: boolean;
  /** 初始化時間 */
  initializedAt: number | null;
  /** 最後更新時間 */
  lastUpdateAt: number | null;
  /** 更新次數 */
  updateCount: number;
  /** 訂閱者數量 */
  subscriberCount: number;
  /** 當前狀態大小（估計） */
  stateSize: number;
}

// ==================== 深度合併選項 ====================

/**
 * 深度合併選項
 */
export interface DeepMergeOptions {
  /** 是否合併陣列（false 則直接替換） */
  mergeArrays?: boolean;
  /** 自訂合併函數 */
  customMerge?: (key: string, target: any, source: any) => any;
}
