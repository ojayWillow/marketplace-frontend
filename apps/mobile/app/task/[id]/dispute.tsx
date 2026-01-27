import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTask,
  getDisputeReasons,
  createDispute,
  useAuthStore,
  type DisputeReason,
} from '@marketplace/shared';
import { Picker } from '@react-native-picker/picker';

export default function DisputeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');

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

  // Create dispute mutation
  const createDisputeMutation = useMutation({
    mutationFn: () => {
      if (!selectedReason || !description.trim()) {
        throw new Error('Please fill all fields');
      }
      return createDispute({
        task_id: taskId,
        reason: selectedReason,
        description: description.trim(),
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
              // Invalidate queries and go back
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
  const isCreator = user?.id === task?.creator_id;

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
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedReason}
              onValueChange={(value) => setSelectedReason(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a reason..." value="" />
              {reasons?.map((reason: DisputeReason) => (
                <Picker.Item key={reason.value} label={reason.label} value={reason.value} />
              ))}
            </Picker>
          </View>
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
  },
  hint: {
    color: '#6b7280',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  picker: {
    height: 50,
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
