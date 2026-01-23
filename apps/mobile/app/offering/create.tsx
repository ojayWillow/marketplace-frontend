import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Surface, SegmentedButtons } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createOffering, uploadImageFromUri, useAuthStore, FORM_CATEGORIES, getCategoryByKey } from '@marketplace/shared';
import ImagePicker from '../../components/ImagePicker';
import LocationPicker from '../../components/LocationPicker';
import { haptic } from '../../utils/haptics';

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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'hourly' | 'fixed' | 'negotiable'>('hourly');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [availability, setAvailability] = useState('');
  const [experience, setExperience] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const selectedCategoryData = getCategoryByKey(category);

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

  const handleCategorySelect = (categoryKey: string) => {
    haptic.selection();
    setCategory(categoryKey);
    setShowCategoryModal(false);
  };

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
              mode="flat"
              placeholder="e.g., Professional House Cleaning"
              value={title}
              onChangeText={setTitle}
              style={styles.flatInput}
            />
          </Surface>

          {/* Category Picker - Opens Modal */}
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Category *</Text>
            <TouchableOpacity 
              style={styles.categorySelector}
              onPress={() => { haptic.light(); setShowCategoryModal(true); }}
              activeOpacity={0.7}
            >
              <Text style={styles.categorySelectorIcon}>{selectedCategoryData?.icon || '💼'}</Text>
              <Text style={styles.categorySelectorText}>{selectedCategoryData?.label || 'Select category'}</Text>
              <Text style={styles.categorySelectorArrow}>›</Text>
            </TouchableOpacity>
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

      {/* CATEGORY MODAL - COMPACT 3 COLUMN PILL GRID */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => { haptic.soft(); setShowCategoryModal(false); }}
        >
          <View style={styles.categoryModalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.categoryGrid}>
                {FORM_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryPill,
                      category === cat.key && styles.categoryPillActive
                    ]}
                    onPress={() => handleCategorySelect(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryPillIcon}>{cat.icon}</Text>
                    <Text style={[
                      styles.categoryPillLabel,
                      category === cat.key && styles.categoryPillLabelActive
                    ]} numberOfLines={1}>
                      {cat.label}
                    </Text>
                    {category === cat.key && (
                      <Text style={styles.categoryPillCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  
  // Category Selector (Button that opens modal)
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categorySelectorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categorySelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  categorySelectorArrow: {
    fontSize: 24,
    color: '#9ca3af',
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  categoryModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // COMPACT 3 COLUMN PILL GRID
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryPill: {
    width: '31.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  categoryPillActive: {
    backgroundColor: '#fff7ed',
    borderColor: '#f97316',
  },
  categoryPillIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryPillLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  categoryPillLabelActive: {
    color: '#c2410c',
    fontWeight: '700',
  },
  categoryPillCheck: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: 'bold',
    marginLeft: 2,
  },
});
