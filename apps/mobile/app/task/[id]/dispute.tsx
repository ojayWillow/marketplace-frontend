import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput as RNTextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, RadioButton } from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  getTask,
  getDisputeReasons,
  createDispute,
  uploadImage,
  useAuthStore,
} from '@marketplace/shared';
import { useThemeStore } from '../../../src/stores/themeStore';
import { colors } from '../../../src/theme';

const SUPPORT_EMAIL = 'support@marketplace.com';

export default function DisputeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const queryClient = useQueryClient();

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch task details
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  // Fetch dispute reasons
  const { data: reasons, isLoading: reasonsLoading } = useQuery({
    queryKey: ['disputeReasons'],
    queryFn: getDisputeReasons,
  });

  // Check if user can dispute this task
  const isCreator = user?.id === task?.creator_id;
  const isWorker = user?.id === task?.assigned_to_id;
  const canDispute = (isCreator || isWorker) && 
    (task?.status === 'in_progress' || task?.status === 'completed' || task?.status === 'pending_confirmation');

  // Create dispute mutation
  const disputeMutation = useMutation({
    mutationFn: async () => {
      // Upload images first
      setIsUploading(true);
      const uploadedUrls: string[] = [];
      
      try {
        for (const image of images) {
          const file = {
            uri: image.uri,
            type: image.mimeType || 'image/jpeg',
            name: image.fileName || `evidence_${Date.now()}.jpg`,
          };
          const result = await uploadImage(file as any);
          if (result.url) {
            uploadedUrls.push(result.url);
          }
        }
      } catch (error) {
        console.error('Failed to upload images:', error);
      }
      setIsUploading(false);

      // Create dispute
      return createDispute({
        task_id: taskId,
        reason: selectedReason,
        description: description.trim(),
        evidence_images: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to submit dispute. Please try again.'
      );
    },
  });

  // Pick images
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - images.length,
    });

    if (!result.canceled && result.assets) {
      setImages([...images, ...result.assets].slice(0, 5));
    }
  };

  // Take photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0]].slice(0, 5));
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const canSubmit = selectedReason && description.trim().length >= 20 && !disputeMutation.isPending && !isUploading;

  // Loading state
  if (taskLoading || reasonsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ title: 'Report Problem' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  // Access denied
  if (!canDispute) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ title: 'Report Problem' }} />
        <View style={styles.centered}>
          <Text style={[styles.errorIcon]}>🚫</Text>
          <Text style={[styles.errorTitle, { color: themeColors.text }]}>Cannot Report</Text>
          <Text style={[styles.errorText, { color: themeColors.textSecondary }]}>
            {!isCreator && !isWorker 
              ? 'You are not involved in this task.'
              : 'This task cannot be disputed in its current status.'}
          </Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ title: 'Report Submitted' }} />
        <View style={styles.centered}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={[styles.successTitle, { color: themeColors.text }]}>Report Submitted</Text>
          <Text style={[styles.successText, { color: themeColors.textSecondary }]}>
            We've received your report and will review it shortly.
          </Text>
          <Text style={[styles.successText, { color: themeColors.textSecondary, marginTop: 12 }]}>
            The other party will be notified and can respond.
          </Text>
          
          <View style={[styles.supportCard, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.supportLabel, { color: themeColors.textMuted }]}>Need help?</Text>
            <Text style={[styles.supportEmail, { color: themeColors.text }]}>{SUPPORT_EMAIL}</Text>
          </View>
          
          <Button mode="contained" onPress={() => router.replace(`/task/${taskId}`)} style={styles.doneButton}>
            Done
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Report Problem' }} />
      
      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Task Info */}
          <View style={[styles.taskCard, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.taskLabel, { color: themeColors.textMuted }]}>Reporting issue with:</Text>
            <Text style={[styles.taskTitle, { color: themeColors.text }]}>{task?.title}</Text>
          </View>

          {/* Reason Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>What's the problem?</Text>
            <RadioButton.Group onValueChange={setSelectedReason} value={selectedReason}>
              {reasons?.map((reason) => (
                <Pressable
                  key={reason.value}
                  style={[
                    styles.reasonOption,
                    { backgroundColor: themeColors.card },
                    selectedReason === reason.value && styles.reasonOptionSelected,
                  ]}
                  onPress={() => setSelectedReason(reason.value)}
                >
                  <RadioButton.Android value={reason.value} color="#0ea5e9" />
                  <Text style={[styles.reasonText, { color: themeColors.text }]}>{reason.label}</Text>
                </Pressable>
              ))}
            </RadioButton.Group>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Describe the issue</Text>
            <Text style={[styles.sectionHint, { color: themeColors.textMuted }]}>
              Minimum 20 characters. Be specific about what went wrong.
            </Text>
            <RNTextInput
              style={[
                styles.textInput,
                { backgroundColor: themeColors.card, color: themeColors.text },
              ]}
              placeholder="Explain what happened..."
              placeholderTextColor={themeColors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: description.length >= 20 ? themeColors.textMuted : '#ef4444' }]}>
              {description.length}/20 minimum
            </Text>
          </View>

          {/* Evidence Images */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Evidence (optional)</Text>
            <Text style={[styles.sectionHint, { color: themeColors.textMuted }]}>
              Add photos to support your case. Max 5 images.
            </Text>
            
            <View style={styles.imageGrid}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.evidenceImage} />
                  <Pressable style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                    <Text style={styles.removeImageText}>✕</Text>
                  </Pressable>
                </View>
              ))}
              
              {images.length < 5 && (
                <View style={styles.addImageButtons}>
                  <Pressable
                    style={[styles.addImageBtn, { backgroundColor: themeColors.card }]}
                    onPress={pickImages}
                  >
                    <Text style={styles.addImageIcon}>🖼️</Text>
                    <Text style={[styles.addImageText, { color: themeColors.textMuted }]}>Gallery</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.addImageBtn, { backgroundColor: themeColors.card }]}
                    onPress={takePhoto}
                  >
                    <Text style={styles.addImageIcon}>📷</Text>
                    <Text style={[styles.addImageText, { color: themeColors.textMuted }]}>Camera</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* Support Info */}
          <View style={[styles.infoCard, { backgroundColor: themeColors.backgroundSecondary }]}>
            <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
              💡 After submitting, the other party can respond. Our team will review and resolve the dispute.
            </Text>
            <Text style={[styles.infoText, { color: themeColors.textSecondary, marginTop: 8 }]}>
              For urgent issues, contact: {SUPPORT_EMAIL}
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.bottomBar, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
          <Button
            mode="contained"
            onPress={() => disputeMutation.mutate()}
            disabled={!canSubmit}
            loading={disputeMutation.isPending || isUploading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            buttonColor="#ef4444"
          >
            {isUploading ? 'Uploading...' : 'Submit Report'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  
  // Task card
  taskCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  taskLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    marginBottom: 12,
  },
  
  // Reason options
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reasonOptionSelected: {
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  reasonText: {
    fontSize: 15,
    flex: 1,
  },
  
  // Text input
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  
  // Images
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  evidenceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addImageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addImageIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  addImageText: {
    fontSize: 11,
  },
  
  // Info card
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    borderRadius: 12,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  
  // Error states
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginTop: 12,
  },
  
  // Success states
  successIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  supportCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  supportLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  supportEmail: {
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    marginTop: 24,
    minWidth: 120,
  },
});
