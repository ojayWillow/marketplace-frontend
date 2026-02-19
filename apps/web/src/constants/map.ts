/**
 * Shared map tile configuration.
 *
 * CartoDB Voyager — CDN-backed, free, no API key required.
 * Faster than default OSM tiles, especially on mobile.
 * {r} suffix serves @2x retina tiles when available.
 *
 * Light variant: rastertiles/voyager
 * Dark variant:  rastertiles/dark_all
 */
export const MAP_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

export const MAP_TILE_URL_DARK =
  'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';

export const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/**
 * Performance props to spread onto every <TileLayer>.
 * - keepBuffer: pre-load surrounding tiles (default 2, we use 4)
 * - updateWhenZooming: false = don't re-request tiles mid-zoom animation
 * - updateWhenIdle: true = update tiles once zoom/pan finishes
 */
export const MAP_TILE_PERF = {
  keepBuffer: 4,
  updateWhenZooming: false,
  updateWhenIdle: true,
} as const;
