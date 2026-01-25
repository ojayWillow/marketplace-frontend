/**
 * Optimized Map Clustering Utility
 * Uses spatial grid algorithm for O(n) performance instead of O(n²)
 * Includes hysteresis to prevent flip-flopping at zoom boundaries
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
   * Factor of region delta to use as overlap threshold
   * Smaller = more aggressive clustering
   * Default: 0.04 (4% of visible area)
   */
  overlapThresholdFactor?: number;

  /**
   * Minimum items required to form a cluster
   * Default: 2
   */
  minClusterSize?: number;

  /**
   * Hysteresis factor to prevent flip-flopping
   * Once clustered, need to zoom in this much more to uncluster
   * Value of 0.6 means uncluster threshold is 60% of cluster threshold
   * Default: 0.6
   */
  hysteresis?: number;

  /**
   * Previous clusters for hysteresis comparison
   * Pass the previous result to enable smooth transitions
   */
  previousClusters?: Cluster<any>[];
}

const DEFAULT_CONFIG: Required<Omit<ClusterConfig, 'previousClusters'>> = {
  overlapThresholdFactor: 0.04,
  minClusterSize: 2,
  hysteresis: 0.6,
};

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
 * Fast clustering algorithm with hysteresis
 */
export function clusterItems<T extends ClusterableItem>(
  items: T[],
  region: Region | null,
  config: ClusterConfig = {}
): Cluster<T>[] {
  if (!region || items.length === 0) {
    return [];
  }

  const { 
    overlapThresholdFactor, 
    minClusterSize, 
    hysteresis 
  } = { ...DEFAULT_CONFIG, ...config };
  
  const { previousClusters } = config;

  const { latitudeDelta, longitudeDelta } = region;
  
  // Base overlap distance
  const baseOverlapDistLat = latitudeDelta * overlapThresholdFactor;
  const baseOverlapDistLng = longitudeDelta * overlapThresholdFactor;

  // Create spatial grid
  const grid = new SpatialGrid<T>(baseOverlapDistLat, baseOverlapDistLng);
  for (const item of items) {
    grid.add(item);
  }

  const processed = new Set<number>();
  const clusters: Cluster<T>[] = [];

  for (const item of items) {
    if (processed.has(item.id)) continue;

    // Apply hysteresis: if item was previously clustered, use tighter threshold
    // This means it needs to be zoomed in MORE to uncluster
    const wasClusteredBefore = wasInCluster(item.id, previousClusters);
    const overlapDistLat = wasClusteredBefore 
      ? baseOverlapDistLat * (1 + (1 - hysteresis))  // Larger threshold to stay clustered
      : baseOverlapDistLat;
    const overlapDistLng = wasClusteredBefore 
      ? baseOverlapDistLng * (1 + (1 - hysteresis))
      : baseOverlapDistLng;

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
      clusters.push({
        id: `single-${item.id}`,
        latitude: item.latitude,
        longitude: item.longitude,
        items: overlappingItems,
        isCluster: false,
      });
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
