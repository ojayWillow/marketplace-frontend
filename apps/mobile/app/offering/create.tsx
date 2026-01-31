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
import { useThemeStore } from '../../src/stores/themeStore';
import { useLanguageStore } from '../../src/stores/languageStore';
import { colors } from '../../src/theme';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export default function CreateOfferingScreen() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { getActiveTheme } = useThemeStore();
  const { t } = useLanguageStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

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

  const PRICE_TYPES = [
    { value: 'hourly', label: t('offering.create.priceTypeHourly') },
    { value: 'fixed', label: t('offering.create.priceTypeFixed') },
    { value: 'negotiable', label: t('offering.create.priceTypeNegotiable') },
  ];

  const createMutation = useMutation({
    mutationFn: async () => {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploading(true);
        try {
          const uploadPromises = images.map((uri) => uploadImageFromUri(uri));
          const results = await Promise.all(uploadPromises);
          imageUrls = results.map(r => r.url);
        } catch (error) {
          console.error('Image upload error:', error);
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
        t('offering.create.successTitle'),
        t('offering.create.successMessage'),
        [{ text: t('offering.create.viewService'), onPress: () => router.replace(`/offering/${offering.id}`) }]
      );
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || t('offering.create.errorCreateFailed');
      Alert.alert(t('offering.create.errorTitle'), message);
    },
  });

  const handleCategorySelect = (categoryKey: string) => {
    haptic.selection();
    setCategory(categoryKey);
    setShowCategoryModal(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert(t('offering.create.errorRequired'), t('offering.create.errorTitleRequired'));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('offering.create.errorRequired'), t('offering.create.errorDescriptionRequired'));
      return;
    }
    if (!location) {
      Alert.alert(t('offering.create.errorRequired'), t('offering.create.errorLocationRequired'));
      return;
    }

    createMutation.mutate();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundSecondary,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    section: {
      backgroundColor: themeColors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    sectionTitle: {
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 12,
    },
    flatInput: {
      backgroundColor: themeColors.inputBackground,
      borderRadius: 8,
      fontSize: 16,
    },
    flatTextArea: {
      backgroundColor: themeColors.inputBackground,
      borderRadius: 8,
      fontSize: 16,
      minHeight: 120,
    },
    categorySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.inputBackground,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    categorySelectorIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    categorySelectorText: {
      flex: 1,
      fontSize: 16,
      color: themeColors.text,
      fontWeight: '500',
    },
    categorySelectorArrow: {
      fontSize: 24,
      color: themeColors.textMuted,
    },
    imageHint: {
      color: themeColors.textMuted,
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
      color: themeColors.text,
      marginRight: 8,
    },
    priceInput: {
      flex: 1,
      backgroundColor: themeColors.inputBackground,
      borderRadius: 8,
      fontSize: 16,
    },
    priceLabel: {
      marginLeft: 8,
      color: themeColors.textSecondary,
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
      color: themeColors.text,
      marginBottom: 8,
    },
    authText: {
      color: themeColors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    authButton: {
      minWidth: 150,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    categoryModalContent: {
      backgroundColor: themeColors.card,
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: themeColors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    categoryWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.inputBackground,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: themeColors.border,
    },
    categoryPillActive: {
      backgroundColor: activeTheme === 'dark' ? themeColors.elevated : '#fff7ed',
      borderColor: '#f97316',
    },
    categoryPillIcon: {
      fontSize: 16,
      marginRight: 6,
    },
    categoryPillLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: themeColors.text,
    },
    categoryPillLabelActive: {
      color: '#c2410c',
      fontWeight: '700',
    },
    categoryPillCheck: {
      fontSize: 14,
      color: '#f97316',
      fontWeight: 'bold',
      marginLeft: 6,
    },
  });

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            headerShown: true, 
            title: t('offering.create.title'),
            headerStyle: { backgroundColor: themeColors.card },
            headerTintColor: themeColors.primaryAccent,
            headerTitleStyle: { color: themeColors.text },
          }} 
        />
        <View style={styles.authPrompt}>
          <Text style={styles.authIcon}>🔒</Text>
          <Text variant="titleLarge" style={styles.authTitle}>{t('offering.create.signInRequired')}</Text>
          <Text style={styles.authText}>{t('offering.create.signInText')}</Text>
          <Button mode="contained" onPress={() => router.push('/(auth)/login')} style={styles.authButton}>
            {t('offering.create.signInButton')}
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
          title: t('offering.create.title'),
          headerBackTitle: t('offering.create.cancel'),
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.primaryAccent,
          headerTitleStyle: { color: themeColors.text },
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('offering.create.serviceTitleLabel')}</Text>
            <TextInput
              mode="flat"
              placeholder={t('offering.create.serviceTitlePlaceholder')}
              value={title}
              onChangeText={setTitle}
              style={styles.flatInput}
              textColor={themeColors.text}
              placeholderTextColor={themeColors.textMuted}
            />
          </Surface>

          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('offering.create.categoryLabel')}</Text>
            <TouchableOpacity 
              style={styles.categorySelector}
              onPress={() => { haptic.light(); setShowCategoryModal(true); }}
              activeOpacity={0.7}
            >
              <Text style={styles.categorySelectorIcon}>{selectedCategoryData?.icon || '💼'}</Text>
              <Text style={styles.categorySelectorText}>{selectedCategoryData?.label || t('offering.create.selectCategory')}</Text>
              <Text style={styles.categorySelectorArrow}>›</Text>
            </TouchableOpacity>
          </Surface>

          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('offering.create.descriptionLabel')}</Text>
            <TextInput
              mode="flat"
              placeholder={t('offering.create.descriptionPlaceholder')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              style={styles.flatTextArea}
              textColor={themeColors.text}
              placeholderTextColor={themeColors.textMuted}
            />
          </Surface>

          <Surface style={styles.section} elevation={0}>
            <ImagePicker
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              label={t('offering.create.photosLabel')}
            />
            <Text style={styles.imageHint}>{t('offering.create.photosHint')}</Text>
          </Surface>

          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('offering.create.pricingLabel')}</Text>
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
                placeholder={priceType === 'negotiable' ? t('offering.create.pricePlaceholderNegotiable') : t('offering.create.pricePlaceholder')}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                style={styles.priceInput}
                textColor={themeColors.text}
                placeholderTextColor={themeColors.textMuted}
              />
              {priceType === 'hourly' ? (
                <Text style={styles.priceLabel}>{t('offering.create.perHour')}</Text>
              ) : null}
            </View>
          </Surface>

          <Surface style={styles.section} elevation={0}>
            <LocationPicker
              initialLocation={location || undefined}
              onLocationSelect={setLocation}
              label={t('offering.create.locationLabel')}
            />
          </Surface>

          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('offering.create.availabilityLabel')}</Text>
            <TextInput
              mode="flat"
              placeholder={t('offering.create.availabilityPlaceholder')}
              value={availability}
              onChangeText={setAvailability}
              style={styles.flatInput}
              textColor={themeColors.text}
              placeholderTextColor={themeColors.textMuted}
            />
          </Surface>

          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('offering.create.experienceLabel')}</Text>
            <TextInput
              mode="flat"
              placeholder={t('offering.create.experiencePlaceholder')}
              value={experience}
              onChangeText={setExperience}
              style={styles.flatInput}
              textColor={themeColors.text}
              placeholderTextColor={themeColors.textMuted}
            />
          </Surface>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
          >
            {uploading ? t('offering.create.uploadingImages') : t('offering.create.createButton')}
          </Button>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

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
            <Text style={styles.modalTitle}>{t('offering.create.selectCategory')}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.categoryWrap}>
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
                    ]}>
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
