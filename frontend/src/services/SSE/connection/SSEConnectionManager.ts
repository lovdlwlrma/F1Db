import type {
  SSEConnectionOptions,
  ConnectionStatus,
  ConnectionStats,
  EventName,
  EventListeners,
  UnsubscribeFunction,
  ErrorEventData,
} from "@/types/SSE";
import { ConnectionStatus as Status, ErrorType } from "@/types/SSE";
import { EventEmitter } from "@/services/SSE/connection/eventEmitter";
import { ReconnectionStrategy } from "@/services/SSE/connection/reconnection";
import { Logger } from "@/services/SSE/connection/logger";
import { validateUrl } from "@/utils/validation";
import { SSE_CONNECTION_CONFIG } from "@/config/config";

/**
 * SSE 連線管理器
 */
export default class SSEConnectionManager {
  private readonly url: string;
  private readonly options: Required<SSEConnectionOptions>;

  // 核心組件
  private readonly logger: Logger;
  private readonly emitter: EventEmitter;
  private readonly reconnection: ReconnectionStrategy;

  // 連線狀態
  private eventSource: EventSource | null = null;
  private status: ConnectionStatus = Status.DISCONNECTED;

  /**
   * 建構子
   * @param url SSE 端點 URL
   * @param options 配置選項
   */
  constructor(url: string, options: SSEConnectionOptions = {}) {
    validateUrl(url);

    this.url = url;
    this.options = {
      maxRetries: options.maxRetries ?? SSE_CONNECTION_CONFIG.maxRetries,
      initialRetryDelay:
        options.initialRetryDelay ?? SSE_CONNECTION_CONFIG.initialRetryDelay,
      maxRetryDelay:
        options.maxRetryDelay ?? SSE_CONNECTION_CONFIG.maxRetryDelay,
      retryMultiplier:
        options.retryMultiplier ?? SSE_CONNECTION_CONFIG.retryMultiplier,
      debug: options.debug ?? SSE_CONNECTION_CONFIG.debug,
    };

    // 初始化核心組件
    this.logger = new Logger(this.options.debug);
    this.emitter = new EventEmitter(this.logger);
    this.reconnection = new ReconnectionStrategy(this.options, this.logger);

    this.logger.log("SSEConnectionManager initialized", {
      url,
      options: this.options,
    });
  }

  /**
   * 建立連線
   */
  public connect(): void {
    if (this.eventSource !== null) {
      this.logger.warn("Already connected or connecting");
      return;
    }

    this.updateStatus(Status.CONNECTING);

    try {
      this.eventSource = new EventSource(this.url);
      this.logger.log("EventSource created");

      this.setupEventListeners();
    } catch (error) {
      this.logger.error("Failed to create connection", error);
      this.emitter.emit("error", {
        type: ErrorType.INIT_ERROR,
        error: error as Error,
      });
      this.updateStatus(Status.FAILED);
    }
  }

  /**
   * 設定 EventSource 監聽器
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // 連線開啟
    this.eventSource.onopen = (): void => {
      this.logger.log("Connection established");
      this.reconnection.reset();
      this.updateStatus(Status.CONNECTED);
    };

    // initial 事件
    this.eventSource.addEventListener(
      "initial",
      (event: MessageEvent): void => {
        this.handleMessageEvent("initial", event);
      },
    );

    // update 事件
    this.eventSource.addEventListener("update", (event: MessageEvent): void => {
      this.handleMessageEvent("update", event);
    });

    // 連線錯誤
    this.eventSource.onerror = (error: Event): void => {
      this.handleConnectionError(error);
    };
  }

  /**
   * 處理訊息事件
   */
  private handleMessageEvent(
    eventType: "initial" | "update",
    event: MessageEvent,
  ): void {
    this.logger.log(`Received ${eventType} event`, {
      dataLength: event.data?.length,
    });

    try {
      const data = JSON.parse(event.data);
      this.emitter.emit(eventType, data);
    } catch (error) {
      this.logger.error(`Failed to parse ${eventType} data`, error);
      this.emitter.emit("error", {
        type: ErrorType.PARSE_ERROR,
        event: eventType,
        error: error as Error,
        rawData: event.data,
      });
    }
  }

  /**
   * 處理連線錯誤
   */
  private handleConnectionError(error: Event): void {
    this.logger.error("Connection error", error);

    const errorData: ErrorEventData = {
      type: ErrorType.CONNECTION_ERROR,
      error,
      retryCount: this.reconnection.getRetryCount(),
      willRetry: this.reconnection.canReconnect(),
    };

    this.emitter.emit("error", errorData);
    this.cleanup();

    // 自動重連
    if (this.reconnection.canReconnect()) {
      this.updateStatus(Status.RECONNECTING);
      this.reconnection.scheduleReconnect(() => this.connect());
    } else if (this.reconnection.isMaxRetriesReached()) {
      this.updateStatus(Status.FAILED);
      this.emitter.emit("error", {
        type: ErrorType.MAX_RETRIES_EXCEEDED,
        error: new Error("Max retries exceeded"),
        retryCount: this.reconnection.getRetryCount(),
      });
    } else {
      this.updateStatus(Status.FAILED);
    }
  }

  /**
   * 主動斷線
   */
  public disconnect(): void {
    this.logger.log("Manually disconnecting");

    this.reconnection.stopReconnecting();
    this.cleanup();
    this.updateStatus(Status.DISCONNECTED);
  }

  /**
   * 手動重連
   */
  public reconnect(): void {
    this.logger.log("Manual reconnect requested");

    this.disconnect();
    this.reconnection.enableReconnecting();
    this.reconnection.reset();
    this.connect();
  }

  /**
   * 清理資源
   */
  private cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.logger.log("EventSource closed");
    }
  }

  /**
   * 更新連線狀態
   */
  private updateStatus(newStatus: ConnectionStatus): void {
    if (this.status === newStatus) return;

    const oldStatus = this.status;
    this.status = newStatus;

    this.logger.log(`Status changed: ${oldStatus} → ${newStatus}`);

    this.emitter.emit("statusChange", {
      from: oldStatus,
      to: newStatus,
      timestamp: Date.now(),
    });
  }

  // ==================== 公開 API ====================

  /**
   * 訂閱事件
   */
  public on<T extends EventName>(
    event: T,
    callback: EventListeners[T][number],
  ): UnsubscribeFunction {
    return this.emitter.on(event, callback);
  }

  /**
   * 取消訂閱事件
   */
  public off<T extends EventName>(
    event: T,
    callback: EventListeners[T][number],
  ): void {
    this.emitter.off(event, callback);
  }

  /**
   * 取得當前連線狀態
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * 檢查是否已連線
   */
  public isConnected(): boolean {
    return this.status === Status.CONNECTED;
  }

  /**
   * 取得統計資訊
   */
  public getStats(): ConnectionStats {
    return {
      status: this.status,
      retryCount: this.reconnection.getRetryCount(),
      shouldReconnect: this.reconnection.isReconnectEnabled(),
      listeners: this.emitter.getListenerCounts(),
    };
  }

  /**
   * 銷毀實例
   */
  public destroy(): void {
    this.logger.log("Destroying instance");

    this.disconnect();
    this.emitter.removeAllListeners();
    this.reconnection.destroy();

    this.logger.log("Instance destroyed");
  }
}
