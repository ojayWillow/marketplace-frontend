import { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Text, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDispute, respondToDispute } from '@marketplace/shared';

export default function DisputeRespondScreen() {
  const { id, disputeId } = useLocalSearchParams<{ id: string; disputeId: string }>();
  const taskId = parseInt(id || '0', 10);
  const disputeIdNum = parseInt(disputeId || '0', 10);
  const queryClient = useQueryClient();

  const [description, setDescription] = useState<string>('');

  // Fetch dispute details
  const { data, isLoading } = useQuery({
    queryKey: ['dispute', disputeIdNum],
    queryFn: () => getDispute(disputeIdNum),
    enabled: disputeIdNum > 0,
  });

  const dispute = data?.dispute;

  // Respond to dispute mutation
  const respondMutation = useMutation({
    mutationFn: () => {
      if (!description.trim()) {
        throw new Error('Please provide a description');
      }
      return respondToDispute(disputeIdNum, {
        description: description.trim(),
      });
    },
    onSuccess: () => {
      Alert.alert(
        'Response Submitted',
        'Your response has been submitted. Support will review both sides and help resolve this dispute.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Invalidate queries and go back to task
              queryClient.invalidateQueries({ queryKey: ['dispute', disputeIdNum] });
              queryClient.invalidateQueries({ queryKey: ['taskDisputes', taskId] });
              queryClient.invalidateQueries({ queryKey: ['task', taskId] });
              router.back();
              router.back(); // Go back twice to get to task screen
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error?.message || 'Failed to submit response';
      Alert.alert('Error', message);
    },
  });

  const handleSubmit = () => {
    if (description.trim().length < 20) {
      Alert.alert('Description Too Short', 'Please provide at least 20 characters describing your side.');
      return;
    }

    Alert.alert(
      'Submit Response',
      'Submit your side of the story? After this, support will review both sides.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => respondMutation.mutate(),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!dispute) {
    return (
      <View style={styles.centered}>
        <Text>Dispute not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Add Your Response',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Tell Your Side
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Task: {dispute.task_title}
          </Text>
        </View>

        <View style={styles.disputeSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Original Dispute
          </Text>
          <View style={styles.disputeCard}>
            <Text variant="bodySmall" style={styles.label}>
              Filed by: {dispute.filed_by_name}
            </Text>
            <Text variant="bodySmall" style={styles.label}>
              Reason: {dispute.reason_label}
            </Text>
            <Text variant="bodyMedium" style={styles.disputeText}>
              {dispute.description}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.label}>
            Your Response *
          </Text>
          <Text variant="bodySmall" style={styles.hint}>
            Explain your side of the story (minimum 20 characters)
          </Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            placeholder="Share your perspective on what happened..."
            style={styles.textInput}
            maxLength={1000}
          />
          <Text variant="bodySmall" style={styles.charCount}>
            {description.length}/1000 characters
          </Text>
        </View>

        <View style={styles.info}>
          <Text variant="bodySmall" style={styles.infoText}>
            ℹ️ After you submit, support will have both sides of the story and will work to resolve this fairly.
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={respondMutation.isPending}
          disabled={respondMutation.isPending}
          style={styles.submitButton}
        >
          Submit Response
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
  },
  disputeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  disputeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  disputeText: {
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  hint: {
    color: '#6b7280',
    marginBottom: 8,
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
