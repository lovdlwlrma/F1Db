import BaseHandler from "@/services/SSE/handler/baseHandler";
import type {
  HandlerOptions,
  ValidationResult,
  ProcessedUpdateData,
} from "@/types/SSE/handler";

/**
 * Update Handler 配置選項
 */
export interface UpdateHandlerOptions extends HandlerOptions {
  /** 是否允許空更新 */
  allowEmpty?: boolean;
  /** 是否自動添加時間戳 */
  addTimestamp?: boolean;
  /** 最小更新間隔 ms（避免過於頻繁的更新） */
  minUpdateInterval?: number;
}

/**
 * Update Handler
 * 處理增量更新資料
 */
export default class UpdateHandler<T = any> extends BaseHandler<
  any,
  ProcessedUpdateData<T>
> {
  private allowEmpty: boolean;
  private addTimestamp: boolean;
  private minUpdateInterval: number;
  private lastUpdateTime: number = 0;

  constructor(options: UpdateHandlerOptions = {}) {
    super(options);

    this.allowEmpty = options.allowEmpty ?? false;
    this.addTimestamp = options.addTimestamp ?? true;
    this.minUpdateInterval = options.minUpdateInterval ?? 0;
  }

  /**
   * Handler 名稱
   */
  protected getHandlerName(): string {
    return "UpdateHandler";
  }

  /**
   * 驗證 update 資料
   */
  protected validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. 檢查是否為物件
    if (!data || typeof data !== "object") {
      errors.push("Update Data should be an object");
      return this.createValidationResult(false, errors);
    }

    // 2. 檢查是否為空更新
    const hasData = this.hasActualData(data);
    if (!hasData) {
      if (this.allowEmpty) {
        warnings.push("Update Data is empty");
      } else {
        errors.push("Update Data cannot be empty");
      }
    }

    // 3. 檢查更新頻率
    const now = Date.now();
    if (this.minUpdateInterval > 0 && this.lastUpdateTime > 0) {
      const timeSinceLastUpdate = now - this.lastUpdateTime;
      if (timeSinceLastUpdate < this.minUpdateInterval) {
        warnings.push(
          `Updates are too frequent: ${timeSinceLastUpdate} < ${this.minUpdateInterval}ms`,
        );
      }
    }

    // 4. 檢查資料結構（針對 F1 資料的範例驗證）
    if ("drivers" in data) {
      if (typeof data.drivers !== "object" || Array.isArray(data.drivers)) {
        errors.push("drivers field must be an object");
      }
    }

    // 5. 驗證時間戳（如果有）
    if ("timestamp" in data) {
      const timestamp = data.timestamp;
      if (typeof timestamp !== "number") {
        warnings.push("timestamp field should be a number");
      } else if (timestamp > Date.now() + 1000) {
        warnings.push("timestamp is in the future (possible timezone issue)");
      }
    }

    // 驗證完成
    const valid = errors.length === 0;

    this.log(
      valid ? "info" : "warn",
      `Validation ${valid ? "passed" : "failed"}`,
      {
        errors,
        warnings,
        hasData,
      },
    );

    return this.createValidationResult(valid, errors, warnings);
  }

  /**
   * 轉換資料
   */
  protected transform(data: any): ProcessedUpdateData<T> {
    this.log("Start transforming update data");

    // 1. 深拷貝資料
    const transformedData = this.deepClone(data);

    // 2. 正規化增量資料
    const normalizedData = this.normalize(transformedData);

    // 3. 更新最後處理時間
    this.lastUpdateTime = Date.now();

    // 4. 添加元信息
    const result: ProcessedUpdateData<T> = {
      data: normalizedData as T,
      meta: {
        processedAt: this.lastUpdateTime,
        source: "update",
        rawDataSize: JSON.stringify(data).length,
      },
    };

    this.log("update data transformed", {
      dataSize: result.meta.rawDataSize,
      processedAt: new Date(result.meta.processedAt).toISOString(),
    });

    return result;
  }

  /**
   * 正規化增量資料
   */
  private normalize(data: any): any {
    const normalized = { ...data };

    // 範例：添加時間戳（如果原始資料沒有）
    if (this.addTimestamp && !normalized.timestamp) {
      normalized.timestamp = Date.now();
    }

    // 範例：正規化車手更新資料
    if (normalized.drivers && typeof normalized.drivers === "object") {
      Object.keys(normalized.drivers).forEach((driverId) => {
        const driverUpdate = normalized.drivers[driverId];

        // 轉換數值類型
        if (
          driverUpdate.position &&
          typeof driverUpdate.position === "string"
        ) {
          driverUpdate.position = parseInt(driverUpdate.position, 10);
        }

        // 清理空值（可選）
        Object.keys(driverUpdate).forEach((key) => {
          if (driverUpdate[key] === null || driverUpdate[key] === undefined) {
            delete driverUpdate[key];
          }
        });
      });
    }

    // 範例：移除空的子物件
    Object.keys(normalized).forEach((key) => {
      if (
        typeof normalized[key] === "object" &&
        !Array.isArray(normalized[key]) &&
        normalized[key] !== null &&
        Object.keys(normalized[key]).length === 0
      ) {
        delete normalized[key];
      }
    });

    return normalized;
  }

  /**
   * 檢查是否有實際資料
   */
  private hasActualData(data: any): boolean {
    if (!data || typeof data !== "object") {
      return false;
    }

    // 檢查是否為空物件
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return false;
    }

    // 檢查是否所有值都是空的
    for (const key of keys) {
      const value = data[key];

      // 跳過 timestamp 和 meta 欄位
      if (key === "timestamp" || key === "meta") {
        continue;
      }

      // 如果值存在且不為空，則有資料
      if (value !== null && value !== undefined) {
        if (typeof value === "object") {
          if (Array.isArray(value) && value.length > 0) {
            return true;
          }
          if (!Array.isArray(value) && Object.keys(value).length > 0) {
            return true;
          }
        } else {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 深拷貝物件
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any;
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item)) as any;
    }

    if (obj instanceof Object) {
      const clonedObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }

    return obj;
  }

  /**
   * 重置最後更新時間
   */
  public resetLastUpdateTime(): void {
    this.lastUpdateTime = 0;
    this.log("Last update time reset");
  }

  /**
   * 取得統計資訊
   */
  public getStats(data: any): {
    hasData: boolean;
    updatedFields: string[];
    driverUpdateCount: number;
    timeSinceLastUpdate: number;
  } {
    const updatedFields = Object.keys(data).filter(
      (key) => key !== "timestamp" && key !== "meta",
    );

    return {
      hasData: this.hasActualData(data),
      updatedFields,
      driverUpdateCount: data.drivers ? Object.keys(data.drivers).length : 0,
      timeSinceLastUpdate:
        this.lastUpdateTime > 0 ? Date.now() - this.lastUpdateTime : 0,
    };
  }
}
