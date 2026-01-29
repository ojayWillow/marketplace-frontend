/**
 * Map Marker Components
 * 
 * Simple marker components for user location and offerings.
 * Task markers and clustering are handled by react-native-map-supercluster.
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { type Offering, getCategoryByKey } from '@marketplace/shared';

interface UserLocationMarkerProps {
  userLocation: { latitude: number; longitude: number };
  hasRealLocation: boolean;
  zoomLevel: string;
  styles: any;
}

/**
 * User's current location marker - blue dot with halo
 */
export const UserLocationMarker = memo(function UserLocationMarker({
  userLocation,
  hasRealLocation,
  zoomLevel,
  styles,
}: UserLocationMarkerProps) {
  // Different styles based on zoom level
  const getMarkerStyle = () => {
    switch (zoomLevel) {
      case 'close':
        return (
          <View style={styles.userMarkerFull}>
            <View style={styles.userMarkerHalo} />
            <View style={styles.userMarkerDot} />
          </View>
        );
      case 'medium':
        return (
          <View style={styles.userMarkerSubtle}>
            <View style={styles.userMarkerRing} />
          </View>
        );
      case 'far':
      default:
        return (
          <View style={styles.userMarkerFar}>
            <View style={styles.userMarkerSmallDot} />
          </View>
        );
    }
  };

  return (
    <Marker
      coordinate={userLocation}
      tracksViewChanges={false}
      zIndex={100}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {getMarkerStyle()}
    </Marker>
  );
});

interface OfferingMarkerProps {
  offering: Offering;
  styles: any;
}

/**
 * Boosted offering marker - shows category icon and price
 */
export const OfferingMarker = memo(function OfferingMarker({
  offering,
  styles,
}: OfferingMarkerProps) {
  // Get category information
  const category = getCategoryByKey(offering.category);
  const categoryIcon = category?.icon || '💼';
  const categoryColor = category?.color || '#ec4899';

  return (
    <View style={styles.offeringMarkerContainer}>
      {/* Category Icon Badge */}
      <View style={[styles.offeringIconBadge, { backgroundColor: categoryColor }]}>
        <Text style={styles.offeringIconText}>{categoryIcon}</Text>
      </View>
      
      {/* Price Bubble */}
      <View style={[styles.offeringPriceBubble, { borderColor: categoryColor }]}>
        <Text style={[styles.offeringPriceText, { color: categoryColor }]}>
          €{offering.price?.toFixed(0) || '0'}
        </Text>
      </View>
    </View>
  );
});
