import type { Segment } from "@/types/LiveTiming/timingData";

/**
 * Merge sectors: source may contain numeric keys for sectors (e.g. "0", "1")
 * or be an array. Each sector may contain a Segments field which itself can be
 * an array or an object keyed by index (from update events).
 */
export function mergeSectors(target: any, source: any): any {
  if (!source) return target;
  if (!target) return source;

  // preserve whether target was an array
  const targetWasArray = Array.isArray(target);
  const result: any = targetWasArray ? [...(target as any[])] : { ...target };

  // debug
  try {
    // eslint-disable-next-line no-console
    console.debug("mergeSectors called", {
      targetWasArray,
      sourceType: Array.isArray(source) ? "array" : typeof source,
    });
  } catch (e) {}

  // source might be an array or object
  if (Array.isArray(source)) {
    source.forEach((s: any, idx: number) => {
      // ensure array result for numeric indices
      result[idx] = mergeSector(result[idx], s);
    });
  } else {
    for (const sectorKey in source) {
      if (!Object.prototype.hasOwnProperty.call(source, sectorKey)) continue;
      const sourceSector = source[sectorKey];

      if (targetWasArray && String(Number(sectorKey)) === sectorKey) {
        // numeric key -> array index
        const idx = parseInt(sectorKey, 10);
        result[idx] = mergeSector(result[idx], sourceSector);
      } else {
        result[sectorKey] = mergeSector(result[sectorKey], sourceSector);
      }
    }
  }

  // if target was an array, ensure we return an array (may have sparse indices)
  if (targetWasArray) {
    // determine max index
    const maxIndex = Math.max(
      ...Object.keys(result)
        .map((k) => {
          const n = parseInt(k, 10);
          return Number.isNaN(n) ? -1 : n;
        })
        .filter((n) => n >= 0),
      (result as any[]).length - 1,
    );
    const arr: any[] = new Array(maxIndex + 1).fill(undefined);
    for (const key of Object.keys(result)) {
      const idx = parseInt(key, 10);
      if (!Number.isNaN(idx)) arr[idx] = result[key];
    }
    // fill gaps from previous target where not overwritten
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === undefined) arr[i] = (target as any[])[i];
    }
    return arr;
  }

  return result;
}

function mergeSector(targetSector: any, sourceSector: any): any {
  if (!sourceSector) return targetSector;
  if (!targetSector) return sourceSector;

  const merged: any = { ...targetSector, ...sourceSector };

  // handle Segments specially
  if ("Segments" in sourceSector) {
    try {
      // eslint-disable-next-line no-console
      console.debug("mergeSector segments", {
        targetLen: (targetSector.Segments || []).length,
        sourceIsArray: Array.isArray(sourceSector.Segments),
      });
    } catch (e) {}
    merged.Segments = mergeSegments(
      targetSector.Segments,
      sourceSector.Segments,
    );
  }

  return merged;
}

/**
 * Merge segments where target is an array and source may be an array or an object
 * keyed by numeric indices (as seen in update events).
 */
export function mergeSegments(
  targetSegments: Segment[] | undefined,
  sourceSegments: Segment[] | Record<string, Segment> | undefined,
): Segment[] {
  // If both missing, return empty array
  if (!targetSegments && !sourceSegments) return [];

  // If source is undefined, keep target
  if (sourceSegments === undefined || sourceSegments === null) {
    return targetSegments ? [...targetSegments] : [];
  }

  // If target is missing, normalize source to array
  if (!targetSegments) {
    if (Array.isArray(sourceSegments)) return [...sourceSegments];
    // source is object keyed by index
    const indices = Object.keys(sourceSegments).map((k) => parseInt(k, 10));
    const max = Math.max(...indices, 0);
    const res: Segment[] = new Array(max + 1).fill(undefined as any);
    for (const k of Object.keys(sourceSegments)) {
      const idx = parseInt(k, 10);
      // eslint-disable-next-line no-console
      console.debug("normalizing sourceSegments index", {
        idx,
        value: (sourceSegments as any)[k],
      });
      res[idx] = { ...(sourceSegments as any)[k] };
    }
    return res;
  }

  // Now both exist: build max length
  let result = [...targetSegments];

  if (Array.isArray(sourceSegments)) {
    for (let i = 0; i < sourceSegments.length; i++) {
      const s = sourceSegments[i];
      const t = result[i];
      if (s === null || s === undefined) continue;
      // eslint-disable-next-line no-console
      console.debug("mergeSegments array index", { i, s, t });
      result[i] = mergeSegment(t, s);
    }
  } else {
    // sourceSegments is object keyed by indices
    for (const k of Object.keys(sourceSegments)) {
      const idx = parseInt(k, 10);
      if (Number.isNaN(idx)) continue;
      const s = (sourceSegments as any)[k];
      const t = result[idx];
      // eslint-disable-next-line no-console
      console.debug("mergeSegments object index", { k, idx, s, t });
      result[idx] = mergeSegment(t, s);
    }
  }

  return result;
}

function mergeSegment(
  target: Segment | undefined,
  source: Segment | undefined,
): Segment {
  if (!source) return target as Segment;
  if (!target) return { ...source } as Segment;
  return {
    Status: source.Status ?? target.Status,
  } as Segment;
}

/**
 * Generic merge helper for indexed items where target is an array and source
 * may be an array or an object keyed by numeric indices. It merges each
 * item by index, preserving fields that source does not provide.
 */
export function mergeIndexedItems<T extends Record<string, any>>(
  targetItems: T[] | undefined,
  sourceItems: T[] | Record<string, T> | undefined,
): T[] {
  if (!targetItems && !sourceItems) return [];

  if (sourceItems === undefined || sourceItems === null) {
    return targetItems ? [...targetItems] : [];
  }

  if (!targetItems) {
    if (Array.isArray(sourceItems)) return [...sourceItems];
    const indices = Object.keys(sourceItems).map((k) => parseInt(k, 10));
    const max = Math.max(...indices, 0);
    const res: T[] = new Array(max + 1).fill(undefined as any);
    for (const k of Object.keys(sourceItems)) {
      const idx = parseInt(k, 10);
      if (Number.isNaN(idx)) continue;
      res[idx] = { ...(sourceItems as any)[k] } as T;
    }
    return res;
  }

  const result = [...targetItems];

  if (Array.isArray(sourceItems)) {
    for (let i = 0; i < sourceItems.length; i++) {
      const s = sourceItems[i];
      if (s === null || s === undefined) continue;
      const t = result[i] || ({} as T);
      result[i] = { ...t, ...s } as T;
    }
  } else {
    for (const k of Object.keys(sourceItems)) {
      const idx = parseInt(k, 10);
      if (Number.isNaN(idx)) continue;
      const s = (sourceItems as any)[k] as T;
      const t = result[idx] || ({} as T);
      result[idx] = { ...t, ...s } as T;
    }
  }

  return result;
}
