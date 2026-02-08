import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, Button, TextInput, Surface, ActivityIndicator } from 'react-native-paper';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useThemeStore } from '../src/stores/themeStore';
import { useLanguageStore } from '../src/stores/languageStore';
import { colors, type ThemeColors } from '../src/theme';
import { darkMapStyle, lightMapStyle } from '../src/theme/mapStyles';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  initialLocation?: LocationData;
  onLocationSelect: (location: LocationData) => void;
  label?: string;
  themeColors?: ThemeColors;
  autoDetect?: boolean;
}

// Helper: format address parts into a single string
const formatAddress = (addr: Location.LocationGeocodedAddress): string => {
  return [
    addr.street,
    addr.streetNumber,
    addr.city,
    addr.region,
    addr.country,
  ].filter(Boolean).join(', ');
};

export default function LocationPicker({
  initialLocation,
  onLocationSelect,
  label,
  themeColors: themeColorsProp,
  autoDetect = false,
}: LocationPickerProps) {
  const { getActiveTheme } = useThemeStore();
  const { t } = useLanguageStore();
  const activeTheme = getActiveTheme();
  const tc = themeColorsProp || colors[activeTheme];
  const isDark = activeTheme === 'dark';

  const mapRef = useRef<MapView>(null);

  const [address, setAddress] = useState(initialLocation?.address || '');
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 56.9496,
    longitude: initialLocation?.longitude || 24.1052,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(
    initialLocation ? { latitude: initialLocation.latitude, longitude: initialLocation.longitude } : null
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [geocodeError, setGeocodeError] = useState(false);
  const [hasValidLocation, setHasValidLocation] = useState(!!initialLocation);

  const displayLabel = label || t('locationPicker.label');
  const isWeb = Platform.OS === 'web';
  const mapHeight = isWeb ? 400 : 300;

  // Request permission + optional auto-detect on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('locationPicker.permissionDeniedTitle'),
          t('locationPicker.permissionDeniedMessage')
        );
        return;
      }

      // Auto-detect user location if enabled and no initial location
      if (autoDetect && !initialLocation) {
        try {
          setLoading(true);
          const location = await Location.getCurrentPositionAsync({});
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          const addresses = await Location.reverseGeocodeAsync(coords);
          const addr = addresses[0];
          const formattedAddress = formatAddress(addr);

          setMarker(coords);
          setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
          setAddress(formattedAddress);
          setSearchQuery(formattedAddress);
          setHasValidLocation(true);

          onLocationSelect({
            address: formattedAddress,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        } catch (error) {
          // Silent fail for auto-detect — user can still manually pick
          console.warn('Auto-detect location failed:', error);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, []);

  // Get user's current location
  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      setGeocodeError(false);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('locationPicker.permissionDeniedTitle'),
          t('locationPicker.permissionEnableMessage')
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const addresses = await Location.reverseGeocodeAsync(coords);
      const addr = addresses[0];
      const formattedAddress = formatAddress(addr);

      setMarker(coords);
      setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setAddress(formattedAddress);
      setSearchQuery(formattedAddress);
      setHasValidLocation(true);

      onLocationSelect({
        address: formattedAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('locationPicker.errorCurrentLocation'));
      setGeocodeError(true);
    } finally {
      setLoading(false);
    }
  };

  // Search for address with validation
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      Alert.alert(t('locationPicker.requiredTitle'), t('locationPicker.enterAddressPrompt'));
      return;
    }

    try {
      setLoading(true);
      setGeocodeError(false);

      const results = await Location.geocodeAsync(searchQuery);

      if (results.length === 0) {
        Alert.alert(
          t('locationPicker.invalidAddressTitle'),
          t('locationPicker.invalidAddressMessage')
        );
        setGeocodeError(true);
        setHasValidLocation(false);
        return;
      }

      const result = results[0];
      const coords = {
        latitude: result.latitude,
        longitude: result.longitude,
      };

      let formattedAddress = searchQuery;
      try {
        const addresses = await Location.reverseGeocodeAsync(coords);
        const addr = addresses[0];

        if (!addr.streetNumber && !addr.street) {
          Alert.alert(
            t('locationPicker.vagueAddressTitle'),
            t('locationPicker.vagueAddressMessage')
          );
          setGeocodeError(true);
          setHasValidLocation(false);
          return;
        }

        formattedAddress = formatAddress(addr);
      } catch (err) {
        console.warn('Reverse geocode failed:', err);
      }

      setMarker(coords);
      setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setAddress(formattedAddress);
      setSearchQuery(formattedAddress);
      setHasValidLocation(true);

      onLocationSelect({
        address: formattedAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      Alert.alert(
        t('locationPicker.geocodeFailedTitle'),
        t('locationPicker.geocodeFailedMessage')
      );
      setGeocodeError(true);
      setHasValidLocation(false);
    } finally {
      setLoading(false);
    }
  };

  // Shared handler for updating location from coordinates (map tap or marker drag)
  const handleCoordsUpdate = async (coords: { latitude: number; longitude: number }) => {
    setMarker(coords);
    setGeocodeError(false);

    try {
      const addresses = await Location.reverseGeocodeAsync(coords);
      const addr = addresses[0];
      const formattedAddress = formatAddress(addr);

      setAddress(formattedAddress);
      setSearchQuery(formattedAddress);
      setHasValidLocation(true);

      onLocationSelect({
        address: formattedAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      const fallbackAddress = `${t('locationPicker.label')} (${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)})`;
      setAddress(fallbackAddress);
      setSearchQuery(fallbackAddress);
      setHasValidLocation(true);

      onLocationSelect({
        address: fallbackAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    }
  };

  // Handle map tap to set marker
  const handleMapPress = async (event: any) => {
    const coords = event.nativeEvent.coordinate;
    await handleCoordsUpdate(coords);
  };

  // Handle marker drag end
  const handleMarkerDragEnd = async (event: any) => {
    const coords = event.nativeEvent.coordinate;
    await handleCoordsUpdate(coords);
  };

  const styles = StyleSheet.create({
    container: {
      gap: 12,
    },
    label: {
      fontWeight: '600',
      color: tc.text,
      marginBottom: 4,
    },
    required: {
      color: tc.error,
      fontWeight: 'bold',
    },
    searchContainer: {
      padding: 12,
      backgroundColor: tc.card,
      borderRadius: 8,
    },
    searchInput: {
      marginBottom: 8,
      backgroundColor: tc.inputBackground,
    },
    errorText: {
      color: tc.error,
      fontSize: 13,
      marginBottom: 8,
      marginTop: -4,
    },
    currentLocationBtn: {
      borderColor: tc.primaryAccent,
    },
    mapContainer: {
      height: mapHeight,
      borderRadius: 8,
      backgroundColor: tc.card,
      overflow: 'hidden',
    },
    mapContent: {
      flex: 1,
      overflow: 'hidden',
      borderRadius: 8,
    },
    map: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: tc.backgroundSecondary,
    },
    loadingText: {
      marginTop: 12,
      color: tc.textSecondary,
    },
    addressDisplay: {
      padding: 12,
      backgroundColor: isDark ? tc.card : '#f0fdf4',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? tc.success : '#86efac',
    },
    addressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 4,
    },
    checkmark: {
      color: tc.success,
      fontSize: 16,
      fontWeight: 'bold',
    },
    addressLabel: {
      color: isDark ? tc.success : '#166534',
    },
    addressText: {
      color: tc.text,
      fontWeight: '500',
    },
    hintContainer: {
      alignItems: 'center',
      padding: 12,
      backgroundColor: isDark ? tc.card : '#fef3c7',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? tc.warning : '#fde047',
    },
    hint: {
      color: isDark ? tc.warning : '#854d0e',
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    subHint: {
      color: isDark ? tc.textSecondary : '#a16207',
      fontSize: 12,
      textAlign: 'center',
      marginTop: 4,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        {displayLabel} <Text style={styles.required}>*</Text>
      </Text>

      {/* Address Search */}
      <Surface style={styles.searchContainer} elevation={1}>
        <TextInput
          mode="outlined"
          placeholder={t('locationPicker.searchPlaceholder')}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setGeocodeError(false);
          }}
          onSubmitEditing={handleSearchAddress}
          error={geocodeError}
          right={<TextInput.Icon icon="magnify" onPress={handleSearchAddress} />}
          style={styles.searchInput}
          textColor={tc.text}
          placeholderTextColor={tc.textMuted}
          outlineColor={tc.border}
          activeOutlineColor={tc.primaryAccent}
        />
        {geocodeError && (
          <Text style={styles.errorText}>
            ⚠️ {t('locationPicker.errorValidAddress')}
          </Text>
        )}
        <Button
          mode="outlined"
          onPress={handleUseCurrentLocation}
          icon="crosshairs-gps"
          loading={loading}
          disabled={loading}
          style={styles.currentLocationBtn}
          textColor={tc.primaryAccent}
        >
          {t('locationPicker.useCurrentLocation')}
        </Button>
      </Surface>

      {/* Map */}
      <Surface style={styles.mapContainer} elevation={2}>
        <View style={styles.mapContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tc.primaryAccent} />
              <Text style={styles.loadingText}>{t('locationPicker.gettingLocation')}</Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              region={region}
              onPress={handleMapPress}
              showsUserLocation
              showsMyLocationButton
              customMapStyle={isDark ? darkMapStyle : lightMapStyle}
            >
              {marker && (
                <Marker
                  coordinate={marker}
                  title={t('locationPicker.selectedLocation')}
                  description={address}
                  pinColor={hasValidLocation ? tc.primaryAccent : tc.warning}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                />
              )}
            </MapView>
          )}
        </View>
      </Surface>

      {/* Selected Address Display */}
      {address && hasValidLocation ? (
        <Surface style={styles.addressDisplay} elevation={1}>
          <View style={styles.addressHeader}>
            <Text style={styles.checkmark}>✓</Text>
            <Text variant="bodySmall" style={styles.addressLabel}>
              {t('locationPicker.selectedAddress')}
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.addressText}>{address}</Text>
        </Surface>
      ) : (
        <View style={styles.hintContainer}>
          <Text style={styles.hint}>📍 {t('locationPicker.tapOrSearchHint')}</Text>
          <Text style={styles.subHint}>{t('locationPicker.addressRequiredHint')}</Text>
        </View>
      )}
    </View>
  );
}
