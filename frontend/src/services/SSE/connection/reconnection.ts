import type { SSEConnectionOptions } from "@/types/SSE";
import { Logger } from "@/services/SSE/connection/logger";
import { SSE_CONNECTION_CONFIG } from "@/config/config";

/**
 * 重連配置
 */
export interface ReconnectionConfig {
  maxRetries: number;
  initialRetryDelay: number;
  maxRetryDelay: number;
  retryMultiplier: number;
}

/**
 * 重連策略（指數退避）
 */
export class ReconnectionStrategy {
  private readonly config: ReconnectionConfig;
  private readonly logger: Logger;

  private retryCount: number = 0;
  private retryTimer: NodeJS.Timeout | null = null;
  private shouldReconnect: boolean = true;

  constructor(options: SSEConnectionOptions, logger: Logger) {
    this.config = {
      maxRetries: options.maxRetries ?? SSE_CONNECTION_CONFIG.maxRetries,
      initialRetryDelay:
        options.initialRetryDelay ?? SSE_CONNECTION_CONFIG.initialRetryDelay,
      maxRetryDelay:
        options.maxRetryDelay ?? SSE_CONNECTION_CONFIG.maxRetryDelay,
      retryMultiplier:
        options.retryMultiplier ?? SSE_CONNECTION_CONFIG.retryMultiplier,
    };
    this.logger = logger;
  }

  /**
   * 計算下次重連延遲時間（指數退避）
   */
  private calculateDelay(): number {
    return Math.min(
      this.config.initialRetryDelay *
        Math.pow(this.config.retryMultiplier, this.retryCount),
      this.config.maxRetryDelay,
    );
  }

  /**
   * 檢查是否可以重連
   */
  public canReconnect(): boolean {
    return this.shouldReconnect && this.retryCount < this.config.maxRetries;
  }

  /**
   * 檢查是否已達最大重試次數
   */
  public isMaxRetriesReached(): boolean {
    return this.retryCount >= this.config.maxRetries;
  }

  /**
   * 排程重連
   * @param callback 重連回調函數
   */
  public scheduleReconnect(callback: () => void): void {
    if (!this.canReconnect()) {
      this.logger.error("Cannot reconnect", {
        retryCount: this.retryCount,
        maxRetries: this.config.maxRetries,
        shouldReconnect: this.shouldReconnect,
      });
      return;
    }

    const delay = this.calculateDelay();

    this.logger.log(`Scheduling reconnect in ${delay}ms`, {
      attempt: this.retryCount + 1,
      maxRetries: this.config.maxRetries,
    });

    // 清除舊的 timer
    this.clearTimer();

    // 排程重連
    this.retryTimer = setTimeout(() => {
      this.retryCount++;
      this.logger.log(`Attempting reconnection #${this.retryCount}`);
      callback();
    }, delay);
  }

  /**
   * 重置重連狀態（連線成功時呼叫）
   */
  public reset(): void {
    this.retryCount = 0;
    this.clearTimer();
    this.logger.log("Reconnection state reset");
  }

  /**
   * 停止自動重連
   */
  public stopReconnecting(): void {
    this.shouldReconnect = false;
    this.clearTimer();
    this.logger.log("Auto-reconnection stopped");
  }

  /**
   * 啟用自動重連
   */
  public enableReconnecting(): void {
    this.shouldReconnect = true;
    this.logger.log("Auto-reconnection enabled");
  }

  /**
   * 清除重連 timer
   */
  private clearTimer(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  /**
   * 取得當前重試次數
   */
  public getRetryCount(): number {
    return this.retryCount;
  }

  /**
   * 取得重連配置
   */
  public getConfig(): Readonly<ReconnectionConfig> {
    return { ...this.config };
  }

  /**
   * 檢查是否啟用自動重連
   */
  public isReconnectEnabled(): boolean {
    return this.shouldReconnect;
  }

  /**
   * 清理資源
   */
  public destroy(): void {
    this.clearTimer();
    this.retryCount = 0;
    this.shouldReconnect = false;
    this.logger.log("ReconnectionStrategy destroyed");
  }
}
