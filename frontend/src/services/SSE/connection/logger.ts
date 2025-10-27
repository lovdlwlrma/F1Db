export type LogLevel = "INFO" | "WARN" | "ERROR";

/**
 * 日誌管理器
 */
export class Logger {
  private readonly enabled: boolean;
  private readonly prefix: string;

  constructor(enabled: boolean = false, prefix: string = "SSE Connection") {
    this.enabled = enabled;
    this.prefix = prefix;
  }

  /**
   * 記錄日誌
   */
  public log(level: LogLevel, message: string, data?: any): void;
  public log(message: string, data?: any): void;
  public log(
    levelOrMessage: string,
    messageOrData?: string | any,
    data?: any,
  ): void {
    if (!this.enabled) return;

    let level: LogLevel = "INFO";
    let message: string;
    let logData: any;

    // 重載處理
    if (messageOrData === undefined || typeof messageOrData !== "string") {
      message = levelOrMessage;
      logData = messageOrData;
    } else {
      level = levelOrMessage as LogLevel;
      message = messageOrData;
      logData = data;
    }

    const logPrefix = `[${this.prefix}]`;

    switch (level) {
      case "ERROR":
        console.error(logPrefix, message, logData || "");
        break;
      case "WARN":
        console.warn(logPrefix, message, logData || "");
        break;
      default:
        console.log(logPrefix, message, logData || "");
    }
  }

  /**
   * 資訊日誌
   */
  public info(message: string, data?: any): void {
    this.log("INFO", message, data);
  }

  /**
   * 警告日誌
   */
  public warn(message: string, data?: any): void {
    this.log("WARN", message, data);
  }

  /**
   * 錯誤日誌
   */
  public error(message: string, data?: any): void {
    this.log("ERROR", message, data);
  }
}
