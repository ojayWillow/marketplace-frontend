import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Surface, Chip } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, uploadImageFromUri, useAuthStore } from '@marketplace/shared';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from '../../components/ImagePicker';
import LocationPicker from '../../components/LocationPicker';
import { haptic } from '../../utils/haptics';
import { useThemeStore } from '../../src/stores/themeStore';
import { useLanguageStore } from '../../src/stores/languageStore';
import { useCategories } from '../../src/hooks/useCategories';
import { colors } from '../../src/theme';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export default function CreateTaskScreen() {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const { getActiveTheme } = useThemeStore();
  const { t } = useLanguageStore();
  const { formCategories, getCategoryByKey } = useCategories();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('other');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const selectedCategoryData = getCategoryByKey(category);

  const createMutation = useMutation({
    mutationFn: async (data: Parameters<typeof createTask>[0]) => {
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
      
      return createTask({
        ...data,
        images: imageUrls.length > 0 ? imageUrls.join(',') : undefined,
      });
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-map'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-home'] });
      Alert.alert(
        t('task.create.successTitle'),
        t('task.create.successMessage'),
        [
          {
            text: t('task.create.viewTask'),
            onPress: () => router.replace(`/task/${task.id}`),
          },
          {
            text: t('common.ok'),
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      console.error('Create task error:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.error || error.response?.data?.message || error.message || t('task.create.errorCreateFailed');
      Alert.alert(t('task.create.errorTitle'), message);
    },
  });

  const handleCategorySelect = (categoryKey: string) => {
    haptic.selection();
    setCategory(categoryKey);
    setShowCategoryModal(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert(t('task.create.errorRequired'), t('task.create.errorTitleRequired'));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('task.create.errorRequired'), t('task.create.errorDescriptionRequired'));
      return;
    }
    if (!budget.trim() || isNaN(parseFloat(budget))) {
      Alert.alert(t('task.create.errorRequired'), t('task.create.errorBudgetRequired'));
      return;
    }
    if (!location) {
      Alert.alert(t('task.create.errorRequired'), t('task.create.errorLocationRequired'));
      return;
    }
    if (!user?.id) {
      Alert.alert(t('task.create.errorTitle'), t('task.create.errorUserNotFound'));
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      budget: parseFloat(budget),
      category,
      difficulty,
      location: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      deadline: deadline?.toISOString(),
      is_urgent: isUrgent,
      creator_id: user.id,
    });
  };

  const isLoading = createMutation.isPending || uploading;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundSecondary,
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
    notAuthTitle: {
      fontWeight: '600',
      marginBottom: 8,
      color: themeColors.text,
    },
    notAuthText: {
      color: themeColors.textSecondary,
      marginBottom: 24,
      textAlign: 'center',
    },
    signInButton: {
      minWidth: 120,
      backgroundColor: themeColors.primaryAccent,
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
    sectionHint: {
      fontSize: 13,
      color: themeColors.textSecondary,
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
    budgetRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    euroSign: {
      fontSize: 20,
      fontWeight: 'bold',
      color: themeColors.text,
      marginRight: 8,
    },
    budgetInput: {
      flex: 1,
      backgroundColor: themeColors.inputBackground,
      borderRadius: 8,
      fontSize: 16,
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
    difficultyRow: {
      flexDirection: 'row',
      gap: 8,
    },
    difficultyOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 2,
      backgroundColor: themeColors.inputBackground,
    },
    difficultyOptionActive: {
      backgroundColor: themeColors.card,
    },
    difficultyDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    difficultyLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: themeColors.textSecondary,
    },
    difficultyLabelActive: {
      color: themeColors.text,
    },
    dateButton: {
      alignSelf: 'flex-start',
    },
    urgentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    urgentInfo: {
      flex: 1,
    },
    urgentHint: {
      color: themeColors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    bottomSpacer: {
      height: 100,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: themeColors.card,
      padding: 16,
      paddingBottom: 32,
    },
    submitButton: {
      borderRadius: 12,
      backgroundColor: themeColors.primaryAccent,
    },
    submitButtonContent: {
      paddingVertical: 8,
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
      backgroundColor: activeTheme === 'dark' ? themeColors.elevated : '#e0f2fe',
      borderColor: themeColors.primaryAccent,
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
      color: themeColors.primaryAccent,
      fontWeight: '700',
    },
    categoryPillCheck: {
      fontSize: 14,
      color: themeColors.primaryAccent,
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
            title: t('task.create.title'),
            headerStyle: { backgroundColor: themeColors.card },
            headerTintColor: themeColors.primaryAccent,
            headerTitleStyle: { color: themeColors.text },
          }} 
        />
        <View style={styles.centerContainer}>
          <Text variant="headlineSmall" style={styles.notAuthTitle}>{t('task.create.signInRequired')}</Text>
          <Text style={styles.notAuthText}>{t('task.create.signInText')}</Text>
          <Button mode="contained" onPress={() => router.push('/(auth)/login')} style={styles.signInButton}>
            {t('task.create.signInButton')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('task.create.title'),
          headerBackTitle: t('task.create.cancel'),
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.primaryAccent,
          headerTitleStyle: { color: themeColors.text },
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>{t('task.create.taskTitleLabel')}</Text>
              <TextInput
                mode="flat"
                placeholder={t('task.create.taskTitlePlaceholder')}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                style={styles.flatInput}
                textColor={themeColors.text}
                placeholderTextColor={themeColors.textMuted}
              />
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>{t('task.create.descriptionLabel')}</Text>
              <TextInput
                mode="flat"
                placeholder={t('task.create.descriptionPlaceholder')}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                maxLength={1000}
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
                label={t('task.create.photosLabel')}
              />
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>{t('task.create.categoryLabel')}</Text>
              <TouchableOpacity 
                style={styles.categorySelector}
                onPress={() => { haptic.light(); setShowCategoryModal(true); }}
                activeOpacity={0.7}
              >
                <Text style={styles.categorySelectorIcon}>{selectedCategoryData?.icon || '📋'}</Text>
                <Text style={styles.categorySelectorText}>{selectedCategoryData?.label || t('task.create.selectCategory')}</Text>
                <Text style={styles.categorySelectorArrow}>›</Text>
              </TouchableOpacity>
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>{t('task.create.budgetLabel')}</Text>
              <View style={styles.budgetRow}>
                <Text style={styles.euroSign}>€</Text>
                <TextInput
                  mode="flat"
                  placeholder={t('task.create.budgetPlaceholder')}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="decimal-pad"
                  style={styles.budgetInput}
                  textColor={themeColors.text}
                  placeholderTextColor={themeColors.textMuted}
                />
              </View>
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>{t('task.create.difficultyLabel')}</Text>
              <Text style={styles.sectionHint}>{t('task.create.difficultyHint')}</Text>
              <View style={styles.difficultyRow}>
                <TouchableOpacity
                  style={[
                    styles.difficultyOption,
                    difficulty === 'easy' && styles.difficultyOptionActive,
                    { borderColor: '#10b981' }
                  ]}
                  onPress={() => { haptic.selection(); setDifficulty('easy'); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.difficultyDot, { backgroundColor: '#10b981' }]} />
                  <Text style={[
                    styles.difficultyLabel,
                    difficulty === 'easy' && styles.difficultyLabelActive
                  ]}>{t('task.create.easy')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.difficultyOption,
                    difficulty === 'medium' && styles.difficultyOptionActive,
                    { borderColor: '#f59e0b' }
                  ]}
                  onPress={() => { haptic.selection(); setDifficulty('medium'); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.difficultyDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={[
                    styles.difficultyLabel,
                    difficulty === 'medium' && styles.difficultyLabelActive
                  ]}>{t('task.create.medium')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.difficultyOption,
                    difficulty === 'hard' && styles.difficultyOptionActive,
                    { borderColor: '#ef4444' }
                  ]}
                  onPress={() => { haptic.selection(); setDifficulty('hard'); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.difficultyDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={[
                    styles.difficultyLabel,
                    difficulty === 'hard' && styles.difficultyLabelActive
                  ]}>{t('task.create.hard')}</Text>
                </TouchableOpacity>
              </View>
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <LocationPicker
                initialLocation={location || undefined}
                onLocationSelect={setLocation}
                label={t('task.create.locationLabel')}
              />
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>{t('task.create.deadlineLabel')}</Text>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                icon="calendar"
                style={styles.dateButton}
                textColor={themeColors.text}
              >
                {deadline ? deadline.toLocaleDateString() : t('task.create.selectDeadline')}
              </Button>
              {deadline && (
                <Button
                  mode="text"
                  onPress={() => setDeadline(null)}
                  textColor="#ef4444"
                  compact
                >
                  {t('task.create.clearDeadline')}
                </Button>
              )}
              {showDatePicker && (
                <DateTimePicker
                  value={deadline || new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setDeadline(date);
                  }}
                />
              )}
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <View style={styles.urgentRow}>
                <View style={styles.urgentInfo}>
                  <Text variant="titleMedium" style={{ color: themeColors.text }}>{t('task.create.markAsUrgent')}</Text>
                  <Text style={styles.urgentHint}>{t('task.create.urgentHint')}</Text>
                </View>
                <Chip
                  selected={isUrgent}
                  onPress={() => setIsUrgent(!isUrgent)}
                  mode={isUrgent ? 'flat' : 'outlined'}
                  selectedColor={themeColors.primaryAccent}
                >
                  {isUrgent ? t('common.yes') : t('common.no')}
                </Chip>
              </View>
            </Surface>

            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>

        <Surface style={styles.bottomBar} elevation={4}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            buttonColor={themeColors.primaryAccent}
            textColor="#ffffff"
          >
            {uploading ? t('task.create.uploadingImages') : t('task.create.createButton')}
          </Button>
        </Surface>
      </KeyboardAvoidingView>

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
            <Text style={styles.modalTitle}>{t('task.create.selectCategory')}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.categoryWrap}>
                {formCategories.map((cat) => (
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
