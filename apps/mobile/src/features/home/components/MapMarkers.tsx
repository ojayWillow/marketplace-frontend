import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { type Task, type Offering } from '@marketplace/shared';
import { getMarkerColor } from '../constants';

// User Location Marker
interface UserLocationMarkerProps {
  userLocation: { latitude: number; longitude: number };
  hasRealLocation: boolean;
  zoomLevel: 'far' | 'mid' | 'close';
  styles: any;
}

export const UserLocationMarker = memo(function UserLocationMarker({ 
  userLocation, 
  hasRealLocation, 
  zoomLevel, 
  styles 
}: UserLocationMarkerProps) {
  if (!hasRealLocation) return null;
  
  return (
    <Marker
      coordinate={userLocation}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      {zoomLevel === 'close' ? (
        <View style={styles.userMarkerFull}>
          <View style={styles.userMarkerHalo} />
          <View style={styles.userMarkerDot} />
        </View>
      ) : zoomLevel === 'mid' ? (
        <View style={styles.userMarkerSubtle}>
          <View style={styles.userMarkerRing} />
        </View>
      ) : (
        <View style={styles.userMarkerFar}>
          <View style={styles.userMarkerSmallDot} />
        </View>
      )}
    </Marker>
  );
});

// Cluster Marker
interface ClusterMarkerProps {
  count: number;
  styles: any;
}

export const ClusterMarker = memo(function ClusterMarker({ count, styles }: ClusterMarkerProps) {
  return (
    <View style={styles.coinClusterContainer}>
      <View style={styles.coinCluster}>
        <Text style={styles.coinEuro}>€</Text>
      </View>
      <View style={styles.coinBadge}>
        <Text style={styles.coinBadgeText}>{count}</Text>
      </View>
    </View>
  );
});

// Price Marker for individual tasks
interface PriceMarkerProps {
  task: Task;
  isFocused: boolean;
  styles: any;
}

export const PriceMarker = memo(function PriceMarker({ task, isFocused, styles }: PriceMarkerProps) {
  const markerColor = getMarkerColor(task.category);
  
  return (
    <View style={[
      styles.priceMarker,
      { borderColor: markerColor },
      isFocused && styles.priceMarkerFocused
    ]}>
      <Text style={[styles.priceMarkerText, { color: markerColor }]}>
        €{task.budget?.toFixed(0) || '0'}
      </Text>
    </View>
  );
});

// Offering Marker (for boosted offerings)
interface OfferingMarkerProps {
  offering: Offering;
  styles: any;
}

export const OfferingMarker = memo(function OfferingMarker({ offering, styles }: OfferingMarkerProps) {
  return (
    <View style={[styles.priceMarker, styles.priceMarkerOffering]}>
      <Text style={styles.priceMarkerTextOffering}>
        {offering.price ? `€${offering.price}` : '€'}
      </Text>
    </View>
  );
});
