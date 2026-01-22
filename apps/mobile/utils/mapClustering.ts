/**
 * Optimized Map Clustering Utility
 * Uses spatial grid algorithm for O(n) performance instead of O(n²)
 */

import type { Region } from 'react-native-maps';

export interface ClusterableItem {
  id: number;
  latitude: number;
  longitude: number;
  [key: string]: any; // Allow additional properties
}

export interface Cluster<T extends ClusterableItem> {
  id: string;
  latitude: number;
  longitude: number;
  items: T[];
  isCluster: boolean;
}

/**
 * Configuration for clustering behavior
 */
export interface ClusterConfig {
  /**
   * Factor of region delta to use as overlap threshold
   * Smaller = more aggressive clustering
   * Default: 0.025 (2.5% of visible area)
   */
  overlapThresholdFactor?: number;

  /**
   * Minimum items required to form a cluster
   * Default: 2
   */
  minClusterSize?: number;
}

const DEFAULT_CONFIG: Required<ClusterConfig> = {
  overlapThresholdFactor: 0.025,
  minClusterSize: 2,
};

/**
 * Spatial grid for fast neighbor lookup
 * Divides the map into cells and stores items by cell
 */
class SpatialGrid<T extends ClusterableItem> {
  private grid: Map<string, T[]> = new Map();
  private cellSizeLat: number;
  private cellSizeLng: number;

  constructor(cellSizeLat: number, cellSizeLng: number) {
    this.cellSizeLat = cellSizeLat;
    this.cellSizeLng = cellSizeLng;
  }

  /**
   * Get cell key for a coordinate
   */
  private getCellKey(lat: number, lng: number): string {
    const cellLat = Math.floor(lat / this.cellSizeLat);
    const cellLng = Math.floor(lng / this.cellSizeLng);
    return `${cellLat},${cellLng}`;
  }

  /**
   * Add item to grid
   */
  add(item: T): void {
    const key = this.getCellKey(item.latitude, item.longitude);
    const cell = this.grid.get(key);
    if (cell) {
      cell.push(item);
    } else {
      this.grid.set(key, [item]);
    }
  }

  /**
   * Get nearby items (within 3x3 cell neighborhood)
   * This ensures we catch items near cell boundaries
   */
  getNearby(lat: number, lng: number): T[] {
    const centerKey = this.getCellKey(lat, lng);
    const [centerLat, centerLng] = centerKey.split(',').map(Number);
    const nearby: T[] = [];

    // Check 3x3 grid around center cell
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
 * Fast clustering algorithm using spatial grid
 * Time complexity: O(n) average case, O(n*k) worst case where k is max items per cell
 * Space complexity: O(n)
 */
export function clusterItems<T extends ClusterableItem>(
  items: T[],
  region: Region | null,
  config: ClusterConfig = {}
): Cluster<T>[] {
  // Early return for edge cases
  if (!region || items.length === 0) {
    return [];
  }

  const { overlapThresholdFactor, minClusterSize } = { ...DEFAULT_CONFIG, ...config };

  // Calculate overlap distance based on current zoom level
  const { latitudeDelta, longitudeDelta } = region;
  const overlapDistLat = latitudeDelta * overlapThresholdFactor;
  const overlapDistLng = longitudeDelta * overlapThresholdFactor;

  // Create spatial grid with cell size = overlap distance
  // This ensures nearby items are in same or adjacent cells
  const grid = new SpatialGrid<T>(overlapDistLat, overlapDistLng);

  // Populate grid
  for (const item of items) {
    grid.add(item);
  }

  // Track processed items
  const processed = new Set<number>();
  const clusters: Cluster<T>[] = [];

  // Process each item
  for (const item of items) {
    if (processed.has(item.id)) continue;

    // Get nearby items from grid (fast lookup)
    const nearbyItems = grid.getNearby(item.latitude, item.longitude);

    // Find overlapping items
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

    // Create cluster or single marker
    if (overlappingItems.length >= minClusterSize) {
      // Calculate center of overlapping items
      const centerLat =
        overlappingItems.reduce((sum, t) => sum + t.latitude, 0) / overlappingItems.length;
      const centerLng =
        overlappingItems.reduce((sum, t) => sum + t.longitude, 0) / overlappingItems.length;

      clusters.push({
        id: `cluster-${item.id}`,
        latitude: centerLat,
        longitude: centerLng,
        items: overlappingItems,
        isCluster: true,
      });
    } else {
      // Single item (no clustering)
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
 * Helper to calculate distance between two points (Haversine formula)
 * Used for validation/testing
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
