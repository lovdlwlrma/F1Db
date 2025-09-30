export async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        console.warn(`Retry ${i + 1} failed`, err);
        if (i < retries - 1) {
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
    throw lastErr;
  }
  