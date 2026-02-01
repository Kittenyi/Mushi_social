/**
 * 地图状态：视角、附近用户（占位）
 */
export function useMapStore() {
  return { center: null, nearbyUsers: [] };
}
