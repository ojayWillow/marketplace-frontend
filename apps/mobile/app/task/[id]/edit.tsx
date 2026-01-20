import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Surface, Chip, ActivityIndicator, useTheme } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTask, updateTask, uploadImageFromUri, useAuthStore } from '@marketplace/shared';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from '../../../components/ImagePicker';
import LocationPicker from '../../../components/LocationPicker';

const CATEGORIES = [
  { value: 'cleaning', label: '🧹 Cleaning' },
  { value: 'moving', label: '📦 Moving' },
  { value: 'repairs', label: '🔧 Repairs' },
  { value: 'delivery', label: '🚚 Delivery' },
  { value: 'tutoring', label: '📚 Tutoring' },
  { value: 'gardening', label: '🌱 Gardening' },
  { value: 'tech', label: '💻 Tech Help' },
  { value: 'other', label: '📌 Other' },
];

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const { data: task, isLoading: loadingTask } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('other');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Initialize form with task data
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setBudget(task.budget?.toString() || '');
      setCategory(task.category || 'other');
      if (task.location && task.latitude && task.longitude) {
        setLocation({
          address: task.location,
          latitude: task.latitude,
          longitude: task.longitude,
        });
      }
      setDeadline(task.deadline ? new Date(task.deadline) : null);
      setIsUrgent(task.is_urgent || false);
      if (task.images) {
        setImages(task.images.split(',').filter(Boolean));
      }
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: async (data: Parameters<typeof updateTask>[1]) => {
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
      
      return updateTask(taskId, {
        ...data,
        images: imageUrls.length > 0 ? imageUrls.join(',') : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-map'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-home'] });
      Alert.alert('Success!', 'Your task has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update task.';
      Alert.alert('Error', message);
    },
  });

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

    updateMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      budget: parseFloat(budget),
      category,
      location: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      deadline: deadline?.toISOString(),
      is_urgent: isUrgent,
    });
  };

  // Check authorization
  if (loadingTask) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Edit Task' }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!task || task.creator_id !== user?.id) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Edit Task' }} />
        <View style={styles.centerContainer}>
          <Text variant="headlineSmall" style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>You can only edit your own tasks.</Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (task.status !== 'open') {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Edit Task' }} />
        <View style={styles.centerContainer}>
          <Text variant="headlineSmall" style={styles.errorTitle}>Cannot Edit</Text>
          <Text style={styles.errorText}>Only open tasks can be edited.</Text>
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
          title: 'Edit Task',
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
              <Text variant="titleMedium" style={styles.sectionTitle}>Task Details</Text>
              
              <TextInput
                label="Title *"
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                placeholder="What do you need help with?"
                maxLength={100}
                style={styles.input}
                outlineColor="#d1d5db"
                activeOutlineColor="#0ea5e9"
                textColor="#1f2937"
              />

              <TextInput
                label="Description *"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                placeholder="Describe your task in detail..."
                multiline
                numberOfLines={4}
                maxLength={1000}
                style={[styles.input, styles.textArea]}
                outlineColor="#d1d5db"
                activeOutlineColor="#0ea5e9"
                textColor="#1f2937"
              />
            </Surface>

            {/* Images */}
            <Surface style={styles.section} elevation={0}>
              <ImagePicker
                images={images}
                onImagesChange={setImages}
                maxImages={5}
                label="Photos (Optional)"
              />
            </Surface>

            {/* Category */}
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoriesContainer}>
                {CATEGORIES.map((cat) => (
                  <Chip
                    key={cat.value}
                    selected={category === cat.value}
                    onPress={() => setCategory(cat.value)}
                    style={styles.categoryChip}
                    mode={category === cat.value ? 'flat' : 'outlined'}
                  >
                    {cat.label}
                  </Chip>
                ))}
              </View>
            </Surface>

            {/* Budget */}
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Budget</Text>
              <TextInput
                label="Budget (€) *"
                value={budget}
                onChangeText={setBudget}
                mode="outlined"
                keyboardType="decimal-pad"
                placeholder="0.00"
                left={<TextInput.Affix text="€" />}
                style={styles.input}
                outlineColor="#d1d5db"
                activeOutlineColor="#0ea5e9"
                textColor="#1f2937"
              />
            </Surface>

            {/* Location */}
            <Surface style={styles.section} elevation={0}>
              <LocationPicker
                initialLocation={location || undefined}
                onLocationSelect={setLocation}
                label="Location *"
              />
            </Surface>

            {/* Deadline */}
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

            {/* Urgent Toggle */}
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
            {uploading ? 'Uploading Images...' : 'Update Task'}
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
    paddingBottom: 16,
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
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 120,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginBottom: 4,
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
});
