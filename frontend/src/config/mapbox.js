/**
 * Mapbox 配置：token、默认中心、样式等（单点维护）
 */
const MAPBOX_TOKEN =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAPBOX_ACCESS_TOKEN) ||
  'pk.eyJ1Ijoicm95aXNsYW5kIiwiYSI6ImNtbDNua3pjdjBzeTIzZ3NkZWZydzN3NngifQ.F-Lq0GLCctFejwbTt2SOHA';

/** 默认中心：706 Community, Chiang Mai [lng, lat] */
const DEFAULT_CENTER = [98.9817, 18.7883];

/** 默认缩放 */
const DEFAULT_ZOOM = 14;

export { MAPBOX_TOKEN, DEFAULT_CENTER, DEFAULT_ZOOM };
