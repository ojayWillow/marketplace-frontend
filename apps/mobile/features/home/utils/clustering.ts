import type { Task } from '@marketplace/shared';
import type { Region } from 'react-native-maps';
import { SCREEN_WIDTH } from './constants';

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
 * Simple clustering based on screen pixel distance
 * Markers within ~60px of each other get clustered
 */
export const clusterTasks = (tasks: Task[], region: Region | null): Cluster[] => {
  if (!region || tasks.length === 0) return [];
  
  const { latitudeDelta, longitudeDelta } = region;
  
  // Convert ~60 screen pixels to map coordinates
  // This gives consistent visual clustering regardless of zoom
  const pixelThreshold = 60;
  const latPerPixel = latitudeDelta / 800; // approximate screen height in map coords
  const lngPerPixel = longitudeDelta / SCREEN_WIDTH;
  
  const thresholdLat = latPerPixel * pixelThreshold;
  const thresholdLng = lngPerPixel * pixelThreshold;
  
  const clusters: Cluster[] = [];
  const processed = new Set<number>();
  
  for (const task of tasks) {
    if (processed.has(task.id)) continue;
    if (!task.latitude || !task.longitude) continue;
    
    // Find all markers close to this one
    const nearbyTasks = tasks.filter(t => {
      if (processed.has(t.id)) return false;
      if (!t.latitude || !t.longitude) return false;
      if (t.id === task.id) return true;
      
      const latDiff = Math.abs(t.latitude - task.latitude!);
      const lngDiff = Math.abs(t.longitude - task.longitude!);
      
      return latDiff < thresholdLat && lngDiff < thresholdLng;
    });
    
    nearbyTasks.forEach(t => processed.add(t.id));
    
    if (nearbyTasks.length === 1) {
      // Single marker
      clusters.push({
        id: `single-${task.id}`,
        latitude: task.latitude,
        longitude: task.longitude,
        tasks: [task],
        isCluster: false,
      });
    } else {
      // Cluster - place at center of all markers
      const centerLat = nearbyTasks.reduce((sum, t) => sum + t.latitude!, 0) / nearbyTasks.length;
      const centerLng = nearbyTasks.reduce((sum, t) => sum + t.longitude!, 0) / nearbyTasks.length;
      
      clusters.push({
        id: `cluster-${centerLat.toFixed(4)}-${centerLng.toFixed(4)}-${nearbyTasks.length}`,
        latitude: centerLat,
        longitude: centerLng,
        tasks: nearbyTasks,
        isCluster: true,
      });
    }
  }
  
  return clusters;
};
