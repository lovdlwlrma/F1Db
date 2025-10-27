export const COMMON_CONFIG = {
  DEFAULT_YEAR: 2025,
  RETRY: {
    ATTEMPTS: 3,
    DELAY: 1500,
  },
};

export const ANALYTICS_CONFIG = {
  SESSION_TYPE: "Race",
  CHART_CONFIG: {
    LAP_RANKING_HEIGHT: 600,
    TYRE_STINTS_HEIGHT: 600,
    RACE_CONTROL_HEIGHT: 640,
  },
} as const;

export const SSE_CONNECTION_CONFIG = {
  maxRetries: 5,
  initialRetryDelay: 1000,
  maxRetryDelay: 30000,
  retryMultiplier: 2,
  debug: false,
} as const;
