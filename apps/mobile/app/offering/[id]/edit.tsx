import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Surface, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getOffering, updateOffering, uploadImageFromUri, useAuthStore } from '@marketplace/shared';
import ImagePicker from '../../../components/ImagePicker';
import LocationPicker from '../../../components/LocationPicker';

const CATEGORIES = [
  { value: 'cleaning', label: '🧹 Cleaning' },
  { value: 'repair', label: '🔧 Repair' },
  { value: 'delivery', label: '🚚 Delivery' },
  { value: 'tutoring', label: '📚 Tutoring' },
  { value: 'beauty', label: '💇 Beauty' },
  { value: 'tech', label: '💻 Tech' },
  { value: 'gardening', label: '🌱 Gardening' },
  { value: 'moving', label: '📦 Moving' },
  { value: 'pet_care', label: '🐾 Pet Care' },
  { value: 'other', label: '💼 Other' },
];

const PRICE_TYPES = [
  { value: 'hourly', label: 'Per Hour' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'negotiable', label: 'Negotiable' },
];

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export default function EditOfferingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const offeringId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: offering, isLoading: loadingOffering } = useQuery({
    queryKey: ['offering', offeringId],
    queryFn: () => getOffering(offeringId),
    enabled: offeringId > 0,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'hourly' | 'fixed' | 'negotiable'>('hourly');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [availability, setAvailability] = useState('');
  const [experience, setExperience] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Initialize form with offering data
  useEffect(() => {
    if (offering) {
      setTitle(offering.title || '');
      setDescription(offering.description || '');
      setCategory(offering.category || 'other');
      setPrice(offering.price?.toString() || '');
      setPriceType(offering.price_type || 'hourly');
      if (offering.location && offering.latitude && offering.longitude) {
        setLocation({
          address: offering.location,
          latitude: offering.latitude,
          longitude: offering.longitude,
        });
      }
      setAvailability(offering.availability || '');
      setExperience(offering.experience || '');
      if (offering.images) {
        setImages(offering.images.split(',').filter(Boolean));
      }
    }
  }, [offering]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      // Upload new images if any local URIs
      let imageUrls: string[] = images.filter(img => img.startsWith('http'));
      const localImages = images.filter(img => !img.startsWith('http'));
      
      if (localImages.length > 0) {
        setUploading(true);
        try {
          const uploadPromises = localImages.map((uri) => uploadImageFromUri(uri));
          const results = await Promise.all(uploadPromises);
          imageUrls = [...imageUrls, ...results.map(r => r.url)];
        } catch (error) {
          console.error('Image upload error:', error);
        } finally {
          setUploading(false);
        }
      }

      if (!location) {
        throw new Error('Location is required');
      }

      return updateOffering(offeringId, {
        title,
        description,
        category,
        price: price ? parseFloat(price) : undefined,
        price_type: priceType,
        location: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        availability: availability || undefined,
        experience: experience || undefined,
        images: imageUrls.length > 0 ? imageUrls.join(',') : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offering', offeringId] });
      queryClient.invalidateQueries({ queryKey: ['offerings'] });
      queryClient.invalidateQueries({ queryKey: ['offerings-map'] });
      Alert.alert('Updated!', 'Your service has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || 'Failed to update service.';
      Alert.alert('Error', message);
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title for your service.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe your service.');
      return;
    }
    if (!location) {
      Alert.alert('Required', 'Please select a location for your service.');
      return;
    }

    updateMutation.mutate();
  };

  // Check authorization
  if (loadingOffering) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Edit Service' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (!offering || offering.creator_id !== user?.id) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Edit Service' }} />
        <View style={styles.centerContainer}>
          <Text variant="headlineSmall" style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>You can only edit your own services.</Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = updateMutation.isPending || uploading;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Edit Service',
          headerBackTitle: 'Cancel',
        }} 
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Title */}
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Service Title *</Text>
              <TextInput
                mode="flat"
                placeholder="e.g., Professional House Cleaning"
                value={title}
                onChangeText={setTitle}
                style={styles.flatInput}
              />
            </Surface>

            {/* Category */}
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoriesRow}>
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat.value}
                      mode={category === cat.value ? 'contained' : 'outlined'}
                      onPress={() => setCategory(cat.value)}
                      style={styles.categoryButton}
                      compact
                    >
                      {cat.label}
                    </Button>
                  ))}
                </View>
              </ScrollView>
            </Surface>

            {/* Description */}
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Description *</Text>
              <TextInput
                mode="flat"
                placeholder="Describe your service, what's included, your experience..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                style={styles.flatTextArea}
              />
            </Surface>

            {/* Images */}
            <Surface style={styles.section} elevation={0}>
              <ImagePicker
                images={images}
                onImagesChange={setImages}
                maxImages={5}
                label="Portfolio Photos"
              />
              <Text style={styles.imageHint}>Show examples of your work</Text>
            </Surface>

            {/* Price */}
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Pricing</Text>
              <SegmentedButtons
                value={priceType}
                onValueChange={(value) => setPriceType(value as 'hourly' | 'fixed' | 'negotiable')}
                buttons={PRICE_TYPES}
                style={styles.segmentedButtons}
              />
              <View style={styles.priceRow}>
                <Text style={styles.euroSign}>€</Text>
                <TextInput
                  mode="flat"
                  placeholder={priceType === 'negotiable' ? 'Starting from (optional)' : 'Enter price'}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  style={styles.priceInput}
                />
                {priceType === 'hourly' ? (
                  <Text style={styles.priceLabel}>/ hour</Text>
                ) : null}
              </View>
            </Surface>

            {/* Location */}
            <Surface style={styles.section} elevation={0}>
              <LocationPicker
                initialLocation={location || undefined}
                onLocationSelect={setLocation}
                label="Service Area *"
              />
            </Surface>

            {/* Availability */}
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Availability</Text>
              <TextInput
                mode="flat"
                placeholder="e.g., Weekdays 9-18, Weekends by appointment"
                value={availability}
                onChangeText={setAvailability}
                style={styles.flatInput}
              />
            </Surface>

            {/* Experience */}
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Experience</Text>
              <TextInput
                mode="flat"
                placeholder="e.g., 5 years of experience, certified..."
                value={experience}
                onChangeText={setExperience}
                style={styles.flatInput}
              />
            </Surface>

            {/* Spacer for button */}
            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <Surface style={styles.bottomBar} elevation={4}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
          >
            {uploading ? 'Uploading Images...' : 'Update Service'}
          </Button>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    minWidth: 120,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  flatInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    fontSize: 16,
  },
  flatTextArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    fontSize: 16,
    minHeight: 120,
  },
  categoriesRow: {
    flexDirection: 'row',
  },
  categoryButton: {
    marginRight: 8,
  },
  imageHint: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: -8,
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  euroSign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    fontSize: 16,
  },
  priceLabel: {
    marginLeft: 8,
    color: '#6b7280',
  },
  bottomSpacer: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    borderRadius: 12,
    backgroundColor: '#f97316',
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});
