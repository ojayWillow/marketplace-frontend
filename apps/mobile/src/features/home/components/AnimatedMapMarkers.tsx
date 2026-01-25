/**
 * MapMarkers - Simple, stable marker rendering
 * 
 * NO animations that could cause markers to be invisible.
 * Just render everything directly and reliably.
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { type Task } from '@marketplace/shared';
import { type Cluster } from '../../../../utils/mapClustering';
import { getMarkerColor } from '../constants';

interface TaskMarkerProps {
  task: Task;
  isFocused: boolean;
  onPress: (task: Task) => void;
  styles: any;
}

/**
 * Individual task marker - simple and direct
 */
const TaskMarker = memo(function TaskMarker({
  task,
  isFocused,
  onPress,
  styles,
}: TaskMarkerProps) {
  if (!task.latitude || !task.longitude) {
    return null;
  }

  const markerColor = getMarkerColor(task.category);

  return (
    <Marker
      coordinate={{ latitude: task.latitude, longitude: task.longitude }}
      onPress={() => onPress(task)}
      tracksViewChanges={false}
      zIndex={isFocused ? 10 : 1}
    >
      <View style={[
        styles.priceMarker,
        { borderColor: markerColor },
        isFocused && styles.priceMarkerFocused
      ]}>
        <Text style={[styles.priceMarkerText, { color: markerColor }]}>
          €{task.budget?.toFixed(0) || '0'}
        </Text>
      </View>
    </Marker>
  );
});

interface ClusterMarkerProps {
  cluster: Cluster<Task>;
  onPress: (cluster: Cluster<Task>) => void;
  styles: any;
}

/**
 * Cluster marker (coin) - simple and direct
 */
const ClusterMarker = memo(function ClusterMarker({
  cluster,
  onPress,
  styles,
}: ClusterMarkerProps) {
  if (!cluster.latitude || !cluster.longitude) {
    return null;
  }

  return (
    <Marker
      coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
      onPress={() => onPress(cluster)}
      tracksViewChanges={false}
      zIndex={5}
    >
      <View style={styles.coinClusterContainer}>
        <View style={styles.coinCluster}>
          <Text style={styles.coinEuro}>€</Text>
        </View>
        <View style={styles.coinBadge}>
          <Text style={styles.coinBadgeText}>{cluster.items.length}</Text>
        </View>
      </View>
    </Marker>
  );
});

interface AnimatedMapMarkersProps {
  clusters: Cluster<Task>[];
  previousClusters: Cluster<Task>[];
  focusedTaskId: number | null;
  onClusterPress: (cluster: Cluster<Task>) => void;
  onTaskPress: (task: Task) => void;
  styles: any;
}

/**
 * Main component - renders ALL clusters and markers
 * No animations, just reliable rendering.
 */
export const AnimatedMapMarkers = memo(function AnimatedMapMarkers({
  clusters,
  focusedTaskId,
  onClusterPress,
  onTaskPress,
  styles,
}: AnimatedMapMarkersProps) {
  
  // Debug logging
  // console.log(`[MapMarkers] Rendering ${clusters.length} clusters/markers`);

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.isCluster) {
          return (
            <ClusterMarker
              key={cluster.id}
              cluster={cluster}
              onPress={onClusterPress}
              styles={styles}
            />
          );
        } else {
          const task = cluster.items[0];
          if (!task) return null;
          
          return (
            <TaskMarker
              key={`task-${task.id}`}
              task={task}
              isFocused={focusedTaskId === task.id}
              onPress={onTaskPress}
              styles={styles}
            />
          );
        }
      })}
    </>
  );
});

export default AnimatedMapMarkers;
