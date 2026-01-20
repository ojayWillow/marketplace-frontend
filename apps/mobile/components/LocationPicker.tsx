import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, Surface, ActivityIndicator } from 'react-native-paper';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  initialLocation?: LocationData;
  onLocationSelect: (location: LocationData) => void;
  label?: string;
}

export default function LocationPicker({
  initialLocation,
  onLocationSelect,
  label = 'Location',
}: LocationPickerProps) {
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 56.9496, // Default to Riga
    longitude: initialLocation?.longitude || 24.1052,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(
    initialLocation ? { latitude: initialLocation.latitude, longitude: initialLocation.longitude } : null
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Request location permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
      }
    })();
  }, []);

  // Get user's current location
  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permission.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync(coords);
      const addr = addresses[0];
      const formattedAddress = [
        addr.street,
        addr.city,
        addr.region,
        addr.country,
      ].filter(Boolean).join(', ');

      setMarker(coords);
      setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setAddress(formattedAddress);
      
      onLocationSelect({
        address: formattedAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
    } finally {
      setLoading(false);
    }
  };

  // Search for address
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const results = await Location.geocodeAsync(searchQuery);
      
      if (results.length === 0) {
        Alert.alert('Not Found', 'No results found for this address');
        return;
      }

      const result = results[0];
      const coords = {
        latitude: result.latitude,
        longitude: result.longitude,
      };

      setMarker(coords);
      setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setAddress(searchQuery);
      
      onLocationSelect({
        address: searchQuery,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not find this address');
    } finally {
      setLoading(false);
    }
  };

  // Handle map tap to set marker
  const handleMapPress = async (event: any) => {
    const coords = event.nativeEvent.coordinate;
    setMarker(coords);
    
    try {
      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync(coords);
      const addr = addresses[0];
      const formattedAddress = [
        addr.street,
        addr.city,
        addr.region,
        addr.country,
      ].filter(Boolean).join(', ');
      
      setAddress(formattedAddress);
      onLocationSelect({
        address: formattedAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      // If reverse geocoding fails, still use the coordinates
      onLocationSelect({
        address: address || 'Selected location',
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>{label}</Text>
      
      {/* Address Search */}
      <Surface style={styles.searchContainer} elevation={1}>
        <TextInput
          mode="outlined"
          placeholder="Search for an address..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchAddress}
          right={<TextInput.Icon icon="magnify" onPress={handleSearchAddress} />}
          style={styles.searchInput}
        />
        <Button
          mode="outlined"
          onPress={handleUseCurrentLocation}
          icon="crosshairs-gps"
          loading={loading}
          disabled={loading}
          style={styles.currentLocationBtn}
        >
          Use Current Location
        </Button>
      </Surface>

      {/* Map */}
      <Surface style={styles.mapContainer} elevation={2}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Getting location...</Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            region={region}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton
          >
            {marker && (
              <Marker
                coordinate={marker}
                title="Selected Location"
                description={address}
              />
            )}
          </MapView>
        )}
      </Surface>

      {/* Selected Address Display */}
      {address ? (
        <Surface style={styles.addressDisplay} elevation={1}>
          <Text variant="bodySmall" style={styles.addressLabel}>Selected Address:</Text>
          <Text variant="bodyMedium" style={styles.addressText}>{address}</Text>
        </Surface>
      ) : (
        <Text style={styles.hint}>Tap on the map or search for an address to select a location</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  searchInput: {
    marginBottom: 8,
  },
  currentLocationBtn: {
    borderColor: '#0ea5e9',
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  addressDisplay: {
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  addressLabel: {
    color: '#0369a1',
    marginBottom: 4,
  },
  addressText: {
    color: '#1f2937',
    fontWeight: '500',
  },
  hint: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
