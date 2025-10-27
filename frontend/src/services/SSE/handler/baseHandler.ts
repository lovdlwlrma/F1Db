import type {
  HandlerOptions,
  HandlerError,
  HandlerErrorType,
  ValidationResult,
  OnProcessedCallback,
  OnErrorCallback,
} from "@/types/SSE/handler";

/**
 * Handler 基礎類別
 */
export default abstract class BaseHandler<TInput = any, TOutput = any> {
  protected options: Required<HandlerOptions>;
  protected onProcessed?: OnProcessedCallback<TOutput>;
  protected onError?: OnErrorCallback;

  constructor(options: HandlerOptions = {}) {
    this.options = {
      debug: options.debug ?? false,
      strict: options.strict ?? false,
    };
  }

  /**
   * 設定處理成功回調
   */
  public setOnProcessed(callback: OnProcessedCallback<TOutput>): this {
    this.onProcessed = callback;
    return this;
  }

  /**
   * 設定錯誤回調
   */
  public setOnError(callback: OnErrorCallback): this {
    this.onError = callback;
    return this;
  }

  /**
   * 處理資料（公開方法）
   * @param rawData 原始資料
   */
  public handle(rawData: TInput): void {
    try {
      this.log("Started handling data", { dataType: typeof rawData });

      // 1. 驗證資料
      const validationResult = this.validate(rawData);

      if (!validationResult.valid) {
        this.handleValidationError(validationResult, rawData);
        return;
      }

      // 顯示警告（如果有）
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        validationResult.warnings.forEach((warning) => {
          this.log("warn", warning);
        });
      }

      // 2. 轉換資料
      const transformedData = this.transform(rawData);
      this.log("Data transformed", {
        hasData: !!transformedData,
      });

      // 3. 呼叫成功回調
      if (this.onProcessed) {
        this.onProcessed(transformedData);
      }
    } catch (error) {
      this.handleError(error, rawData);
    }
  }

  /**
   * 驗證資料（子類實作）
   * @param data 原始資料
   * @returns 驗證結果
   */
  protected abstract validate(data: TInput): ValidationResult;

  /**
   * 轉換資料（子類實作）
   * @param data 已驗證的原始資料
   * @returns 轉換後的資料
   */
  protected abstract transform(data: TInput): TOutput;

  /**
   * 取得 Handler 名稱（子類實作）
   */
  protected abstract getHandlerName(): string;

  /**
   * 處理驗證錯誤
   */
  private handleValidationError(
    result: ValidationResult,
    originalData: any,
  ): void {
    const error: HandlerError = {
      type: "VALIDATION_ERROR" as HandlerErrorType,
      message: "Data validation failed",
      errors: result.errors,
      originalData: this.options.debug ? originalData : undefined,
    };

    this.log("error", "Data validation failed", { errors: result.errors });

    if (this.onError) {
      this.onError(error);
    }

    if (this.options.strict) {
      throw new Error(
        `[${this.getHandlerName()}] Data validation failed: ${result.errors?.join(", ")}`,
      );
    }
  }

  /**
   * 處理一般錯誤
   */
  private handleError(error: unknown, originalData: any): void {
    const handlerError: HandlerError = {
      type: "UNKNOWN_ERROR" as HandlerErrorType,
      message: error instanceof Error ? error.message : "Unknown error",
      originalData: this.options.debug ? originalData : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    };

    this.log("error", "Unknown error", error);

    if (this.onError) {
      this.onError(handlerError);
    }

    if (this.options.strict) {
      throw error;
    }
  }

  /**
   * 除錯日誌
   */
  protected log(
    level: "info" | "warn" | "error",
    message: string,
    data?: any,
  ): void;
  protected log(message: string, data?: any): void;
  protected log(
    levelOrMessage: string,
    messageOrData?: string | any,
    data?: any,
  ): void {
    let level: "info" | "warn" | "error" = "info";
    let message: string;
    let logData: any;

    if (messageOrData === undefined || typeof messageOrData !== "string") {
      message = levelOrMessage;
      logData = messageOrData;
    } else {
      level = levelOrMessage as "info" | "warn" | "error";
      message = messageOrData;
      logData = data;
    }

    if (!this.options.debug) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${this.getHandlerName()} ${timestamp}]`;

    switch (level) {
      case "error":
        console.error(prefix, message, logData || "");
        break;
      case "warn":
        console.warn(prefix, message, logData || "");
        break;
      default:
        console.log(prefix, message, logData || "");
    }
  }

  /**
   * 檢查欄位是否存在且為指定類型
   */
  protected isValidField(
    obj: any,
    field: string,
    type: "string" | "number" | "boolean" | "object" | "array",
  ): boolean {
    if (!(field in obj)) return false;

    const value = obj[field];

    switch (type) {
      case "array":
        return Array.isArray(value);
      case "object":
        return (
          typeof value === "object" && value !== null && !Array.isArray(value)
        );
      default:
        return typeof value === type;
    }
  }

  /**
   * 建立驗證結果
   */
  protected createValidationResult(
    valid: boolean,
    errors?: string[],
    warnings?: string[],
  ): ValidationResult {
    return { valid, errors, warnings };
  }
}
