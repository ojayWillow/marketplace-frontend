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
  const [geocodeError, setGeocodeError] = useState(false);
  const [hasValidLocation, setHasValidLocation] = useState(!!initialLocation);

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
      setGeocodeError(false);
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
        addr.streetNumber,
        addr.city,
        addr.region,
        addr.country,
      ].filter(Boolean).join(', ');

      setMarker(coords);
      setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setAddress(formattedAddress);
      setSearchQuery('');
      setHasValidLocation(true);
      
      onLocationSelect({
        address: formattedAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
      setGeocodeError(true);
    } finally {
      setLoading(false);
    }
  };

  // Search for address with validation
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Required', 'Please enter an address to search');
      return;
    }
    
    try {
      setLoading(true);
      setGeocodeError(false);
      
      const results = await Location.geocodeAsync(searchQuery);
      
      if (results.length === 0) {
        Alert.alert(
          'Invalid Address', 
          'Could not find this address. Please enter a valid street address with number.'
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

      // Reverse geocode to validate and format address properly
      let formattedAddress = searchQuery;
      try {
        const addresses = await Location.reverseGeocodeAsync(coords);
        const addr = addresses[0];
        
        // Check if address has street number (indicates specific location)
        if (!addr.streetNumber && !addr.street) {
          Alert.alert(
            'Address Too Vague',
            'Please provide a more specific address with street name and number.'
          );
          setGeocodeError(true);
          setHasValidLocation(false);
          return;
        }
        
        formattedAddress = [
          addr.street,
          addr.streetNumber,
          addr.city,
          addr.region,
          addr.country,
        ].filter(Boolean).join(', ');
      } catch (err) {
        // If reverse geocode fails, use search query
        console.warn('Reverse geocode failed:', err);
      }

      setMarker(coords);
      setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setAddress(formattedAddress);
      setSearchQuery('');
      setHasValidLocation(true);
      
      onLocationSelect({
        address: formattedAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      Alert.alert(
        'Geocoding Failed', 
        'Could not find this address. Please check spelling and try again, or tap on the map to select location manually.'
      );
      setGeocodeError(true);
      setHasValidLocation(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle map tap to set marker
  const handleMapPress = async (event: any) => {
    const coords = event.nativeEvent.coordinate;
    setMarker(coords);
    setGeocodeError(false);
    
    try {
      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync(coords);
      const addr = addresses[0];
      const formattedAddress = [
        addr.street,
        addr.streetNumber,
        addr.city,
        addr.region,
        addr.country,
      ].filter(Boolean).join(', ');
      
      setAddress(formattedAddress);
      setSearchQuery('');
      setHasValidLocation(true);
      
      onLocationSelect({
        address: formattedAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      // If reverse geocoding fails, still use the coordinates
      const fallbackAddress = `Location (${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)})`;
      setAddress(fallbackAddress);
      setHasValidLocation(true);
      
      onLocationSelect({
        address: fallbackAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      
      {/* Address Search */}
      <Surface style={styles.searchContainer} elevation={1}>
        <TextInput
          mode="outlined"
          placeholder="Enter street address (e.g., Brīvības iela 123, Rīga)"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setGeocodeError(false);
          }}
          onSubmitEditing={handleSearchAddress}
          error={geocodeError}
          right={<TextInput.Icon icon="magnify" onPress={handleSearchAddress} />}
          style={styles.searchInput}
        />
        {geocodeError && (
          <Text style={styles.errorText}>
            ⚠️ Please enter a valid address or select location on map
          </Text>
        )}
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
                pinColor={hasValidLocation ? '#0ea5e9' : '#f59e0b'}
              />
            )}
          </MapView>
        )}
      </Surface>

      {/* Selected Address Display */}
      {address && hasValidLocation ? (
        <Surface style={styles.addressDisplay} elevation={1}>
          <View style={styles.addressHeader}>
            <Text style={styles.checkmark}>✓</Text>
            <Text variant="bodySmall" style={styles.addressLabel}>Selected Address:</Text>
          </View>
          <Text variant="bodyMedium" style={styles.addressText}>{address}</Text>
        </Surface>
      ) : (
        <View style={styles.hintContainer}>
          <Text style={styles.hint}>📍 Tap on the map or search for an address</Text>
          <Text style={styles.subHint}>Address with street number required</Text>
        </View>
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
  required: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  searchInput: {
    marginBottom: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 8,
    marginTop: -4,
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
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  checkmark: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressLabel: {
    color: '#166534',
  },
  addressText: {
    color: '#1f2937',
    fontWeight: '500',
  },
  hintContainer: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  hint: {
    color: '#854d0e',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  subHint: {
    color: '#a16207',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
