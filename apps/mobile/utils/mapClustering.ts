/**
 * Smart Map Clustering Utility
 * 
 * CRITICAL: Every job MUST appear in exactly one cluster or as individual marker.
 * No job should ever "disappear" from the map.
 * 
 * Dynamic clustering based on zoom level:
 * - CLOSE (street): No clustering - always show individual jobs
 * - MEDIUM (city): Cluster only when 3+ jobs overlap
 * - FAR (country): Normal clustering 
 * - EXTREME (continental): Aggressive clustering
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
  overlapThresholdFactor?: number;
  minClusterSize?: number;
  hysteresis?: number;
  previousClusters?: Cluster<any>[];
}

const DEFAULT_CONFIG = {
  overlapThresholdFactor: 0.04,
  minClusterSize: 2,
  hysteresis: 0.6,
};

/**
 * Zoom level detection thresholds (based on latitudeDelta)
 */
const ZOOM_THRESHOLDS = {
  CLOSE: 0.015,     // Street level - buildings visible
  MEDIUM: 0.1,      // City level - neighborhoods visible  
  FAR: 0.6,         // Country level - cities visible
  EXTREME: 3.0,     // Continental level
};

/**
 * Get dynamic clustering parameters based on zoom level
 */
function getDynamicClusterParams(latitudeDelta: number): {
  overlapFactor: number;
  minSize: number;
  shouldCluster: boolean;
} {
  // CLOSE zoom (street level) - NO clustering at all
  if (latitudeDelta <= ZOOM_THRESHOLDS.CLOSE) {
    return { overlapFactor: 0, minSize: 999, shouldCluster: false };
  }
  
  // MEDIUM zoom (city/neighborhood) - gentle clustering, min 3 jobs
  if (latitudeDelta <= ZOOM_THRESHOLDS.MEDIUM) {
    return { overlapFactor: 0.025, minSize: 3, shouldCluster: true };
  }
  
  // FAR zoom (country level) - normal clustering
  if (latitudeDelta <= ZOOM_THRESHOLDS.FAR) {
    return { overlapFactor: 0.04, minSize: 2, shouldCluster: true };
  }
  
  // EXTREME zoom (continental) - more aggressive
  if (latitudeDelta <= ZOOM_THRESHOLDS.EXTREME) {
    return { overlapFactor: 0.06, minSize: 2, shouldCluster: true };
  }
  
  // WORLD view - very aggressive
  return { overlapFactor: 0.1, minSize: 2, shouldCluster: true };
}

/**
 * Spatial grid for fast neighbor lookup - O(1) instead of O(n)
 */
class SpatialGrid<T extends ClusterableItem> {
  private grid: Map<string, T[]> = new Map();
  private cellSizeLat: number;
  private cellSizeLng: number;

  constructor(cellSizeLat: number, cellSizeLng: number) {
    this.cellSizeLat = Math.max(cellSizeLat, 0.001); // Minimum cell size
    this.cellSizeLng = Math.max(cellSizeLng, 0.001);
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
 * Smart clustering algorithm
 * GUARANTEE: Every input item will appear in exactly one output cluster
 */
export function clusterItems<T extends ClusterableItem>(
  items: T[],
  region: Region | null,
  config: ClusterConfig = {}
): Cluster<T>[] {
  // No items = no clusters
  if (!items || items.length === 0) {
    return [];
  }

  // No region = show all as individual (safe fallback)
  if (!region) {
    return items.map(item => ({
      id: `single-${item.id}`,
      latitude: item.latitude,
      longitude: item.longitude,
      items: [item],
      isCluster: false,
    }));
  }

  const { hysteresis } = { ...DEFAULT_CONFIG, ...config };
  const { latitudeDelta, longitudeDelta } = region;
  
  // Get dynamic parameters based on zoom
  const dynamicParams = getDynamicClusterParams(latitudeDelta);
  
  // If clustering disabled, return all as individual markers
  if (!dynamicParams.shouldCluster) {
    return items.map(item => ({
      id: `single-${item.id}`,
      latitude: item.latitude,
      longitude: item.longitude,
      items: [item],
      isCluster: false,
    }));
  }
  
  // Calculate overlap thresholds
  const overlapDistLat = latitudeDelta * dynamicParams.overlapFactor;
  const overlapDistLng = longitudeDelta * dynamicParams.overlapFactor;
  const minClusterSize = dynamicParams.minSize;

  // Build spatial grid for fast lookups
  const grid = new SpatialGrid<T>(overlapDistLat, overlapDistLng);
  for (const item of items) {
    if (item.latitude && item.longitude) {
      grid.add(item);
    }
  }

  const processed = new Set<number>();
  const clusters: Cluster<T>[] = [];

  // Process each item
  for (const item of items) {
    // Skip if already processed or no coordinates
    if (processed.has(item.id) || !item.latitude || !item.longitude) {
      continue;
    }

    // Find all overlapping items (including self)
    const nearbyItems = grid.getNearby(item.latitude, item.longitude);
    const overlappingItems: T[] = [];

    for (const nearby of nearbyItems) {
      if (processed.has(nearby.id)) continue;

      const latDiff = Math.abs(nearby.latitude - item.latitude);
      const lngDiff = Math.abs(nearby.longitude - item.longitude);

      if (latDiff <= overlapDistLat && lngDiff <= overlapDistLng) {
        overlappingItems.push(nearby);
        processed.add(nearby.id);
      }
    }

    // Create cluster or individual markers
    if (overlappingItems.length >= minClusterSize) {
      // Create cluster
      const centerLat = overlappingItems.reduce((sum, t) => sum + t.latitude, 0) / overlappingItems.length;
      const centerLng = overlappingItems.reduce((sum, t) => sum + t.longitude, 0) / overlappingItems.length;

      clusters.push({
        id: `cluster-${item.id}-${overlappingItems.length}`,
        latitude: centerLat,
        longitude: centerLng,
        items: overlappingItems,
        isCluster: true,
      });
    } else {
      // Create individual markers for each item
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

  // SAFETY CHECK: Ensure all items are accounted for
  const totalItemsInClusters = clusters.reduce((sum, c) => sum + c.items.length, 0);
  const validItems = items.filter(i => i.latitude && i.longitude).length;
  
  if (totalItemsInClusters !== validItems) {
    console.warn(`[Clustering] Item count mismatch! Input: ${validItems}, Output: ${totalItemsInClusters}`);
    
    // Fallback: find missing items and add them
    const clusteredIds = new Set(clusters.flatMap(c => c.items.map(i => i.id)));
    for (const item of items) {
      if (item.latitude && item.longitude && !clusteredIds.has(item.id)) {
        clusters.push({
          id: `single-${item.id}`,
          latitude: item.latitude,
          longitude: item.longitude,
          items: [item],
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
  const R = 6371;
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
