import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import type { ZoomLevel } from '../utils/constants';
import { styles } from '../styles';

interface UserMarkerProps {
  latitude: number;
  longitude: number;
  zoomLevel: ZoomLevel;
}

export const UserMarker: React.FC<UserMarkerProps> = ({ latitude, longitude, zoomLevel }) => {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      {zoomLevel === 'close' ? (
        // Full user marker with halo (zoomed in)
        <View style={styles.userMarkerFull}>
          <View style={styles.userMarkerHalo} />
          <View style={styles.userMarkerDot} />
        </View>
      ) : zoomLevel === 'mid' ? (
        // Subtle ring marker (mid zoom)
        <View style={styles.userMarkerSubtle}>
          <View style={styles.userMarkerRing} />
        </View>
      ) : (
        // Small dot marker (far zoom) - still visible but compact
        <View style={styles.userMarkerFar}>
          <View style={styles.userMarkerSmallDot} />
        </View>
      )}
    </Marker>
  );
};
