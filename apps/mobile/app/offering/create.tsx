import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Surface, SegmentedButtons } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createOffering, uploadImageFromUri, useAuthStore } from '@marketplace/shared';
import ImagePicker from '../../components/ImagePicker';
import LocationPicker from '../../components/LocationPicker';

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

export default function CreateOfferingScreen() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

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

  const createMutation = useMutation({
    mutationFn: async () => {
      // Upload images first if any
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploading(true);
        try {
          const uploadPromises = images.map((uri) => uploadImageFromUri(uri));
          const results = await Promise.all(uploadPromises);
          imageUrls = results.map(r => r.url);
        } catch (error) {
          console.error('Image upload error:', error);
          // Continue without images if upload fails
        } finally {
          setUploading(false);
        }
      }

      if (!location) {
        throw new Error('Location is required');
      }

      return createOffering({
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
    onSuccess: (offering) => {
      queryClient.invalidateQueries({ queryKey: ['offerings'] });
      queryClient.invalidateQueries({ queryKey: ['offerings-map'] });
      Alert.alert(
        'Service Created!',
        'Your service has been listed.',
        [{ text: 'View', onPress: () => router.replace(`/offering/${offering.id}`) }]
      );
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || 'Failed to create service.';
      Alert.alert('Error', message);
    },
  });

  const handleSubmit = () => {
    // Validation
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

    createMutation.mutate();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Offer a Service' }} />
        <View style={styles.authPrompt}>
          <Text style={styles.authIcon}>🔒</Text>
          <Text variant="titleLarge" style={styles.authTitle}>Sign In Required</Text>
          <Text style={styles.authText}>You need to sign in to offer services.</Text>
          <Button mode="contained" onPress={() => router.push('/(auth)/login')} style={styles.authButton}>
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = createMutation.isPending || uploading;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Offer a Service',
          headerBackTitle: 'Cancel',
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title */}
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Service Title *</Text>
            <TextInput
              mode="outlined"
              placeholder="e.g., Professional House Cleaning"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              outlineStyle={styles.inputOutline}
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
              mode="outlined"
              placeholder="Describe your service, what's included, your experience..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              style={styles.textArea}
              outlineStyle={styles.inputOutline}
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
                mode="outlined"
                placeholder={priceType === 'negotiable' ? 'Starting from (optional)' : 'Enter price'}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                style={styles.priceInput}
                outlineStyle={styles.inputOutline}
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
              mode="outlined"
              placeholder="e.g., Weekdays 9-18, Weekends by appointment"
              value={availability}
              onChangeText={setAvailability}
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />
          </Surface>

          {/* Experience */}
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Experience</Text>
            <TextInput
              mode="outlined"
              placeholder="e.g., 5 years of experience, certified..."
              value={experience}
              onChangeText={setExperience}
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />
          </Surface>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
          >
            {uploading ? 'Uploading Images...' : 'Create Service Listing'}
          </Button>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  input: {
    backgroundColor: '#ffffff',
  },
  inputOutline: {
    borderColor: '#e5e7eb',
  },
  textArea: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
  },
  priceLabel: {
    marginLeft: 8,
    color: '#6b7280',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#f97316',
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  bottomSpacer: {
    height: 40,
  },
  // Auth prompt styles
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  authTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  authText: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    minWidth: 150,
  },
});
