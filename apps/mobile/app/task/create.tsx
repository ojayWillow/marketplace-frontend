import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Surface, Chip } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, uploadImageFromUri, useAuthStore, FORM_CATEGORIES, getCategoryByKey } from '@marketplace/shared';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from '../../components/ImagePicker';
import LocationPicker from '../../components/LocationPicker';
import { haptic } from '../../utils/haptics';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export default function CreateTaskScreen() {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('other');
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
        'Success!',
        'Your task has been created.',
        [
          {
            text: 'View Task',
            onPress: () => router.replace(`/task/${task.id}`),
          },
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      console.error('Create task error:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create task. Please try again.';
      Alert.alert('Error', message);
    },
  });

  const handleCategorySelect = (categoryKey: string) => {
    haptic.selection();
    setCategory(categoryKey);
    setShowCategoryModal(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title for your task.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please enter a description.');
      return;
    }
    if (!budget.trim() || isNaN(parseFloat(budget))) {
      Alert.alert('Required', 'Please enter a valid budget.');
      return;
    }
    if (!location) {
      Alert.alert('Required', 'Please select a location for your task.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      budget: parseFloat(budget),
      category,
      location: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      deadline: deadline?.toISOString(),
      is_urgent: isUrgent,
      creator_id: user.id,
    });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Create Task' }} />
        <View style={styles.centerContainer}>
          <Text variant="headlineSmall" style={styles.notAuthTitle}>Sign In Required</Text>
          <Text style={styles.notAuthText}>You need to sign in to create tasks.</Text>
          <Button mode="contained" onPress={() => router.push('/(auth)/login')} style={styles.signInButton}>
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
          title: 'Create Task',
          headerBackTitle: 'Cancel',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Task Title *</Text>
              <TextInput
                mode="flat"
                placeholder="What do you need help with?"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                style={styles.flatInput}
              />
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Description *</Text>
              <TextInput
                mode="flat"
                placeholder="Describe your task in detail..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                maxLength={1000}
                style={styles.flatTextArea}
              />
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <ImagePicker
                images={images}
                onImagesChange={setImages}
                maxImages={5}
                label="Photos (Optional)"
              />
            </Surface>

            {/* Category Picker - Opens Modal */}
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Category</Text>
              <TouchableOpacity 
                style={styles.categorySelector}
                onPress={() => { haptic.light(); setShowCategoryModal(true); }}
                activeOpacity={0.7}
              >
                <Text style={styles.categorySelectorIcon}>{selectedCategoryData?.icon || '📋'}</Text>
                <Text style={styles.categorySelectorText}>{selectedCategoryData?.label || 'Select category'}</Text>
                <Text style={styles.categorySelectorArrow}>›</Text>
              </TouchableOpacity>
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Budget *</Text>
              <View style={styles.budgetRow}>
                <Text style={styles.euroSign}>€</Text>
                <TextInput
                  mode="flat"
                  placeholder="0.00"
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="decimal-pad"
                  style={styles.budgetInput}
                />
              </View>
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <LocationPicker
                initialLocation={location || undefined}
                onLocationSelect={setLocation}
                label="Location *"
              />
            </Surface>

            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Deadline (Optional)</Text>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                icon="calendar"
                style={styles.dateButton}
              >
                {deadline ? deadline.toLocaleDateString() : 'Select deadline'}
              </Button>
              {deadline && (
                <Button
                  mode="text"
                  onPress={() => setDeadline(null)}
                  textColor="#ef4444"
                  compact
                >
                  Clear deadline
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
                  <Text variant="titleMedium">🔥 Mark as Urgent</Text>
                  <Text style={styles.urgentHint}>Urgent tasks get more visibility</Text>
                </View>
                <Chip
                  selected={isUrgent}
                  onPress={() => setIsUrgent(!isUrgent)}
                  mode={isUrgent ? 'flat' : 'outlined'}
                >
                  {isUrgent ? 'Yes' : 'No'}
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
          >
            {uploading ? 'Uploading Images...' : 'Create Task'}
          </Button>
        </Surface>
      </KeyboardAvoidingView>

      {/* CATEGORY MODAL - 3 COLUMN GRID */}
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
                      styles.categoryCard,
                      category === cat.key && styles.categoryCardActive
                    ]}
                    onPress={() => handleCategorySelect(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryCardIcon}>{cat.icon}</Text>
                    <Text style={[
                      styles.categoryCardLabel,
                      category === cat.key && styles.categoryCardLabelActive
                    ]} numberOfLines={2}>
                      {cat.label}
                    </Text>
                    {category === cat.key && (
                      <View style={styles.categoryCheckBadge}>
                        <Text style={styles.categoryCheckText}>✓</Text>
                      </View>
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
  },
  notAuthText: {
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  signInButton: {
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
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  euroSign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    fontSize: 16,
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
    color: '#6b7280',
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
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    borderRadius: 12,
  },
  submitButtonContent: {
    paddingVertical: 8,
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
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // 3-COLUMN GRID
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 0.9,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  categoryCardActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0ea5e9',
  },
  categoryCardIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  categoryCardLabelActive: {
    color: '#0369a1',
    fontWeight: '700',
  },
  categoryCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCheckText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
