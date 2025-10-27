import type { DeepMergeOptions } from "@/types/SSE/store";

/**
 * 深度合併兩個物件
 *
 * @example
 * const target = { a: { b: { c: 1 } } };
 * const source = { a: { b: { d: 2 } } };
 * const result = deepMerge(target, source);
 * // { a: { b: { c: 1, d: 2 } } }
 *
 * @param target 目標物件
 * @param source 來源物件
 * @param options 合併選項
 * @returns 合併後的新物件
 */
export function deepMerge<T = any>(
  target: T,
  source: Partial<T> | undefined | null,
  options: DeepMergeOptions = {},
): T {
  const { mergeArrays = false, customMerge } = options;

  // 如果 source 是 null 或 undefined，返回 target
  if (source === null || source === undefined) {
    return target;
  }

  // 如果 target 是 null 或 undefined，返回 source
  if (target === null || target === undefined) {
    return source as T;
  }

  // 如果不是物件，直接返回 source（覆蓋）
  if (!isObject(target) || !isObject(source)) {
    return source as T;
  }

  // 建立結果物件（淺拷貝 target）
  const result = { ...target } as Record<string, any>;

  // 遍歷 source 的所有鍵
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = (source as Record<string, any>)[key];
      const targetValue = result[key];

      // 如果有自訂合併函數，使用它
      if (customMerge) {
        const customResult = customMerge(key, targetValue, sourceValue);
        if (customResult !== undefined) {
          result[key] = customResult;
          continue;
        }
      }

      // 如果 source 的值是 null，直接設為 null（覆蓋）
      if (sourceValue === null) {
        result[key] = null;
        continue;
      }

      // 如果 source 的值是 undefined，跳過
      if (sourceValue === undefined) {
        continue;
      }

      // 如果 source 的值是陣列
      if (Array.isArray(sourceValue)) {
        if (mergeArrays && Array.isArray(targetValue)) {
          // 合併陣列（去重）
          result[key] = mergeArraysUnique(targetValue, sourceValue);
        } else {
          // 直接替換陣列
          result[key] = [...sourceValue];
        }
        continue;
      }

      // 如果 source 的值是物件，遞迴合併
      if (isObject(sourceValue)) {
        if (isObject(targetValue)) {
          result[key] = deepMerge(targetValue, sourceValue as any, options);
        } else {
          result[key] = deepMerge({}, sourceValue as any, options);
        }
        continue;
      }

      // 其他情況，直接覆蓋
      result[key] = sourceValue;
    }
  }

  return result as T;
}

/**
 * 檢查是否為普通物件
 */
function isObject(value: any): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof RegExp) &&
    !(value instanceof Map) &&
    !(value instanceof Set)
  );
}

/**
 * 合併陣列並去重
 */
function mergeArraysUnique<T>(target: T[], source: T[]): T[] {
  const result = [...target];

  for (const item of source) {
    // 簡單去重（基於 JSON 序列化）
    const exists = result.some((existingItem) => {
      if (isObject(item) && isObject(existingItem)) {
        return JSON.stringify(item) === JSON.stringify(existingItem);
      }
      return item === existingItem;
    });

    if (!exists) {
      result.push(item);
    }
  }

  return result;
}

/**
 * 深拷貝物件
 * 使用結構化克隆（如果可用）或 JSON 序列化
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // 使用結構化克隆（現代瀏覽器支援）
  if (typeof structuredClone !== "undefined") {
    try {
      return structuredClone(obj);
    } catch (e) {
      // 如果失敗，降級到 JSON 方法
    }
  }

  // 降級：使用 JSON 序列化（注意：會丟失函數、undefined 等）
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error("Deep clone failed:", e);
    return obj;
  }
}

/**
 * 批次深度合併多個物件
 */
export function deepMergeMultiple<T>(
  target: T,
  sources: Array<Partial<T>>,
  options?: DeepMergeOptions,
): T {
  return sources.reduce<T>(
    (acc, source) => deepMerge<T>(acc, source, options),
    target,
  );
}
