/**
 * 驗證 URL 格式
 * @param url 要驗證的 URL
 * @throws {Error} 當 URL 無效時拋出錯誤
 */
export function validateUrl(url: string): void {
  if (!url || typeof url !== "string") {
    throw new Error("Invalid URL: URL must be a non-empty string");
  }
}

/**
 * 驗證回調函數
 * @param callback 要驗證的回調函數
 * @returns 是否為有效的函數
 */
export function isValidCallback(callback: any): callback is Function {
  return typeof callback === "function";
}
