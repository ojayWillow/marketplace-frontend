import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Surface, SegmentedButtons, Chip } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, useAuthStore } from '@marketplace/shared';
import DateTimePicker from '@react-native-community/datetimepicker';

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

export default function CreateTaskScreen() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('other');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createTask>[0]) => createTask(data),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-map'] });
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
      const message = error.response?.data?.message || 'Failed to create task. Please try again.';
      Alert.alert('Error', message);
    },
  });

  const handleSubmit = () => {
    // Validation
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

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      budget: parseFloat(budget),
      category,
      location: location.trim() || undefined,
      deadline: deadline?.toISOString(),
      is_urgent: isUrgent,
    });
  };

  // Redirect to login if not authenticated
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
              />
            </Surface>

            {/* Location */}
            <Surface style={styles.section} elevation={0}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Location</Text>
              <TextInput
                label="Location"
                value={location}
                onChangeText={setLocation}
                mode="outlined"
                placeholder="Where is this task located?"
                left={<TextInput.Icon icon="map-marker" />}
                style={styles.input}
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
            loading={createMutation.isPending}
            disabled={createMutation.isPending}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
          >
            Create Task
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
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 100,
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
