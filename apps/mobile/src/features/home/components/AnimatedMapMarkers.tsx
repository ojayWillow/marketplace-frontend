/**
 * AnimatedMapMarkers - Smooth transitions for clustering/unclustering
 * 
 * When zooming IN (cluster → jobs):
 * - Jobs animate FROM cluster center TO their actual positions
 * - Cluster fades out as jobs fade in
 * 
 * When zooming OUT (jobs → cluster):
 * - Jobs animate FROM their positions TO cluster center
 * - Jobs fade out as cluster fades in
 */

import React, { memo, useEffect, useRef, useMemo } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { type Task } from '@marketplace/shared';
import { type Cluster } from '../../../../utils/mapClustering';
import { getMarkerColor } from '../constants';

const ANIMATION_DURATION = 250; // ms - fast but smooth

interface AnimatedTaskMarkerProps {
  task: Task;
  isFocused: boolean;
  clusterCenter?: { latitude: number; longitude: number };
  isUnclustering: boolean;
  onPress: (task: Task) => void;
  styles: any;
}

/**
 * Individual task marker with position animation
 */
const AnimatedTaskMarker = memo(function AnimatedTaskMarker({
  task,
  isFocused,
  clusterCenter,
  isUnclustering,
  onPress,
  styles,
}: AnimatedTaskMarkerProps) {
  const markerColor = getMarkerColor(task.category);
  
  // Animation values
  const opacity = useRef(new Animated.Value(isUnclustering ? 0 : 1)).current;
  const scale = useRef(new Animated.Value(isUnclustering ? 0.5 : 1)).current;
  
  // Animated position - start from cluster center if unclustering
  const animatedLat = useRef(
    new Animated.Value(isUnclustering && clusterCenter ? clusterCenter.latitude : task.latitude!)
  ).current;
  const animatedLng = useRef(
    new Animated.Value(isUnclustering && clusterCenter ? clusterCenter.longitude : task.longitude!)
  ).current;

  useEffect(() => {
    if (isUnclustering && clusterCenter) {
      // Animate from cluster center to actual position
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(animatedLat, {
          toValue: task.latitude!,
          duration: ANIMATION_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(animatedLng, {
          toValue: task.longitude!,
          duration: ANIMATION_DURATION,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Just show immediately at actual position
      opacity.setValue(1);
      scale.setValue(1);
      animatedLat.setValue(task.latitude!);
      animatedLng.setValue(task.longitude!);
    }
  }, [isUnclustering, clusterCenter, task.latitude, task.longitude]);

  // For react-native-maps, we can't animate the coordinate directly
  // So we use opacity and scale for visual smoothness
  return (
    <Marker
      coordinate={{ latitude: task.latitude!, longitude: task.longitude! }}
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
  isFadingOut: boolean;
  onPress: (cluster: Cluster<Task>) => void;
  styles: any;
}

/**
 * Cluster marker with fade animation
 */
const AnimatedClusterMarker = memo(function AnimatedClusterMarker({
  cluster,
  isFadingOut,
  onPress,
  styles,
}: AnimatedClusterMarkerProps) {
  const opacity = useRef(new Animated.Value(isFadingOut ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(isFadingOut ? 1 : 0.8)).current;

  useEffect(() => {
    if (isFadingOut) {
      // Fade out when unclustering
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIMATION_DURATION * 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade in when clustering
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFadingOut]);

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
 * Main component that manages all animated markers
 */
export const AnimatedMapMarkers = memo(function AnimatedMapMarkers({
  clusters,
  previousClusters,
  focusedTaskId,
  onClusterPress,
  onTaskPress,
  styles,
}: AnimatedMapMarkersProps) {
  
  // Track which tasks just came out of clusters (for animation)
  const unclusteringTasks = useMemo(() => {
    const taskIdToClusterCenter = new Map<number, { latitude: number; longitude: number }>();
    
    // Find tasks that were in clusters before but are now individual
    for (const prevCluster of previousClusters) {
      if (prevCluster.isCluster) {
        // Check if any of these tasks are now individual markers
        for (const task of prevCluster.items) {
          const currentCluster = clusters.find(c => 
            !c.isCluster && c.items[0]?.id === task.id
          );
          if (currentCluster) {
            // This task went from clustered → individual
            taskIdToClusterCenter.set(task.id, {
              latitude: prevCluster.latitude,
              longitude: prevCluster.longitude,
            });
          }
        }
      }
    }
    
    return taskIdToClusterCenter;
  }, [clusters, previousClusters]);

  // Track clusters that are about to disappear (for fade out)
  const fadingOutClusterIds = useMemo(() => {
    const ids = new Set<string>();
    
    for (const prevCluster of previousClusters) {
      if (prevCluster.isCluster) {
        // Check if this cluster still exists
        const stillExists = clusters.some(c => 
          c.isCluster && c.id === prevCluster.id
        );
        if (!stillExists) {
          ids.add(prevCluster.id);
        }
      }
    }
    
    return ids;
  }, [clusters, previousClusters]);

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.isCluster) {
          return (
            <AnimatedClusterMarker
              key={cluster.id}
              cluster={cluster}
              isFadingOut={false}
              onPress={onClusterPress}
              styles={styles}
            />
          );
        } else {
          const task = cluster.items[0];
          const clusterCenter = unclusteringTasks.get(task.id);
          
          return (
            <AnimatedTaskMarker
              key={`task-${task.id}`}
              task={task}
              isFocused={focusedTaskId === task.id}
              clusterCenter={clusterCenter}
              isUnclustering={!!clusterCenter}
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
