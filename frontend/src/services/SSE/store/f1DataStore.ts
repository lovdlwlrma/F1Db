import { deepMerge, deepClone } from "./deepMerge";
import { mergeSectors, mergeIndexedItems } from "./mergeStrategies";
import type {
  F1State,
  F1StateUpdate,
  SubscribeCallback,
  Selector,
  SelectorCallback,
  Unsubscribe,
  DataStoreOptions,
  StateSnapshot,
  StoreStats,
} from "@/types/SSE/store";

/**
 * F1 Data Store
 */
export default class F1DataStore {
  private state: F1State | null = null;
  private subscribers: Set<SubscribeCallback> = new Set();
  private selectorSubscribers: Map<Selector, Set<SelectorCallback>> = new Map();
  private options: Required<DataStoreOptions>;

  // 統計資訊
  private stats: StoreStats = {
    initialized: false,
    initializedAt: null,
    lastUpdateAt: null,
    updateCount: 0,
    subscriberCount: 0,
    stateSize: 0,
  };

  // 狀態快照（可選功能）
  private snapshots: StateSnapshot[] = [];

  constructor(options: DataStoreOptions = {}) {
    this.options = {
      debug: options.debug ?? false,
      enableSnapshot: options.enableSnapshot ?? false,
      maxSnapshots: options.maxSnapshots ?? 10,
    };

    this.log("F1DataStore initialized", { options: this.options });
  }

  // ==================== Initial 處理 ====================

  /**
   * 設定初始狀態（完全替換）
   * 由 InitialHandler 呼叫
   *
   * @param initialData Initial 事件的完整資料
   */
  public setInitialState(initialData: F1State): void {
    this.log("Setting initial state", {
      hasData: !!initialData,
      keys: Object.keys(initialData),
    });

    // 深拷貝避免外部修改
    this.state = deepClone(initialData);

    // 更新統計
    this.stats.initialized = true;
    this.stats.initializedAt = Date.now();
    this.stats.lastUpdateAt = Date.now();
    this.stats.stateSize = this.calculateStateSize();

    // 建立快照
    if (this.options.enableSnapshot) {
      this.createSnapshot("initial");
    }

    // 通知所有訂閱者
    this.notifySubscribers();

    this.log("Initial state setup completed", {
      initialized: this.stats.initialized,
      stateSize: this.stats.stateSize,
    });
  }

  // ==================== Update 處理 ====================

  /**
   * 應用增量更新（深度合併）
   * 由 UpdateHandler 呼叫
   *
   * @param update Update 事件的增量資料
   */
  public applyUpdate(update: F1StateUpdate): void {
    if (!this.state) {
      this.log("warn", "State not initialized, ignoring update");
      return;
    }

    this.log("Applying incremental update", {
      updateKeys: Object.keys(update),
      updateSize: JSON.stringify(update).length,
    });

    // 深度合併更新
    this.state = deepMerge(this.state, update, {
      mergeArrays: false, // F1 資料通常直接替換陣列
      // 自訂合併：對 Sectors 欄位採用專門邏輯（處理 array <-> object index updates）
      customMerge: (key, targetValue, sourceValue) => {
        try {
          if (key === "Sectors") {
            return mergeSectors(targetValue, sourceValue);
          }

          // handle BestSectors (may be array or index-keyed object)
          if (key === "BestSectors") {
            return mergeIndexedItems(targetValue, sourceValue);
          }
        } catch (e) {
          this.log("warn", `customMerge failed for key=${key}`, e);
          return undefined;
        }

        return undefined;
      },
    });

    // 更新統計
    this.stats.updateCount++;
    this.stats.lastUpdateAt = Date.now();
    this.stats.stateSize = this.calculateStateSize();

    // 建立快照
    if (this.options.enableSnapshot) {
      this.createSnapshot("update");
    }

    // 通知所有訂閱者
    this.notifySubscribers();

    this.log("Incremental update completed", {
      updateCount: this.stats.updateCount,
      stateSize: this.stats.stateSize,
    });
  }

  // ==================== 訂閱機制 ====================

  /**
   * 訂閱完整狀態變更
   *
   * @param callback 回調函數
   * @returns 取消訂閱函數
   */
  public subscribe(callback: SubscribeCallback): Unsubscribe {
    this.subscribers.add(callback);
    this.updateSubscriberCount();

    this.log("New subscriber added", {
      totalSubscribers: this.subscribers.size,
    });

    // 立即觸發一次（如果已有資料）
    if (this.state) {
      try {
        callback(this.state);
      } catch (error) {
        this.log("error", "Subscriber callback error", error);
      }
    }

    // 返回取消訂閱函數
    return () => {
      this.subscribers.delete(callback);
      this.updateSubscriberCount();
      this.log("Subscriber removed", {
        totalSubscribers: this.subscribers.size,
      });
    };
  }

  /**
   * 訂閱選擇器（細粒度訂閱）
   * 只在選擇的資料變更時觸發
   *
   * @example
   * // 只訂閱 TimingData
   * const unsubscribe = store.subscribeSelector(
   *   (state) => state.TimingData,
   *   (timingData) => console.log('TimingData changed:', timingData)
   * );
   *
   * @param selector 選擇器函數
   * @param callback 回調函數
   * @returns 取消訂閱函數
   */
  public subscribeSelector<T>(
    selector: Selector<T>,
    callback: SelectorCallback<T>,
  ): Unsubscribe {
    if (!this.selectorSubscribers.has(selector)) {
      this.selectorSubscribers.set(selector, new Set());
    }

    this.selectorSubscribers.get(selector)!.add(callback);
    this.updateSubscriberCount();

    this.log("New selector subscriber added", {
      totalSelectorSubscribers: this.selectorSubscribers.size,
    });

    // 立即觸發一次（如果已有資料）
    if (this.state) {
      try {
        const selected = selector(this.state);
        callback(selected);
      } catch (error) {
        this.log("error", "Selector subscriber callback error", error);
      }
    }

    // 返回取消訂閱函數
    return () => {
      const callbacks = this.selectorSubscribers.get(selector);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.selectorSubscribers.delete(selector);
        }
      }
      this.updateSubscriberCount();
      this.log("Selector subscriber removed", {
        totalSelectorSubscribers: this.selectorSubscribers.size,
      });
    };
  }

  /**
   * 通知所有訂閱者
   */
  private notifySubscribers(): void {
    if (!this.state) return;

    const state = this.state;

    // 通知完整狀態訂閱者
    this.subscribers.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        this.log("error", "Error notifying subscriber", error);
      }
    });

    // 通知選擇器訂閱者（比較值是否變更）
    this.selectorSubscribers.forEach((callbacks, selector) => {
      try {
        const selected = selector(state);
        callbacks.forEach((callback) => {
          try {
            callback(selected);
          } catch (error) {
            this.log("error", "Error notifying selector subscriber", error);
          }
        });
      } catch (error) {
        this.log("error", "Error executing selector", error);
      }
    });
  }

  // ==================== 狀態查詢 ====================

  /**
   * 取得完整當前狀態
   */
  public getState(): F1State | null {
    return this.state ? deepClone(this.state) : null;
  }

  /**
   * 取得特定部分的狀態
   *
   * @example
   * const timingData = store.getStateSlice('TimingData');
   */
  public getStateSlice<K extends keyof F1State>(
    key: K,
  ): F1State[K] | undefined {
    return this.state?.[key] ? deepClone(this.state[key]) : undefined;
  }

  /**
   * 使用選擇器取得資料
   *
   * @example
   * const driverCount = store.select((state) =>
   *   Object.keys(state.DriverList || {}).length
   * );
   */
  public select<T>(selector: Selector<T>): T | null {
    if (!this.state) return null;

    try {
      return selector(this.state);
    } catch (error) {
      this.log("error", "Error executing selector", error);
      return null;
    }
  }

  /**
   * 檢查是否已初始化
   */
  public isInitialized(): boolean {
    return this.stats.initialized && this.state !== null;
  }

  // ==================== 統計與工具 ====================

  /**
   * 取得統計資訊
   */
  public getStats(): StoreStats {
    return { ...this.stats };
  }

  /**
   * 計算狀態大小（估計）
   */
  private calculateStateSize(): number {
    if (!this.state) return 0;
    try {
      return JSON.stringify(this.state).length;
    } catch {
      return 0;
    }
  }

  /**
   * 更新訂閱者計數
   */
  private updateSubscriberCount(): void {
    let total = this.subscribers.size;
    this.selectorSubscribers.forEach((callbacks) => {
      total += callbacks.size;
    });
    this.stats.subscriberCount = total;
  }

  // ==================== 快照功能 ====================

  /**
   * 建立狀態快照
   */
  private createSnapshot(source: "initial" | "update"): void {
    if (!this.state) return;

    const snapshot: StateSnapshot = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      state: deepClone(this.state),
      source,
    };

    this.snapshots.push(snapshot);

    // 限制快照數量
    if (this.snapshots.length > this.options.maxSnapshots) {
      this.snapshots.shift(); // 移除最舊的
    }

    this.log("State snapshot created", {
      snapshotId: snapshot.id,
      source,
      totalSnapshots: this.snapshots.length,
    });
  }

  /**
   * 取得所有快照
   */
  public getSnapshots(): StateSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * 還原到特定快照
   */
  public restoreSnapshot(snapshotId: string): boolean {
    const snapshot = this.snapshots.find((s) => s.id === snapshotId);

    if (!snapshot) {
      this.log("warn", "Snapshot not found", { snapshotId });
      return false;
    }

    this.state = deepClone(snapshot.state);
    this.stats.lastUpdateAt = Date.now();
    this.notifySubscribers();

    this.log("Snapshot restored", { snapshotId });
    return true;
  }

  /**
   * 清除所有快照
   */
  public clearSnapshots(): void {
    this.snapshots = [];
    this.log("All snapshots cleared");
  }

  // ==================== 重置與清理 ====================

  /**
   * 重置 Store（清空所有資料）
   */
  public reset(): void {
    this.log("Store reset");

    this.state = null;
    this.stats = {
      initialized: false,
      initializedAt: null,
      lastUpdateAt: null,
      updateCount: 0,
      subscriberCount: this.stats.subscriberCount, // 保留訂閱者計數
      stateSize: 0,
    };

    this.clearSnapshots();
    this.notifySubscribers();
  }

  /**
   * 銷毀 Store（清除所有訂閱者和資料）
   */
  public destroy(): void {
    this.log("Store destroyed");

    this.state = null;
    this.subscribers.clear();
    this.selectorSubscribers.clear();
    this.snapshots = [];

    this.stats = {
      initialized: false,
      initializedAt: null,
      lastUpdateAt: null,
      updateCount: 0,
      subscriberCount: 0,
      stateSize: 0,
    };
  }

  // ==================== 除錯日誌 ====================

  /**
   * 除錯日誌
   */
  private log(
    level: "info" | "warn" | "error",
    message: string,
    data?: any,
  ): void;
  private log(message: string, data?: any): void;
  private log(
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
    const prefix = `[F1DataStore ${timestamp}]`;

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
}
