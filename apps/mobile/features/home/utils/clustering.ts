import type { Task } from '@marketplace/shared';
import type { Region } from 'react-native-maps';
import { OVERLAP_THRESHOLD_FACTOR } from './constants';

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
 * Smart clustering - only groups markers when they would visually overlap on screen
 * This creates a better UX than aggressive clustering algorithms
 */
export const clusterTasks = (tasks: Task[], region: Region | null): Cluster[] => {
  if (!region || tasks.length === 0) return [];
  
  const { latitudeDelta, longitudeDelta } = region;
  
  // Calculate overlap distance based on zoom - tighter threshold
  // Only cluster when markers would actually overlap on screen
  const overlapDistLat = latitudeDelta * OVERLAP_THRESHOLD_FACTOR;
  const overlapDistLng = longitudeDelta * OVERLAP_THRESHOLD_FACTOR;
  
  const clusters: Cluster[] = [];
  const processed = new Set<number>();
  
  for (const task of tasks) {
    if (processed.has(task.id)) continue;
    
    // Find markers that would overlap with this one
    const overlappingTasks = tasks.filter(t => {
      if (processed.has(t.id)) return false;
      if (t.id === task.id) return true;
      
      const latDiff = Math.abs(t.latitude! - task.latitude!);
      const lngDiff = Math.abs(t.longitude! - task.longitude!);
      
      // Only group if they would visually overlap
      return latDiff < overlapDistLat && lngDiff < overlapDistLng;
    });
    
    overlappingTasks.forEach(t => processed.add(t.id));
    
    if (overlappingTasks.length === 1) {
      // Single marker - no clustering needed
      clusters.push({
        id: `single-${task.id}`,
        latitude: task.latitude!,
        longitude: task.longitude!,
        tasks: [task],
        isCluster: false,
      });
    } else {
      // Multiple overlapping markers - create cluster
      const centerLat = overlappingTasks.reduce((sum, t) => sum + t.latitude!, 0) / overlappingTasks.length;
      const centerLng = overlappingTasks.reduce((sum, t) => sum + t.longitude!, 0) / overlappingTasks.length;
      
      clusters.push({
        id: `cluster-${task.id}`,
        latitude: centerLat,
        longitude: centerLng,
        tasks: overlappingTasks,
        isCluster: true,
      });
    }
  }
  
  return clusters;
};
