import type {
  EventName,
  EventListeners,
  UnsubscribeFunction,
} from "@/types/SSE";
import { Logger } from "@/services/SSE/connection/logger";
import { isValidCallback } from "@/utils/validation";

/**
 * 泛型事件發射器
 */
export class EventEmitter<T extends EventListeners = EventListeners> {
  private listeners: T;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.listeners = {
      initial: [],
      update: [],
      error: [],
      statusChange: [],
    } as unknown as T;
  }

  /**
   * 訂閱事件
   * @param event 事件名稱
   * @param callback 回調函數
   * @returns 取消訂閱函數
   */
  public on<E extends EventName>(
    event: E,
    callback: T[E][number],
  ): UnsubscribeFunction {
    if (!this.listeners[event]) {
      this.logger.warn(`Unknown event type: ${event}`);
      return () => {};
    }

    if (!isValidCallback(callback)) {
      this.logger.warn(`Callback for event '${event}' must be a function`);
      return () => {};
    }

    this.listeners[event].push(callback as any);
    this.logger.log(`Listener added for event: ${event}`, {
      totalListeners: this.listeners[event].length,
    });

    return () => this.off(event, callback);
  }

  /**
   * 取消訂閱事件
   * @param event 事件名稱
   * @param callback 回調函數
   */
  public off<E extends EventName>(event: E, callback: T[E][number]): void {
    if (!this.listeners[event]) return;

    const index = this.listeners[event].indexOf(callback as any);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
      this.logger.log(`Listener removed for event: ${event}`, {
        totalListeners: this.listeners[event].length,
      });
    }
  }

  /**
   * 觸發事件
   * @param event 事件名稱
   * @param data 事件資料
   */
  public emit<E extends EventName>(
    event: E,
    data: Parameters<T[E][number]>[0],
  ): void {
    if (!this.listeners[event]) return;

    const listenerCount = this.listeners[event].length;
    this.logger.log(`Emitting event: ${event}`, {
      listenerCount,
      hasData: !!data,
    });

    this.listeners[event].forEach((callback, index) => {
      try {
        callback(data);
      } catch (error) {
        this.logger.error(`Error in ${event} listener [${index}]`, error);
      }
    });
  }

  /**
   * 移除所有監聽器
   */
  public removeAllListeners(): void {
    (Object.keys(this.listeners) as EventName[]).forEach((event) => {
      this.listeners[event] = [];
    });
    this.logger.log("All listeners removed");
  }

  /**
   * 取得監聽器數量統計
   */
  public getListenerCounts(): Record<EventName, number> {
    return {
      initial: this.listeners.initial.length,
      update: this.listeners.update.length,
      error: this.listeners.error.length,
      statusChange: this.listeners.statusChange.length,
    };
  }
}
