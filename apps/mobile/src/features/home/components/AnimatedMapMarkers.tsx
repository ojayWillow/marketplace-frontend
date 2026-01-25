/**
 * AnimatedMapMarkers - Smooth transitions for clustering/unclustering
 * 
 * IMPORTANT: Markers must ALWAYS render. No marker should ever disappear.
 * Animation is just visual polish - the marker itself must always be visible.
 */

import React, { memo, useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { type Task } from '@marketplace/shared';
import { type Cluster } from '../../../../utils/mapClustering';
import { getMarkerColor } from '../constants';

const ANIMATION_DURATION = 200;

interface AnimatedTaskMarkerProps {
  task: Task;
  isFocused: boolean;
  onPress: (task: Task) => void;
  styles: any;
}

/**
 * Individual task marker - ALWAYS visible
 */
const AnimatedTaskMarker = memo(function AnimatedTaskMarker({
  task,
  isFocused,
  onPress,
  styles,
}: AnimatedTaskMarkerProps) {
  // Safety check - don't render if no coordinates
  if (!task.latitude || !task.longitude) {
    return null;
  }

  const markerColor = getMarkerColor(task.category);
  
  // Simple scale animation on mount
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Marker
      coordinate={{ latitude: task.latitude, longitude: task.longitude }}
      onPress={() => onPress(task)}
      tracksViewChanges={false}
      zIndex={isFocused ? 10 : 1}
    >
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <View style={[
          styles.priceMarker,
          { borderColor: markerColor },
          isFocused && styles.priceMarkerFocused
        ]}>
          <Text style={[styles.priceMarkerText, { color: markerColor }]}>
            €{task.budget?.toFixed(0) || '0'}
          </Text>
        </View>
      </Animated.View>
    </Marker>
  );
});

interface AnimatedClusterMarkerProps {
  cluster: Cluster<Task>;
  onPress: (cluster: Cluster<Task>) => void;
  styles: any;
}

/**
 * Cluster marker (coin) - ALWAYS visible when cluster exists
 */
const AnimatedClusterMarker = memo(function AnimatedClusterMarker({
  cluster,
  onPress,
  styles,
}: AnimatedClusterMarkerProps) {
  // Safety check
  if (!cluster.latitude || !cluster.longitude) {
    return null;
  }

  // Start VISIBLE, just animate scale for polish
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(1)).current; // START AT 1!

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Marker
      coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
      onPress={() => onPress(cluster)}
      tracksViewChanges={false}
      zIndex={5}
    >
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <View style={styles.coinClusterContainer}>
          <View style={styles.coinCluster}>
            <Text style={styles.coinEuro}>€</Text>
          </View>
          <View style={styles.coinBadge}>
            <Text style={styles.coinBadgeText}>{cluster.items.length}</Text>
          </View>
        </View>
      </Animated.View>
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
 * Main component - renders ALL clusters/markers
 * Every job MUST be represented either as individual marker or inside a cluster
 */
export const AnimatedMapMarkers = memo(function AnimatedMapMarkers({
  clusters,
  focusedTaskId,
  onClusterPress,
  onTaskPress,
  styles,
}: AnimatedMapMarkersProps) {
  
  // Debug: log cluster count
  // console.log(`[AnimatedMapMarkers] Rendering ${clusters.length} clusters`);

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.isCluster) {
          // Render cluster coin
          return (
            <AnimatedClusterMarker
              key={cluster.id}
              cluster={cluster}
              onPress={onClusterPress}
              styles={styles}
            />
          );
        } else {
          // Render individual task marker
          const task = cluster.items[0];
          if (!task) return null;
          
          return (
            <AnimatedTaskMarker
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
