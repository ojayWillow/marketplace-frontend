/**
 * Shared map tile configuration.
 *
 * CartoDB Voyager — CDN-backed, free, no API key required.
 * Cleaner, lighter look than default OSM tiles that matches
 * the white card UI. {r} suffix serves @2x retina tiles.
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
 * - keepBuffer: 8 rows of tiles kept outside viewport (default 2)
 * - updateWhenZooming: false = don't re-request tiles mid-zoom animation
 * - updateWhenIdle: true = update tiles once zoom/pan finishes
 * - maxNativeZoom: 20 = CartoDB serves tiles up to zoom 20
 * - maxZoom: 22 = allow zooming past 20, Leaflet upscales instead of grey
 */
export const MAP_TILE_PERF = {
  keepBuffer: 8,
  updateWhenZooming: false,
  updateWhenIdle: true,
  maxNativeZoom: 20,
  maxZoom: 22,
} as const;

/**
 * Props to spread onto every <MapContainer> for smoother zoom.
 * - zoomSnap: 0.5 = fractional zoom steps (less jarring tile reloads)
 * - zoomDelta: 0.5 = smaller zoom per scroll wheel click
 * - wheelPxPerZoomLevel: 120 = smoother scroll zoom sensitivity
 */
export const MAP_CONTAINER_PROPS = {
  zoomSnap: 0.5,
  zoomDelta: 0.5,
  wheelPxPerZoomLevel: 120,
} as const;
