import SSEConnectionManager from "@/services/SSE/connection/SSEConnectionManager";
import { InitialHandler, UpdateHandler } from "@/services/SSE/handler";
import { F1DataStore } from "@/services/SSE/store";
import type {
  ProcessedInitialData,
  ProcessedUpdateData,
  HandlerError,
} from "@/types/SSE/handler";
import type { F1State } from "@/types/SSE/store";
import type { ConnectionStatus } from "@/types/SSE/connection";

/**
 * F1 Live Timing 服務配置
 */
export interface F1LiveTimingServiceOptions {
  /** SSE 端點 URL */
  url?: string;
  /** 是否開啟除錯 */
  debug?: boolean;
  /** 是否啟用快照 */
  enableSnapshot?: boolean;
}

const LIVETITMING_API = "/livetiming/api/realtime";

/**
 * F1 Live Timing 服務
 * 這是整合所有層級的統一服務
 */
export class F1LiveTimingService {
  // 四層架構
  private connection: SSEConnectionManager; // 第一層：連線層
  private initialHandler: InitialHandler; // 第二層 A：Initial 處理
  private updateHandler: UpdateHandler; // 第二層 B：Update 處理
  private dataStore: F1DataStore; // 第三層：資料層

  private isStarted: boolean = false;

  constructor(options: F1LiveTimingServiceOptions = {}) {
    const {
      url = LIVETITMING_API,
      debug = true,
      enableSnapshot = false,
    } = options;

    // 1. 初始化連線管理器
    this.connection = new SSEConnectionManager(url, {
      maxRetries: 5,
      initialRetryDelay: 1000,
      maxRetryDelay: 30000,
      retryMultiplier: 2,
      debug,
    });

    // 2. 初始化 Initial Handler
    this.initialHandler = new InitialHandler({
      debug,
      strict: false,
      addTimestamp: true,
    });

    // 3. 初始化 Update Handler
    this.updateHandler = new UpdateHandler({
      debug,
      strict: false,
      allowEmpty: false,
      addTimestamp: true,
      minUpdateInterval: 0, // F1 資料更新頻繁，不限制
    });

    // 4. 初始化 Data Store
    this.dataStore = new F1DataStore({
      debug,
      enableSnapshot,
    });

    // 5. 連接所有層級
    this.setupConnections();
  }

  /**
   * 連接所有層級
   */
  private setupConnections(): void {
    // ===== Initial Handler 設定 =====
    this.initialHandler.setOnProcessed((data: ProcessedInitialData) => {
      console.log("Initial Data Processed");
      // 傳給 Data Store
      this.dataStore.setInitialState(data.data);
    });

    this.initialHandler.setOnError((error: HandlerError) => {
      console.error("Initial Data Processing Failed:", error);
    });

    // ===== Update Handler 設定 =====
    this.updateHandler.setOnProcessed((data: ProcessedUpdateData) => {
      console.log("Update Data Processed");
      // 傳給 Data Store
      this.dataStore.applyUpdate(data.data);
    });

    this.updateHandler.setOnError((error: HandlerError) => {
      console.error("Update Data Processing Failed:", error);
    });

    // ===== 連線層事件綁定 =====

    // initial 事件 → Initial Handler
    this.connection.on("initial", (rawData) => {
      console.log("Received initial event");
      this.initialHandler.handle(rawData);
    });

    // update 事件 → Update Handler
    this.connection.on("update", (rawData) => {
      console.log("Received update event");
      this.updateHandler.handle(rawData);
    });

    // 連線錯誤
    this.connection.on("error", (error) => {
      console.error("SSE Connection Error:", error);
    });

    // 連線狀態變更
    this.connection.on("statusChange", ({ from, to }) => {
      console.log(`SSE Connection Status Changed: ${from} → ${to}`);
    });
  }

  /**
   * 啟動服務
   */
  public start(): void {
    if (this.isStarted) {
      console.warn("Service is already started");
      return;
    }

    console.log("Starting F1 Live Timing Service");
    this.connection.connect();
    this.isStarted = true;
  }

  /**
   * 停止服務
   */
  public stop(): void {
    if (!this.isStarted) {
      console.warn("Service is not started");
      return;
    }

    console.log("Stopping F1 Live Timing Service");
    this.connection.disconnect();
    this.isStarted = false;
  }

  /**
   * 重新連線
   */
  public reconnect(): void {
    console.log("Reconnecting F1 Live Timing Service");
    this.connection.reconnect();
  }

  /**
   * 訂閱完整狀態（給 React 使用）
   */
  public subscribe(callback: (state: F1State) => void) {
    return this.dataStore.subscribe(callback);
  }

  /**
   * 訂閱特定部分（細粒度訂閱）
   */
  public subscribeSelector<T>(
    selector: (state: F1State) => T,
    callback: (data: T) => void,
  ) {
    return this.dataStore.subscribeSelector(selector, callback);
  }

  /**
   * 取得當前狀態
   */
  public getState(): F1State | null {
    return this.dataStore.getState();
  }

  /**
   * 取得連線狀態
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connection.getStatus();
  }

  /**
   * 是否已連線
   */
  public isConnected(): boolean {
    return this.connection.isConnected();
  }

  /**
   * 是否已初始化（收到 initial 資料）
   */
  public isInitialized(): boolean {
    return this.dataStore.isInitialized();
  }

  /**
   * 取得統計資訊
   */
  public getStats() {
    return {
      connection: this.connection.getStats(),
      dataStore: this.dataStore.getStats(),
    };
  }

  /**
   * 銷毀服務
   */
  public destroy(): void {
    console.log("Shutting down F1 Live Timing Service");
    this.stop();
    this.connection.destroy();
    this.dataStore.destroy();
    this.isStarted = false;
  }
}

// 匯出預設實例（Singleton 模式）
let defaultServiceInstance: F1LiveTimingService | null = null;

/**
 * 取得預設服務實例
 */
export function getF1Service(
  options?: F1LiveTimingServiceOptions,
): F1LiveTimingService {
  if (!defaultServiceInstance) {
    defaultServiceInstance = new F1LiveTimingService(options);
  }
  return defaultServiceInstance;
}

/**
 * 重置預設服務實例
 */
export function resetF1Service(): void {
  if (defaultServiceInstance) {
    defaultServiceInstance.destroy();
    defaultServiceInstance = null;
  }
}
