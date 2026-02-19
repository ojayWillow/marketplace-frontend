/**
 * Shared map tile configuration.
 *
 * OpenStreetMap default tiles — colorful, fast, massive CDN.
 * No API key, no domain whitelist, no signup needed.
 *
 * Docs: https://wiki.openstreetmap.org/wiki/Raster_tile_providers
 * Usage policy: https://operations.osmfoundation.org/policies/tiles/
 */
export const MAP_TILE_URL =
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Performance props to spread onto every <TileLayer>.
 * - keepBuffer: 8 rows of tiles kept outside viewport (default 2)
 * - updateWhenZooming: false = don't re-request tiles mid-zoom animation
 * - updateWhenIdle: true = update tiles once zoom/pan finishes
 * - maxNativeZoom: 19 = OSM serves raster tiles up to zoom 19
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
