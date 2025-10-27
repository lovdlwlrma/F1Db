export { default as SSEConnectionManager } from "./SSEConnectionManager";

// 匯出所有類型
export * from "@/types/SSE";

// 匯出核心類別（如果需要單獨使用）
export { Logger } from "@/services/SSE/connection/logger";
export { EventEmitter } from "@/services/SSE/connection/eventEmitter";
export { ReconnectionStrategy } from "@/services/SSE/connection/reconnection";
