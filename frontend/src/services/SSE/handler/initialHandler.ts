import BaseHandler from "@/services/SSE/handler/baseHandler";
import type {
  HandlerOptions,
  ValidationResult,
  ProcessedInitialData,
} from "@/types/SSE/handler";

/**
 * Initial Handler 配置選項
 */
export interface InitialHandlerOptions extends HandlerOptions {
  /** 必要欄位列表 */
  requiredFields?: string[];
  /** 是否自動添加時間戳 */
  addTimestamp?: boolean;
}

/**
 * Initial Handler
 * 處理完整的初始資料
 */
export default class InitialHandler<T = any> extends BaseHandler<
  any,
  ProcessedInitialData<T>
> {
  private requiredFields: string[];
  private addTimestamp: boolean;

  constructor(options: InitialHandlerOptions = {}) {
    super(options);

    this.requiredFields = options.requiredFields || [];
    this.addTimestamp = options.addTimestamp ?? true;
  }

  /**
   * Handler 名稱
   */
  protected getHandlerName(): string {
    return "InitialHandler";
  }

  /**
   * 驗證 initial 資料
   */
  protected validate(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. 檢查是否為物件
    if (!data || typeof data !== "object") {
      errors.push("Initial Data should be an object");
      return this.createValidationResult(false, errors);
    }

    // 2. 檢查是否為空物件
    if (Object.keys(data).length === 0) {
      warnings.push("Initial data is an empty object");
    }

    // 3. 檢查必要欄位
    for (const field of this.requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      } else if (data[field] === null || data[field] === undefined) {
        errors.push(`Required field ${field} is null or undefined`);
      }
    }

    // 4. 檢查資料結構（針對 F1 資料的範例驗證）
    if ("drivers" in data) {
      if (typeof data.drivers !== "object" || Array.isArray(data.drivers)) {
        errors.push("drivers field must be an object");
      } else if (Object.keys(data.drivers).length === 0) {
        warnings.push("drivers data is empty");
      }
    }

    if ("session" in data) {
      if (typeof data.session !== "object" || Array.isArray(data.session)) {
        errors.push("session field must be an object");
      }
    }

    if ("weather" in data) {
      if (typeof data.weather !== "object" || Array.isArray(data.weather)) {
        errors.push("weather field must be an object");
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
        fieldCount: Object.keys(data).length,
      },
    );

    return this.createValidationResult(valid, errors, warnings);
  }

  /**
   * 轉換資料
   */
  protected transform(data: any): ProcessedInitialData<T> {
    this.log("Start transforming initial data");

    // 1. 深拷貝資料（避免修改原始資料）
    const transformedData = this.deepClone(data);

    // 2. 正規化資料結構（根據需求調整）
    const normalizedData = this.normalize(transformedData);

    // 3. 添加元信息
    const result: ProcessedInitialData<T> = {
      data: normalizedData as T,
      meta: {
        processedAt: Date.now(),
        source: "initial",
        rawDataSize: JSON.stringify(data).length,
      },
    };

    this.log("Initial data transformation completed", {
      dataSize: result.meta.rawDataSize,
      processedAt: new Date(result.meta.processedAt).toISOString(),
    });

    return result;
  }

  /**
   * 正規化資料結構
   * 可以根據實際需求調整
   */
  private normalize(data: any): any {
    const normalized = { ...data };

    // 範例：添加時間戳（如果原始資料沒有）
    if (this.addTimestamp && !normalized.timestamp) {
      normalized.timestamp = Date.now();
    }

    // 範例：正規化車手資料
    if (normalized.drivers && typeof normalized.drivers === "object") {
      Object.keys(normalized.drivers).forEach((driverId) => {
        const driver = normalized.drivers[driverId];

        // 確保必要欄位存在
        if (!driver.number) driver.number = driverId;
        if (!driver.code) driver.code = driverId;

        // 轉換數值類型
        if (driver.position && typeof driver.position === "string") {
          driver.position = parseInt(driver.position, 10);
        }
      });
    }

    return normalized;
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
   * 取得統計資訊
   */
  public getStats(data: any): {
    totalFields: number;
    driverCount: number;
    hasSession: boolean;
    hasWeather: boolean;
  } {
    return {
      totalFields: Object.keys(data).length,
      driverCount: data.drivers ? Object.keys(data.drivers).length : 0,
      hasSession: !!data.session,
      hasWeather: !!data.weather,
    };
  }
}
