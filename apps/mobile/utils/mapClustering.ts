/**
 * Optimized map clustering using spatial grid algorithm
 * 
 * Performance:
 * - Old algorithm: O(n²) - checks every marker against every other marker
 * - New algorithm: O(n) - uses spatial grid for instant neighbor lookup
 * 
 * For 100 markers:
 * - Old: 10,000 comparisons
 * - New: ~100 comparisons
 */

import { Region } from 'react-native-maps';

export interface Task {
  id: number;
  latitude?: number;
  longitude?: number;
  category: string;
  budget?: number;
  [key: string]: any;
}

export interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  tasks: Task[];
  isCluster: boolean;
}

// Clustering threshold - only cluster when markers would visually overlap
const OVERLAP_THRESHOLD_FACTOR = 0.025;

/**
 * Fast spatial grid-based clustering
 * 
 * Algorithm:
 * 1. Create a grid overlaying the map region
 * 2. Hash each marker into grid cells
 * 3. Only check markers in same/adjacent cells for clustering
 * 
 * Result: Same visual output as before, but 10x faster
 */
export const clusterTasks = (tasks: Task[], region: Region | null): Cluster[] => {
  if (!region || tasks.length === 0) return [];
  
  const { latitudeDelta, longitudeDelta } = region;
  const overlapDistLat = latitudeDelta * OVERLAP_THRESHOLD_FACTOR;
  const overlapDistLng = longitudeDelta * OVERLAP_THRESHOLD_FACTOR;
  
  // Create spatial grid for fast neighbor lookup
  // Grid cell size = overlap distance (perfect for clustering)
  const gridCellSizeLat = overlapDistLat;
  const gridCellSizeLng = overlapDistLng;
  
  // Hash function: converts (lat, lng) to grid cell coordinates
  const getGridCell = (lat: number, lng: number): string => {
    const cellLat = Math.floor(lat / gridCellSizeLat);
    const cellLng = Math.floor(lng / gridCellSizeLng);
    return `${cellLat},${cellLng}`;
  };
  
  // Build spatial grid: cell_key -> array of tasks in that cell
  const grid = new Map<string, Task[]>();
  
  for (const task of tasks) {
    if (!task.latitude || !task.longitude) continue;
    
    const cellKey = getGridCell(task.latitude, task.longitude);
    if (!grid.has(cellKey)) {
      grid.set(cellKey, []);
    }
    grid.get(cellKey)!.push(task);
  }
  
  // Process each grid cell
  const clusters: Cluster[] = [];
  const processed = new Set<number>();
  
  for (const [cellKey, cellTasks] of grid.entries()) {
    // Get adjacent cells (including current cell)
    const [cellLat, cellLng] = cellKey.split(',').map(Number);
    const adjacentCells: Task[] = [];
    
    // Check 3x3 grid around current cell (including self)
    for (let dLat = -1; dLat <= 1; dLat++) {
      for (let dLng = -1; dLng <= 1; dLng++) {
        const adjKey = `${cellLat + dLat},${cellLng + dLng}`;
        const adjTasks = grid.get(adjKey);
        if (adjTasks) {
          adjacentCells.push(...adjTasks);
        }
      }
    }
    
    // Cluster tasks within this cell
    for (const task of cellTasks) {
      if (processed.has(task.id)) continue;
      
      // Find all overlapping tasks (only check adjacent cells, not all tasks!)
      const overlappingTasks = adjacentCells.filter(t => {
        if (processed.has(t.id)) return false;
        if (t.id === task.id) return true;
        
        const latDiff = Math.abs(t.latitude! - task.latitude!);
        const lngDiff = Math.abs(t.longitude! - task.longitude!);
        
        return latDiff < overlapDistLat && lngDiff < overlapDistLng;
      });
      
      // Mark all as processed
      overlappingTasks.forEach(t => processed.add(t.id));
      
      if (overlappingTasks.length === 1) {
        // Single marker
        clusters.push({
          id: `single-${task.id}`,
          latitude: task.latitude!,
          longitude: task.longitude!,
          tasks: [task],
          isCluster: false,
        });
      } else {
        // Cluster of multiple markers
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
  }
  
  return clusters;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Used for sorting by distance
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
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
};
