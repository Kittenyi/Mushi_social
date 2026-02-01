/**
 * 地图状态: 视角、附近用户、菌丝、热力
 */
import { createContext, useContext } from 'react';

const MapContext = createContext(null);
export const useMap = () => useContext(MapContext);
export function MapProvider({ children }) {
  return <MapContext.Provider value={{}}>{children}</MapContext.Provider>;
}
