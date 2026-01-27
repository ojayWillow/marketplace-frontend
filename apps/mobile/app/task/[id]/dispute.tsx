import { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Text, Button, TextInput, ActivityIndicator, Menu, IconButton } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  getTask,
  getDisputeReasons,
  createDispute,
  useAuthStore,
  type DisputeReason,
} from '@marketplace/shared';

const MAX_PHOTOS = 5;

export default function DisputeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

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

  // Handle photo picker
  const handleAddPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit Reached', `You can only upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, MAX_PHOTOS));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Create dispute mutation
  const createDisputeMutation = useMutation({
    mutationFn: () => {
      if (!selectedReason || !description.trim()) {
        throw new Error('Please fill all fields');
      }
      // TODO: Upload photos and include URLs in dispute creation
      return createDispute({
        task_id: taskId,
        reason: selectedReason,
        description: description.trim(),
        // evidence_images: photos, // To be implemented with backend
      });
    },
    onSuccess: (data) => {
      Alert.alert(
        'Dispute Created',
        `Your dispute has been filed. Support will review it.\n\nSupport: ${data.support_email}`,
        [
          {
            text: 'OK',
            onPress: () => {
              queryClient.invalidateQueries({ queryKey: ['task', taskId] });
              queryClient.invalidateQueries({ queryKey: ['taskDisputes', taskId] });
              router.back();
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error?.message || 'Failed to create dispute';
      Alert.alert('Error', message);
    },
  });

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('Missing Information', 'Please select a reason for the dispute.');
      return;
    }
    if (description.trim().length < 20) {
      Alert.alert('Description Too Short', 'Please provide at least 20 characters describing the issue.');
      return;
    }

    Alert.alert(
      'File Dispute',
      'Are you sure you want to file a dispute? This will notify the other party and support team.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'File Dispute',
          style: 'destructive',
          onPress: () => createDisputeMutation.mutate(),
        },
      ]
    );
  };

  // Determine user role
  const isWorker = user?.id === task?.assigned_to_id;

  if (taskLoading || reasonsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text>Task not found</Text>
      </View>
    );
  }

  // Get the label for selected reason
  const selectedReasonLabel = reasons?.find((r: DisputeReason) => r.value === selectedReason)?.label || 'Select a reason...';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'File Dispute',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Report an Issue
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Task: {task.title}
          </Text>
          <Text variant="bodySmall" style={styles.role}>
            Filing as: {isWorker ? 'Worker' : 'Task Creator'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.label}>
            Reason *
          </Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setMenuVisible(true)}
              >
                <Text style={[styles.dropdownText, !selectedReason && styles.placeholderText]}>
                  {selectedReasonLabel}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            }
          >
            {reasons?.map((reason: DisputeReason) => (
              <Menu.Item
                key={reason.value}
                onPress={() => {
                  setSelectedReason(reason.value);
                  setMenuVisible(false);
                }}
                title={reason.label}
              />
            ))}
          </Menu>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.label}>
            Description *
          </Text>
          <Text variant="bodySmall" style={styles.hint}>
            Describe what happened in detail (minimum 20 characters)
          </Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            placeholder="Explain the issue in detail..."
            style={styles.textInput}
            maxLength={1000}
          />
          <Text variant="bodySmall" style={styles.charCount}>
            {description.length}/1000 characters
          </Text>
        </View>

        {/* Photo Evidence Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.label}>
            Evidence Photos
          </Text>
          <Text variant="bodySmall" style={styles.hint}>
            Add up to {MAX_PHOTOS} photos as evidence (optional)
          </Text>
          
          <View style={styles.photosContainer}>
            {photos.map((uri, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
                <Text style={styles.addPhotoIcon}>📷</Text>
                <Text style={styles.addPhotoText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text variant="bodySmall" style={styles.photoCount}>
            {photos.length}/{MAX_PHOTOS} photos
          </Text>
        </View>

        <View style={styles.info}>
          <Text variant="bodySmall" style={styles.infoText}>
            ℹ️ After filing, the other party will be notified and can respond. Support will review both sides and help resolve the issue.
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={createDisputeMutation.isPending}
          disabled={createDisputeMutation.isPending}
          style={styles.submitButton}
          buttonColor="#ef4444"
        >
          File Dispute
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 4,
  },
  role: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  hint: {
    color: '#6b7280',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    minHeight: 120,
  },
  charCount: {
    textAlign: 'right',
    color: '#9ca3af',
    marginTop: 4,
  },
  // Photo styles
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  addPhotoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  photoCount: {
    color: '#9ca3af',
    marginTop: 8,
  },
  info: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    color: '#1e40af',
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: 32,
  },
});
