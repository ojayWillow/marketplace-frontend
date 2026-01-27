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
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [requirePayment, setRequirePayment] = useState(false);
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
        payment_required: requirePayment,
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
      const message = error.response?.data?.error || error.message || 'Failed to create task';
      Alert.alert('Error', message);
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !budget.trim() || !location || !user?.id) {
      Alert.alert('Required', 'Please fill in all required fields.');
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: 'Create Task', headerBackTitle: 'Cancel' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            
            {/* EXISTING SECTIONS... Title, Description, Images, Category, Budget, Difficulty, Location, Deadline */}
            
            <Surface style={styles.section} elevation={0}>
              <View style={styles.urgentRow}>
                <View style={styles.urgentInfo}>
                  <Text variant="titleMedium">🔥 Mark as Urgent</Text>
                  <Text style={styles.urgentHint}>Urgent tasks get more visibility</Text>
                </View>
                <Chip selected={isUrgent} onPress={() => setIsUrgent(!isUrgent)} mode={isUrgent ? 'flat' : 'outlined'}>
                  {isUrgent ? 'Yes' : 'No'}
                </Chip>
              </View>
            </Surface>

            {/* PAYMENT TOGGLE */}
            <Surface style={styles.section} elevation={0}>
              <View style={styles.urgentRow}>
                <View style={styles.urgentInfo}>
                  <Text variant="titleMedium">💳 Require Payment</Text>
                  <Text style={styles.urgentHint}>Get paid upfront via secure escrow</Text>
                </View>
                <Chip selected={requirePayment} onPress={() => setRequirePayment(!requirePayment)} mode={requirePayment ? 'flat' : 'outlined'}>
                  {requirePayment ? 'Yes' : 'No'}
                </Chip>
              </View>
            </Surface>

            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>

        <Surface style={styles.bottomBar} elevation={4}>
          <Button mode="contained" onPress={handleSubmit} loading={isLoading} disabled={isLoading} style={styles.submitButton} contentStyle={styles.submitButtonContent}>
            {uploading ? 'Uploading...' : 'Create Task'}
          </Button>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  section: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 12 },
  urgentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  urgentInfo: { flex: 1 },
  urgentHint: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  bottomSpacer: { height: 100 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', padding: 16, paddingBottom: 32 },
  submitButton: { borderRadius: 12 },
  submitButtonContent: { paddingVertical: 8 },
});
