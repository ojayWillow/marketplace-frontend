import type { Task } from '@marketplace/shared';
import type { Region } from 'react-native-maps';

/**
 * Cluster type - represents either a single marker or a group of overlapping markers
 */
export interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  tasks: Task[];
  isCluster: boolean;
}

/**
 * Dynamic clustering threshold based on zoom level
 * 
 * At different zoom levels, we want different clustering behavior:
 * - Zoomed out (country level): cluster aggressively
 * - Mid zoom (city level): moderate clustering
 * - Zoomed in (neighborhood): minimal clustering, show individual markers
 */
const getClusterThreshold = (latitudeDelta: number): { lat: number; lng: number } => {
  // These multipliers control how aggressively markers cluster at each zoom level
  // Higher = more aggressive clustering
  
  if (latitudeDelta > 5) {
    // Very zoomed out (multiple countries) - very aggressive
    return { lat: latitudeDelta * 0.15, lng: latitudeDelta * 0.15 };
  } else if (latitudeDelta > 2) {
    // Country level - aggressive clustering
    return { lat: latitudeDelta * 0.12, lng: latitudeDelta * 0.12 };
  } else if (latitudeDelta > 0.5) {
    // Region level - moderate clustering
    return { lat: latitudeDelta * 0.08, lng: latitudeDelta * 0.08 };
  } else if (latitudeDelta > 0.1) {
    // City level - light clustering
    return { lat: latitudeDelta * 0.05, lng: latitudeDelta * 0.05 };
  } else {
    // Neighborhood level - minimal clustering (only truly overlapping)
    return { lat: latitudeDelta * 0.03, lng: latitudeDelta * 0.03 };
  }
};

/**
 * Smart clustering - groups markers based on zoom level
 * More aggressive when zoomed out, shows individual markers when zoomed in
 */
export const clusterTasks = (tasks: Task[], region: Region | null): Cluster[] => {
  if (!region || tasks.length === 0) return [];
  
  const { latitudeDelta, longitudeDelta } = region;
  
  // Get dynamic threshold based on current zoom
  const threshold = getClusterThreshold(latitudeDelta);
  
  const clusters: Cluster[] = [];
  const processed = new Set<number>();
  
  // Sort tasks by latitude for more consistent clustering
  const sortedTasks = [...tasks].sort((a, b) => (b.latitude || 0) - (a.latitude || 0));
  
  for (const task of sortedTasks) {
    if (processed.has(task.id)) continue;
    if (!task.latitude || !task.longitude) continue;
    
    // Find markers that should cluster with this one
    const overlappingTasks = sortedTasks.filter(t => {
      if (processed.has(t.id)) return false;
      if (!t.latitude || !t.longitude) return false;
      if (t.id === task.id) return true;
      
      const latDiff = Math.abs(t.latitude - task.latitude!);
      const lngDiff = Math.abs(t.longitude - task.longitude!);
      
      return latDiff < threshold.lat && lngDiff < threshold.lng;
    });
    
    overlappingTasks.forEach(t => processed.add(t.id));
    
    if (overlappingTasks.length === 1) {
      // Single marker - no clustering needed
      clusters.push({
        id: `single-${task.id}`,
        latitude: task.latitude,
        longitude: task.longitude,
        tasks: [task],
        isCluster: false,
      });
    } else {
      // Multiple markers - create cluster at center point
      const centerLat = overlappingTasks.reduce((sum, t) => sum + t.latitude!, 0) / overlappingTasks.length;
      const centerLng = overlappingTasks.reduce((sum, t) => sum + t.longitude!, 0) / overlappingTasks.length;
      
      clusters.push({
        id: `cluster-${task.id}-${overlappingTasks.length}`,
        latitude: centerLat,
        longitude: centerLng,
        tasks: overlappingTasks,
        isCluster: true,
      });
    }
  }
  
  return clusters;
};
