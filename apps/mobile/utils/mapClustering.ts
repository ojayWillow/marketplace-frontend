/**
 * Map Clustering Utility - DISABLED FOR DEBUGGING
 * 
 * Clustering is temporarily disabled to stop app crashes.
 * All jobs render as individual markers.
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

/**
 * CLUSTERING DISABLED - Returns all items as individual markers
 */
export function clusterItems<T extends ClusterableItem>(
  items: T[],
  _region: Region | null,
  _config: ClusterConfig = {}
): Cluster<T>[] {
  // Filter items with valid coordinates
  const validItems = (items || []).filter(item => 
    item && 
    typeof item.latitude === 'number' && 
    typeof item.longitude === 'number' &&
    !isNaN(item.latitude) &&
    !isNaN(item.longitude)
  );

  // Return each item as individual marker (no clustering)
  return validItems.map(item => ({
    id: `single-${item.id}`,
    latitude: item.latitude,
    longitude: item.longitude,
    items: [item],
    isCluster: false,
  }));
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
