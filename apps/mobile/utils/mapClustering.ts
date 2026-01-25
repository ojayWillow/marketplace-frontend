/**
 * Smart Map Clustering Utility
 * 
 * Dynamic clustering based on zoom level:
 * - CLOSE (street): No clustering - always show individual jobs
 * - MEDIUM (city): Cluster only when 3+ jobs overlap
 * - FAR (country): Aggressive clustering 
 * - EXTREME (continental): Force everything into minimal clusters
 */

import type { Region } from 'react-native-maps';

export interface ClusterableItem {
  id: number;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

export interface Cluster<T extends ClusterableItem> {
  id: string;
  latitude: number;
  longitude: number;
  items: T[];
  isCluster: boolean;
}

export interface ClusterConfig {
  /**
   * Base factor of region delta to use as overlap threshold
   * This gets dynamically adjusted based on zoom level
   * Default: 0.04 (4% of visible area)
   */
  overlapThresholdFactor?: number;

  /**
   * Minimum items required to form a cluster
   * This gets dynamically adjusted based on zoom level
   * Default: 2
   */
  minClusterSize?: number;

  /**
   * Hysteresis factor to prevent flip-flopping
   * Once clustered, need to zoom in this much more to uncluster
   * Default: 0.6
   */
  hysteresis?: number;

  /**
   * Previous clusters for hysteresis comparison
   */
  previousClusters?: Cluster<any>[];
}

const DEFAULT_CONFIG: Required<Omit<ClusterConfig, 'previousClusters'>> = {
  overlapThresholdFactor: 0.04,
  minClusterSize: 2,
  hysteresis: 0.6,
};

/**
 * Zoom level detection thresholds (based on latitudeDelta)
 */
const ZOOM_THRESHOLDS = {
  CLOSE: 0.02,      // Street level - individual buildings visible
  MEDIUM: 0.08,     // City level - neighborhoods visible  
  FAR: 0.5,         // Country level - cities visible
  EXTREME: 2.0,     // Continental level - countries visible
};

/**
 * Get dynamic clustering parameters based on zoom level
 */
function getDynamicClusterParams(latitudeDelta: number): {
  overlapFactor: number;
  minSize: number;
  shouldCluster: boolean;
} {
  // CLOSE zoom (street level) - NO clustering
  if (latitudeDelta <= ZOOM_THRESHOLDS.CLOSE) {
    return { overlapFactor: 0.01, minSize: 999, shouldCluster: false };
  }
  
  // MEDIUM zoom (city/neighborhood) - gentle clustering, min 3 jobs
  if (latitudeDelta <= ZOOM_THRESHOLDS.MEDIUM) {
    return { overlapFactor: 0.03, minSize: 3, shouldCluster: true };
  }
  
  // FAR zoom (country level) - normal clustering, min 2 jobs
  if (latitudeDelta <= ZOOM_THRESHOLDS.FAR) {
    return { overlapFactor: 0.05, minSize: 2, shouldCluster: true };
  }
  
  // EXTREME zoom (continental) - aggressive clustering
  if (latitudeDelta <= ZOOM_THRESHOLDS.EXTREME) {
    return { overlapFactor: 0.08, minSize: 2, shouldCluster: true };
  }
  
  // WORLD view - very aggressive, cluster everything nearby
  return { overlapFactor: 0.12, minSize: 2, shouldCluster: true };
}

/**
 * Spatial grid for fast neighbor lookup
 */
class SpatialGrid<T extends ClusterableItem> {
  private grid: Map<string, T[]> = new Map();
  private cellSizeLat: number;
  private cellSizeLng: number;

  constructor(cellSizeLat: number, cellSizeLng: number) {
    this.cellSizeLat = cellSizeLat;
    this.cellSizeLng = cellSizeLng;
  }

  private getCellKey(lat: number, lng: number): string {
    const cellLat = Math.floor(lat / this.cellSizeLat);
    const cellLng = Math.floor(lng / this.cellSizeLng);
    return `${cellLat},${cellLng}`;
  }

  add(item: T): void {
    const key = this.getCellKey(item.latitude, item.longitude);
    const cell = this.grid.get(key);
    if (cell) {
      cell.push(item);
    } else {
      this.grid.set(key, [item]);
    }
  }

  getNearby(lat: number, lng: number): T[] {
    const centerKey = this.getCellKey(lat, lng);
    const [centerLat, centerLng] = centerKey.split(',').map(Number);
    const nearby: T[] = [];

    // Check 3x3 grid of cells around the point
    for (let dLat = -1; dLat <= 1; dLat++) {
      for (let dLng = -1; dLng <= 1; dLng++) {
        const key = `${centerLat + dLat},${centerLng + dLng}`;
        const cell = this.grid.get(key);
        if (cell) {
          nearby.push(...cell);
        }
      }
    }

    return nearby;
  }
}

/**
 * Check if an item was previously in a cluster
 */
function wasInCluster<T extends ClusterableItem>(
  itemId: number,
  previousClusters: Cluster<T>[] | undefined
): boolean {
  if (!previousClusters) return false;
  
  for (const cluster of previousClusters) {
    if (cluster.isCluster && cluster.items.some(item => item.id === itemId)) {
      return true;
    }
  }
  return false;
}

/**
 * Smart clustering algorithm with dynamic zoom-based parameters
 */
export function clusterItems<T extends ClusterableItem>(
  items: T[],
  region: Region | null,
  config: ClusterConfig = {}
): Cluster<T>[] {
  if (!region || items.length === 0) {
    return [];
  }

  const { hysteresis } = { ...DEFAULT_CONFIG, ...config };
  const { previousClusters } = config;
  const { latitudeDelta, longitudeDelta } = region;
  
  // Get dynamic parameters based on current zoom level
  const dynamicParams = getDynamicClusterParams(latitudeDelta);
  
  // If clustering is disabled at this zoom level, return all as individual
  if (!dynamicParams.shouldCluster) {
    return items.map(item => ({
      id: `single-${item.id}`,
      latitude: item.latitude,
      longitude: item.longitude,
      items: [item],
      isCluster: false,
    }));
  }
  
  // Calculate overlap distances using dynamic factor
  const baseOverlapDistLat = latitudeDelta * dynamicParams.overlapFactor;
  const baseOverlapDistLng = longitudeDelta * dynamicParams.overlapFactor;
  const minClusterSize = dynamicParams.minSize;

  // Create spatial grid for O(n) neighbor lookup
  const grid = new SpatialGrid<T>(baseOverlapDistLat, baseOverlapDistLng);
  for (const item of items) {
    grid.add(item);
  }

  const processed = new Set<number>();
  const clusters: Cluster<T>[] = [];

  for (const item of items) {
    if (processed.has(item.id)) continue;

    // Apply hysteresis: if item was previously clustered, use larger threshold
    // This prevents flip-flopping at zoom boundaries
    const wasClusteredBefore = wasInCluster(item.id, previousClusters);
    const overlapDistLat = wasClusteredBefore 
      ? baseOverlapDistLat * (1 + (1 - hysteresis))
      : baseOverlapDistLat;
    const overlapDistLng = wasClusteredBefore 
      ? baseOverlapDistLng * (1 + (1 - hysteresis))
      : baseOverlapDistLng;

    // Find all overlapping items
    const nearbyItems = grid.getNearby(item.latitude, item.longitude);
    const overlappingItems: T[] = [];

    for (const nearby of nearbyItems) {
      if (processed.has(nearby.id)) continue;

      const latDiff = Math.abs(nearby.latitude - item.latitude);
      const lngDiff = Math.abs(nearby.longitude - item.longitude);

      if (latDiff < overlapDistLat && lngDiff < overlapDistLng) {
        overlappingItems.push(nearby);
        processed.add(nearby.id);
      }
    }

    // Create cluster or individual marker based on count
    if (overlappingItems.length >= minClusterSize) {
      const centerLat = overlappingItems.reduce((sum, t) => sum + t.latitude, 0) / overlappingItems.length;
      const centerLng = overlappingItems.reduce((sum, t) => sum + t.longitude, 0) / overlappingItems.length;

      clusters.push({
        id: `cluster-${item.id}`,
        latitude: centerLat,
        longitude: centerLng,
        items: overlappingItems,
        isCluster: true,
      });
    } else {
      // Not enough items to cluster - show individually
      for (const singleItem of overlappingItems) {
        clusters.push({
          id: `single-${singleItem.id}`,
          latitude: singleItem.latitude,
          longitude: singleItem.longitude,
          items: [singleItem],
          isCluster: false,
        });
      }
    }
  }

  return clusters;
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
