/**
 * Map Clustering Utility
 * 
 * Groups nearby map markers into clusters to reduce visual clutter.
 * 
 * Rules:
 * 1. Zoomed in (latitudeDelta < 0.25) = NO clustering, show all individual
 * 2. Zoomed out = cluster jobs that are close together
 * 3. Minimum 3 jobs to form a cluster
 * 4. Every job MUST appear either as individual marker OR inside a cluster
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

// Cluster when zoomed out past this level
const CLUSTER_ZOOM_THRESHOLD = 0.25;

// How close items must be to cluster (% of visible area)
const CLUSTER_DISTANCE_FACTOR = 0.035; // 3.5% of screen

// Minimum items to form a cluster
const MIN_CLUSTER_SIZE = 3;

/**
 * Main clustering function
 */
export function clusterItems<T extends ClusterableItem>(
  items: T[],
  region: Region | null,
  _config: ClusterConfig = {}
): Cluster<T>[] {
  // Filter to items with valid coordinates
  const validItems = (items || []).filter(item => 
    item && 
    typeof item.latitude === 'number' && 
    typeof item.longitude === 'number' &&
    !isNaN(item.latitude) &&
    !isNaN(item.longitude)
  );

  // No items = empty result
  if (validItems.length === 0) {
    return [];
  }

  // No region OR zoomed in close = show ALL as individual markers (no clustering)
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

  // Track which items have been assigned to a cluster
  const assigned = new Set<number>();
  const clusters: Cluster<T>[] = [];

  // Process each item as potential cluster seed
  for (const seedItem of validItems) {
    // Skip if already in another cluster
    if (assigned.has(seedItem.id)) continue;

    // Start cluster with the seed item
    const clusterItems: T[] = [seedItem];
    assigned.add(seedItem.id);

    // Find all other nearby items
    for (const other of validItems) {
      if (assigned.has(other.id)) continue;

      const latDiff = Math.abs(other.latitude - seedItem.latitude);
      const lngDiff = Math.abs(other.longitude - seedItem.longitude);

      if (latDiff < clusterDistLat && lngDiff < clusterDistLng) {
        clusterItems.push(other);
        assigned.add(other.id);
      }
    }

    // Decide: cluster or individual markers?
    if (clusterItems.length >= MIN_CLUSTER_SIZE) {
      // Form a cluster
      const centerLat = clusterItems.reduce((sum, t) => sum + t.latitude, 0) / clusterItems.length;
      const centerLng = clusterItems.reduce((sum, t) => sum + t.longitude, 0) / clusterItems.length;

      clusters.push({
        id: `cluster-${seedItem.id}`,
        latitude: centerLat,
        longitude: centerLng,
        items: clusterItems,
        isCluster: true,
      });
      
      // Debug log
      console.log(`[Cluster] Created cluster with ${clusterItems.length} items at (${centerLat.toFixed(4)}, ${centerLng.toFixed(4)})`);
    } else {
      // Not enough for cluster - add each as individual marker
      for (const single of clusterItems) {
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

  // Verify: total items in clusters should equal input items
  const totalInOutput = clusters.reduce((sum, c) => sum + c.items.length, 0);
  if (totalInOutput !== validItems.length) {
    console.error(`[Cluster] BUG! Input: ${validItems.length}, Output: ${totalInOutput}`);
  } else {
    console.log(`[Cluster] OK: ${validItems.length} items -> ${clusters.length} markers (${clusters.filter(c => c.isCluster).length} clusters)`);
  }

  return clusters;
}

/**
 * Calculate distance between two points in km (Haversine formula)
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
