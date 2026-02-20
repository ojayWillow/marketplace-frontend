/**
 * Shared map tile configuration.
 *
 * Carto Voyager tiles — clean design, fast Cloudflare CDN, free for moderate traffic.
 * Subdomain sharding ({s} → a/b/c/d) lets the browser open parallel connections
 * for much faster tile loading vs single-domain OSM tiles.
 *
 * Docs: https://github.com/CartoDB/basemap-styles
 * Attribution required: https://carto.com/attributions
 */
export const MAP_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

export const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/**
 * Performance props to spread onto every <TileLayer>.
 * - keepBuffer: 8 rows of tiles kept outside viewport (default 2)
 * - updateWhenZooming: false = don't re-request tiles mid-zoom animation
 * - updateWhenIdle: true = update tiles once zoom/pan finishes
 * - maxNativeZoom: 19 = Carto serves raster tiles up to zoom 19
 * - maxZoom: 22 = allow zooming past 19, Leaflet upscales instead of grey
 */
export const MAP_TILE_PERF = {
  keepBuffer: 8,
  updateWhenZooming: false,
  updateWhenIdle: true,
  maxNativeZoom: 19,
  maxZoom: 22,
} as const;

/**
 * Props to spread onto every <MapContainer> for smoother zoom.
 * - zoomSnap: 0.25 = finer fractional zoom steps (smoother feel)
 * - zoomDelta: 0.5 = half-step zoom per scroll click
 * - wheelDebounceTime: 80 = debounce rapid scroll events (ms)
 * - wheelPxPerZoomLevel: 120 = smoother scroll zoom sensitivity
 */
export const MAP_CONTAINER_PROPS = {
  zoomSnap: 0.25,
  zoomDelta: 0.5,
  wheelDebounceTime: 80,
  wheelPxPerZoomLevel: 120,
} as const;
