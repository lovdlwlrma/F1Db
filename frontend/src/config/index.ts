/**
 * ==============================
 *  App Configuration
 * ==============================
 * All environment variables must start with "VITE_"
 */

interface EnvConfig {
  MODE: string;
  VITE_API_URL: string;
  VITE_APP_NAME?: string;
  VITE_ENABLE_MOCK?: string;
  VITE_SENTRY_DSN?: string;
}

/**
 * Strongly type import.meta.env
 */
const env = import.meta.env as unknown as EnvConfig;

/**
 * App environment type
 */
export type AppEnv = "development" | "staging" | "production";

/**
 * Detect current environment
 */
function detectEnv(): AppEnv {
  const mode = env.MODE || import.meta.env.MODE;
  if (mode?.includes("dev")) return "development";
  if (mode?.includes("stag")) return "staging";
  return "production";
}

/**
 * Build configuration object
 */
export const config = {
  /** current app environment */
  env: detectEnv(),

  /** app display name */
  appName: env.VITE_APP_NAME || "My React App",

  /** backend API base URL */
  apiBaseUrl:
    env.VITE_API_URL ||
    (detectEnv() === "development"
      ? "http://localhost:8080/api/v1"
      : "https://api.example.com/api/v1"),

  /** whether to enable mock data */
  enableMock: env.VITE_ENABLE_MOCK === "true",

  /** optional sentry DSN */
  sentryDSN: env.VITE_SENTRY_DSN || "",

  /** build version (can be injected via CI/CD) */
  version: typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.1",
};

/**
 * Quick flags
 */
export const isDev = config.env === "development";
export const isProd = config.env === "production";
export const isStaging = config.env === "staging";

/**
 * Debug: print config only in dev mode
 */
if (isDev) {
  console.log("[Config] Loaded:", config);
}
