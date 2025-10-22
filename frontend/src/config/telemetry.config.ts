/**
 * 根據規則過濾有效圈速
 */
export const filterValidLaps = (laps: any[]): any[] => {
  return laps.filter((lap) => {
    const hasValidDuration = lap.lap_duration !== null;
    const isNotFirstLap = lap.lap_number !== 1;
    const isNotLastLap = lap.lap_number !== laps.length;

    return hasValidDuration && isNotFirstLap && isNotLastLap;
  });
};

/**
 * 找出最快圈速
 */
export const findFastestLap = (laps: any[]): any | null => {
  const validLaps = filterValidLaps(laps);

  if (validLaps.length === 0) return null;

  return validLaps.reduce((fastest, current) => {
    return fastest.lap_duration! < current.lap_duration! ? fastest : current;
  }, validLaps[0]);
};
