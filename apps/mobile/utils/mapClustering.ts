/**
 * Simple Map Clustering
 * 
 * TESTED: Without clustering, all 43 markers render correctly.
 * Now adding back MINIMAL clustering only when markers would visually overlap.
 * 
 * Rules:
 * 1. Only cluster when zoomed out FAR (latitudeDelta > 0.3)
 * 2. Minimum 4 jobs to form a cluster
 * 3. Very tight distance - only when markers would literally overlap
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

// Only cluster when VERY zoomed out
const CLUSTER_ZOOM_THRESHOLD = 0.3;

// Very tight clustering - only when markers would overlap
const CLUSTER_DISTANCE_FACTOR = 0.025; // 2.5% of screen

// Need at least 4 jobs to make a cluster
const MIN_CLUSTER_SIZE = 4;

/**
 * Simple clustering - all items as individual OR in clusters
 */
export function clusterItems<T extends ClusterableItem>(
  items: T[],
  region: Region | null,
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

  if (validItems.length === 0) {
    return [];
  }

  // No region OR zoomed in = show all as individual markers
  if (!region || region.latitudeDelta < CLUSTER_ZOOM_THRESHOLD) {
    return validItems.map(item => ({
      id: `single-${item.id}`,
      latitude: item.latitude,
      longitude: item.longitude,
      items: [item],
      isCluster: false,
    }));
  }

  // Zoomed out - apply simple clustering
  const clusterDistLat = region.latitudeDelta * CLUSTER_DISTANCE_FACTOR;
  const clusterDistLng = region.longitudeDelta * CLUSTER_DISTANCE_FACTOR;

  const assigned = new Set<number>();
  const clusters: Cluster<T>[] = [];

  for (const item of validItems) {
    if (assigned.has(item.id)) continue;

    // Find nearby items
    const nearby: T[] = [];
    
    for (const other of validItems) {
      if (assigned.has(other.id)) continue;

      const latDiff = Math.abs(other.latitude - item.latitude);
      const lngDiff = Math.abs(other.longitude - item.longitude);

      if (latDiff < clusterDistLat && lngDiff < clusterDistLng) {
        nearby.push(other);
      }
    }

    // Only cluster if we have enough items
    if (nearby.length >= MIN_CLUSTER_SIZE) {
      // Mark all as assigned
      for (const n of nearby) {
        assigned.add(n.id);
      }

      // Calculate center
      const centerLat = nearby.reduce((sum, t) => sum + t.latitude, 0) / nearby.length;
      const centerLng = nearby.reduce((sum, t) => sum + t.longitude, 0) / nearby.length;

      clusters.push({
        id: `cluster-${item.id}`,
        latitude: centerLat,
        longitude: centerLng,
        items: nearby,
        isCluster: true,
      });
    }
  }

  // Add remaining items as individual markers
  for (const item of validItems) {
    if (!assigned.has(item.id)) {
      clusters.push({
        id: `single-${item.id}`,
        latitude: item.latitude,
        longitude: item.longitude,
        items: [item],
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
