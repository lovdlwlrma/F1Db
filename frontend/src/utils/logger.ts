type LogLevel = "INFO" | "WARN" | "ERROR";

const recentLogs = new Map<string, number>();
const LOG_EXPIRY = 20;

async function sendLogToTerminal(
  level: LogLevel,
  args: any[],
  caller?: string,
) {
  try {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg) : String(arg),
      )
      .join(" ");

    const logObject = {
      level,
      timestamp: timestampWithOffset(),
      caller,
      message,
    };

    await fetch("/__log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logObject),
    });
  } catch {
    // 若無法連線就忽略
  }
}

// 攔截 console
export function setupFrontendLogger() {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  function getCaller() {
    const stack = new Error().stack?.split("\n") || [];
    for (let i = 2; i < stack.length; i++) {
      const line = stack[i];
      if (!line.includes("logger.ts")) {
        const match = line.match(/\((.*)\)/);
        if (match) return match[1];
        return line;
      }
    }
    return "unknown";
  }

  function wrapLog(level: LogLevel, originalFn: (...args: any[]) => void) {
    return (...args: any[]) => {
      const caller = getCaller();
      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg),
        )
        .join(" ");

      const key = `${level}|${caller}|${message}`;
      const now = Date.now();

      // 清理過期訊息
      for (const [k, ts] of recentLogs.entries()) {
        if (now - ts > LOG_EXPIRY) recentLogs.delete(k);
      }

      if (recentLogs.has(key)) {
        // 跳過重複訊息
        return;
      }

      recentLogs.set(key, now);

      sendLogToTerminal(level, args, caller);
      originalFn(...args);
    };
  }

  console.log = wrapLog("INFO", originalLog);
  console.warn = wrapLog("WARN", originalWarn);
  console.error = wrapLog("ERROR", originalError);

  console.log(
    "logger enabled: log/warn/error are being forwarded to terminal.",
  );
}

function timestampWithOffset(date: Date = new Date()): string {
  const pad = (n: number, z = 2) => n.toString().padStart(z, "0");

  const tzOffset = -date.getTimezoneOffset();
  const sign = tzOffset >= 0 ? "+" : "-";
  const offsetH = pad(Math.floor(Math.abs(tzOffset) / 60));
  const offsetM = pad(Math.abs(tzOffset) % 60);

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${sign}${offsetH}${offsetM}`;
}
