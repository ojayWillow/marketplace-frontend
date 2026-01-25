/**
 * SIMPLIFIED Map Clustering
 * 
 * GOAL: Jobs should NEVER disappear. Keep it simple and stable.
 * 
 * Rules:
 * 1. If zoomed in close (latitudeDelta < 0.2) - NO clustering, show all individual
 * 2. If zoomed out - cluster nearby jobs (within ~5% of screen)
 * 3. EVERY job must appear somewhere - either as marker or in a cluster
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

// Only cluster when zoomed out past this threshold
const CLUSTER_ZOOM_THRESHOLD = 0.15; // ~city level view

// How close jobs need to be to cluster (as % of visible area)
const CLUSTER_DISTANCE_FACTOR = 0.04; // 4% of screen

// Minimum jobs to form a cluster
const MIN_CLUSTER_SIZE = 3;

/**
 * Simple, stable clustering algorithm
 */
export function clusterItems<T extends ClusterableItem>(
  items: T[],
  region: Region | null,
  _config: ClusterConfig = {}
): Cluster<T>[] {
  // Filter out items without coordinates
  const validItems = items.filter(item => 
    item.latitude !== null && 
    item.latitude !== undefined && 
    item.longitude !== null && 
    item.longitude !== undefined
  );

  // No items = empty array
  if (validItems.length === 0) {
    return [];
  }

  // No region or zoomed in close = show all as individual markers
  if (!region || region.latitudeDelta < CLUSTER_ZOOM_THRESHOLD) {
    return validItems.map(item => ({
      id: `single-${item.id}`,
      latitude: item.latitude,
      longitude: item.longitude,
      items: [item],
      isCluster: false,
    }));
  }

  // Calculate clustering distance based on visible area
  const clusterDistLat = region.latitudeDelta * CLUSTER_DISTANCE_FACTOR;
  const clusterDistLng = region.longitudeDelta * CLUSTER_DISTANCE_FACTOR;

  // Track which items have been assigned
  const assigned = new Set<number>();
  const clusters: Cluster<T>[] = [];

  // Simple O(n²) clustering - fine for <200 items
  for (const item of validItems) {
    if (assigned.has(item.id)) continue;

    // Find all nearby items
    const nearby: T[] = [item];
    assigned.add(item.id);

    for (const other of validItems) {
      if (assigned.has(other.id)) continue;

      const latDiff = Math.abs(other.latitude - item.latitude);
      const lngDiff = Math.abs(other.longitude - item.longitude);

      if (latDiff < clusterDistLat && lngDiff < clusterDistLng) {
        nearby.push(other);
        assigned.add(other.id);
      }
    }

    // Create cluster or individual marker
    if (nearby.length >= MIN_CLUSTER_SIZE) {
      const centerLat = nearby.reduce((sum, t) => sum + t.latitude, 0) / nearby.length;
      const centerLng = nearby.reduce((sum, t) => sum + t.longitude, 0) / nearby.length;

      clusters.push({
        id: `cluster-${item.id}`,
        latitude: centerLat,
        longitude: centerLng,
        items: nearby,
        isCluster: true,
      });
    } else {
      // Not enough for cluster - add each as individual
      for (const single of nearby) {
        clusters.push({
          id: `single-${single.id}`,
          latitude: single.latitude,
          longitude: single.longitude,
          items: [single],
          isCluster: false,
        });
      }
    }
  }

  // SAFETY: Verify all items are accounted for
  const totalInClusters = clusters.reduce((sum, c) => sum + c.items.length, 0);
  if (totalInClusters !== validItems.length) {
    console.error(`[Clustering] BUG: Lost items! Input: ${validItems.length}, Output: ${totalInClusters}`);
    
    // Emergency fallback: find missing and add them
    const inCluster = new Set(clusters.flatMap(c => c.items.map(i => i.id)));
    for (const item of validItems) {
      if (!inCluster.has(item.id)) {
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
