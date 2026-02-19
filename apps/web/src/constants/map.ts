/**
 * Shared map tile configuration.
 *
 * Stadia Alidade Smooth — modern, muted style ideal for marker-heavy maps.
 * Free for non-commercial use; no API key needed in code.
 * Authentication: domain-based (whitelist kolab.lv in Stadia dashboard).
 * localhost works without any auth during development.
 *
 * Light variant: alidade_smooth
 * Dark variant:  alidade_smooth_dark
 *
 * Docs: https://docs.stadiamaps.com/map-styles/alidade-smooth/
 * Auth: https://docs.stadiamaps.com/authentication/
 */
export const MAP_TILE_URL =
  'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';

export const MAP_TILE_URL_DARK =
  'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

export const MAP_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/**
 * Performance props to spread onto every <TileLayer>.
 * - keepBuffer: 8 rows of tiles kept outside viewport (default 2)
 * - updateWhenZooming: false = don't re-request tiles mid-zoom animation
 * - updateWhenIdle: true = update tiles once zoom/pan finishes
 * - maxNativeZoom: 20 = Stadia serves raster tiles up to zoom 20
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
