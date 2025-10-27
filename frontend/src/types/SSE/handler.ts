// ==================== Handler 配置 ====================

/**
 * Handler 基礎配置
 */
export interface HandlerOptions {
  /** 是否開啟除錯日誌 */
  debug?: boolean;
  /** 是否嚴格模式（驗證失敗時拋出錯誤） */
  strict?: boolean;
}

// ==================== 驗證結果 ====================

/**
 * 驗證結果
 */
export interface ValidationResult {
  /** 是否通過驗證 */
  valid: boolean;
  /** 錯誤訊息（驗證失敗時） */
  errors?: string[];
  /** 警告訊息（可選） */
  warnings?: string[];
}

// ==================== Handler 錯誤 ====================

/**
 * Handler 錯誤類型
 */
export enum HandlerErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR", // 驗證錯誤
  TRANSFORM_ERROR = "TRANSFORM_ERROR", // 轉換錯誤
  UNKNOWN_ERROR = "UNKNOWN_ERROR", // 未知錯誤
}

/**
 * Handler 錯誤
 */
export interface HandlerError {
  type: HandlerErrorType;
  message: string;
  errors?: string[];
  originalData?: any;
  stack?: string;
}

// ==================== 回調函數 ====================

/**
 * 處理成功回調
 */
export type OnProcessedCallback<T = any> = (data: T) => void;

/**
 * 處理錯誤回調
 */
export type OnErrorCallback = (error: HandlerError) => void;

// ==================== 資料結構 ====================

/**
 * 處理後的資料元信息
 */
export interface ProcessedDataMeta {
  /** 處理時間戳 */
  processedAt: number;
  /** 資料來源 */
  source: "initial" | "update";
  /** 原始資料大小（字元數） */
  rawDataSize?: number;
}

/**
 * 處理後的 Initial 資料
 */
export interface ProcessedInitialData<T = any> {
  /** 實際資料 */
  data: T;
  /** 元信息 */
  meta: ProcessedDataMeta;
}

/**
 * 處理後的 Update 資料
 */
export interface ProcessedUpdateData<T = any> {
  /** 實際資料（增量更新） */
  data: T;
  /** 元信息 */
  meta: ProcessedDataMeta;
}

// ==================== F1 特定型別（範例） ====================

/**
 * F1 車手資料
 */
export interface F1Driver {
  number: string;
  code: string;
  name: string;
  team: string;
  position?: number;
  gap?: string;
  lastLap?: string;
  bestLap?: string;
  [key: string]: any;
}

/**
 * F1 初始資料結構（根據實際 API 調整）
 */
export interface F1InitialData {
  session?: {
    name?: string;
    type?: string;
    location?: string;
  };
  drivers?: Record<string, F1Driver>;
  weather?: {
    airTemp?: number;
    trackTemp?: number;
    humidity?: number;
  };
  [key: string]: any;
}

/**
 * F1 更新資料結構（根據實際 API 調整）
 */
export interface F1UpdateData {
  drivers?: Partial<Record<string, Partial<F1Driver>>>;
  timestamp?: number;
  [key: string]: any;
}
