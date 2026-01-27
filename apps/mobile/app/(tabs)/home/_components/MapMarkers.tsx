import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Marker } from 'react-native-maps';
import { type Task } from '@marketplace/shared';
import { getMarkerColor, JOB_COLOR, OFFERING_COLOR } from '../constants';
import { ZoomLevel } from '../utils/formatters';
import { colors } from '../../../../src/theme';

// ============================================
// USER LOCATION MARKER
// ============================================
interface UserLocationMarkerProps {
  latitude: number;
  longitude: number;
  zoomLevel: ZoomLevel;
  visible: boolean;
}

const UserLocationMarkerComponent: React.FC<UserLocationMarkerProps> = ({
  latitude,
  longitude,
  zoomLevel,
  visible,
}) => {
  if (!visible) return null;

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      {zoomLevel === 'close' ? (
        <View style={markerStyles.userMarkerFull}>
          <View style={markerStyles.userMarkerHalo} />
          <View style={markerStyles.userMarkerDot} />
        </View>
      ) : zoomLevel === 'mid' ? (
        <View style={markerStyles.userMarkerSubtle}>
          <View style={markerStyles.userMarkerRing} />
        </View>
      ) : (
        <View style={markerStyles.userMarkerFar}>
          <View style={markerStyles.userMarkerSmallDot} />
        </View>
      )}
    </Marker>
  );
};

export const UserLocationMarker = memo(UserLocationMarkerComponent, (prev, next) => {
  return (
    prev.latitude === next.latitude &&
    prev.longitude === next.longitude &&
    prev.zoomLevel === next.zoomLevel &&
    prev.visible === next.visible
  );
});

// ============================================
// CLUSTER MARKER (Coin style)
// ============================================
interface ClusterMarkerProps {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  onPress: () => void;
}

const ClusterMarkerComponent: React.FC<ClusterMarkerProps> = ({
  id,
  latitude,
  longitude,
  count,
  onPress,
}) => {
  return (
    <Marker
      key={id}
      coordinate={{ latitude, longitude }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={markerStyles.coinClusterContainer}>
        <View style={markerStyles.coinCluster}>
          <Text style={markerStyles.coinEuro}>€</Text>
        </View>
        <View style={markerStyles.coinBadge}>
          <Text style={markerStyles.coinBadgeText}>{count}</Text>
        </View>
      </View>
    </Marker>
  );
};

export const ClusterMarker = memo(ClusterMarkerComponent, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.count === next.count &&
    prev.latitude === next.latitude &&
    prev.longitude === next.longitude
  );
});

// ============================================
// PRICE MARKER (Single task)
// ============================================
interface PriceMarkerProps {
  task: Task;
  isFocused: boolean;
  onPress: () => void;
  themeColors: typeof colors.light;
}

const PriceMarkerComponent: React.FC<PriceMarkerProps> = ({
  task,
  isFocused,
  onPress,
  themeColors,
}) => {
  const categoryColor = getMarkerColor(task.category);

  const dynamicStyles = StyleSheet.create({
    priceMarker: {
      backgroundColor: themeColors.card,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: isFocused ? 3 : 2,
      borderColor: categoryColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
      transform: isFocused ? [{ scale: 1.15 }] : [],
    },
    priceText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: categoryColor,
    },
  });

  return (
    <Marker
      coordinate={{ latitude: task.latitude!, longitude: task.longitude! }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={dynamicStyles.priceMarker}>
        <Text style={dynamicStyles.priceText}>
          €{task.budget?.toFixed(0) || '0'}
        </Text>
      </View>
    </Marker>
  );
};

export const PriceMarker = memo(PriceMarkerComponent, (prev, next) => {
  return (
    prev.task.id === next.task.id &&
    prev.task.budget === next.task.budget &&
    prev.isFocused === next.isFocused
  );
});

// ============================================
// OFFERING MARKER (Boosted services)
// ============================================
interface OfferingMarkerProps {
  id: number;
  latitude: number;
  longitude: number;
  price: number | null;
  onPress: () => void;
  themeColors: typeof colors.light;
}

const OfferingMarkerComponent: React.FC<OfferingMarkerProps> = ({
  id,
  latitude,
  longitude,
  price,
  onPress,
  themeColors,
}) => {
  return (
    <Marker
      key={`offering-${id}`}
      coordinate={{ latitude, longitude }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={[markerStyles.priceMarkerBase, { backgroundColor: themeColors.card, borderColor: OFFERING_COLOR }]}>
        <Text style={markerStyles.offeringPriceText}>
          {price ? `€${price}` : '€'}
        </Text>
      </View>
    </Marker>
  );
};

export const OfferingMarker = memo(OfferingMarkerComponent, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.price === next.price &&
    prev.latitude === next.latitude &&
    prev.longitude === next.longitude
  );
});

// ============================================
// STYLES
// ============================================
const markerStyles = StyleSheet.create({
  // User location
  userMarkerFull: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  userMarkerHalo: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.2)' },
  userMarkerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 3 },
  userMarkerSubtle: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  userMarkerRing: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'transparent', borderWidth: 2, borderColor: 'rgba(59, 130, 246, 0.6)' },
  userMarkerFar: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  userMarkerSmallDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6', borderWidth: 1.5, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, elevation: 2 },
  
  // Cluster
  coinClusterContainer: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  coinCluster: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FCD34D', borderWidth: 3, borderColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', shadowColor: '#B45309', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 6 },
  coinEuro: { fontSize: 22, fontWeight: 'bold', color: '#92400E', textShadowColor: 'rgba(251, 191, 36, 0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
  coinBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#DC2626', minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, borderWidth: 2, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 4 },
  coinBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#ffffff' },
  
  // Price marker base
  priceMarkerBase: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  offeringPriceText: { fontSize: 12, fontWeight: 'bold', color: OFFERING_COLOR },
});
