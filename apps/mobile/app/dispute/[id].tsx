import { View, ScrollView, Image, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Text, Button, ActivityIndicator, TextInput, Card, Chip } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, apiRequest, getImageUrl } from '@marketplace/shared';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { StyleSheet } from 'react-native';

/**
 * IMPORTANT: This screen expects a DISPUTE ID in the route parameter, not a task ID.
 * 
 * Most navigation should use /task/[taskId] which shows dispute info via TaskDisputeInfo component.
 * This dedicated dispute detail screen is only used when you have an actual dispute ID.
 * 
 * Typical flow:
 * - User clicks disputed task card → goes to /task/[taskId] (NOT here)
 * - Notification with task ID → goes to /task/[taskId] (NOT here) 
 * - Only use this route if you specifically have a dispute ID from backend
 */

interface Dispute {
  id: number;
  task_id: number;
  filed_by_id: number;
  filed_against_id: number;
  reason: string;
  description: string;
  evidence_images: string[] | null;
  response_description: string | null;
  response_images: string[] | null;
  status: 'open' | 'under_review' | 'resolved';
  created_at: string;
  responded_at: string | null;
  task: {
    id: number;
    title: string;
  };
  filed_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  filed_against: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
}

const REASON_LABELS: Record<string, string> = {
  'work_not_completed': 'Work Not Completed',
  'poor_quality': 'Poor Quality Work',
  'task_changed': 'Task Requirements Changed',
  'payment_issue': 'Payment Issue',
  'safety_concern': 'Safety Concern',
  'communication': 'Communication Issue',
  'other': 'Other'
};

export default function DisputeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const disputeId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const queryClient = useQueryClient();
  
  const [responseText, setResponseText] = useState('');
  const [responseImages, setResponseImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch dispute details by DISPUTE ID (not task ID)
  const { data: dispute, isLoading, error } = useQuery<Dispute>({
    queryKey: ['dispute', disputeId],
    queryFn: async () => {
      const response = await apiRequest(`/disputes/${disputeId}`);
      return response.dispute;
    },
    enabled: disputeId > 0,
  });

  // Submit response mutation
  const responseMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/disputes/${disputeId}/respond`, {
        method: 'POST',
        body: JSON.stringify({
          description: responseText,
          evidence_images: responseImages,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute', disputeId] });
      Alert.alert('Success', 'Your response has been submitted');
      setResponseText('');
      setResponseImages([]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to submit response');
    },
  });

  // Pick and upload image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'dispute-evidence.jpg',
        } as any);

        const response = await apiRequest('/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.url) {
          setResponseImages([...responseImages, response.url]);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmitResponse = () => {
    if (responseText.trim().length < 20) {
      Alert.alert('Error', 'Response must be at least 20 characters');
      return;
    }
    responseMutation.mutate();
  };

  const isFiledAgainstMe = user?.id === dispute?.filed_against_id;
  const canRespond = isFiledAgainstMe && dispute?.status === 'open' && !dispute?.response_description;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      padding: 16,
    },
    card: {
      marginBottom: 16,
      backgroundColor: themeColors.card,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: themeColors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    value: {
      fontSize: 16,
      color: themeColors.text,
      marginBottom: 4,
    },
    description: {
      fontSize: 15,
      color: themeColors.text,
      lineHeight: 22,
    },
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    evidenceImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    input: {
      marginBottom: 16,
      backgroundColor: themeColors.background,
    },
    button: {
      marginTop: 8,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    statusChip: {
      alignSelf: 'flex-start',
      marginBottom: 16,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={themeColors.primaryAccent} />
      </View>
    );
  }

  if (error || !dispute) {
    return (
      <View style={styles.centered}>
        <Text style={styles.value}>Dispute not found</Text>
        <Text style={{ color: themeColors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 16 }}>
          This route expects a dispute ID. For task disputes, navigate to /task/[taskId] instead.
        </Text>
        <Button mode="contained" onPress={() => router.back()} buttonColor={themeColors.primaryAccent}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Dispute Details',
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.primaryAccent,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status */}
        <Chip 
          style={styles.statusChip}
          textStyle={{ color: '#fff' }}
          {...(dispute.status === 'open' ? { backgroundColor: '#f59e0b' } : 
             dispute.status === 'under_review' ? { backgroundColor: '#3b82f6' } : 
             { backgroundColor: '#10b981' })}
        >
          {dispute.status.replace('_', ' ').toUpperCase()}
        </Chip>

        {/* Task Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Task</Text>
            <Text style={styles.value}>{dispute.task.title}</Text>
          </Card.Content>
        </Card>

        {/* Dispute Filed By (Their Complaint) */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Dispute Filed By</Text>
            <Text style={styles.value}>
              {dispute.filed_by.first_name} {dispute.filed_by.last_name} (@{dispute.filed_by.username})
            </Text>
            
            <Text style={[styles.label, { marginTop: 16 }]}>Reason</Text>
            <Text style={styles.value}>{REASON_LABELS[dispute.reason] || dispute.reason}</Text>
            
            <Text style={[styles.label, { marginTop: 16 }]}>Their Description</Text>
            <Text style={styles.description}>{dispute.description}</Text>

            {dispute.evidence_images && dispute.evidence_images.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.label, { marginTop: 16 }]}>Their Evidence</Text>
                <View style={styles.imageGrid}>
                  {dispute.evidence_images.map((img, index) => (
                    <Image
                      key={index}
                      source={{ uri: getImageUrl(img) }}
                      style={styles.evidenceImage}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Response Section */}
        {dispute.response_description ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Your Response</Text>
              <Text style={styles.description}>{dispute.response_description}</Text>

              {dispute.response_images && dispute.response_images.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.label, { marginTop: 16 }]}>Your Evidence</Text>
                  <View style={styles.imageGrid}>
                    {dispute.response_images.map((img, index) => (
                      <Image
                        key={index}
                        source={{ uri: getImageUrl(img) }}
                        style={styles.evidenceImage}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        ) : canRespond ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Submit Your Response</Text>
              
              <TextInput
                mode="outlined"
                label="Your Explanation"
                value={responseText}
                onChangeText={setResponseText}
                multiline
                numberOfLines={6}
                style={styles.input}
                placeholder="Explain your side (minimum 20 characters)..."
                outlineColor={themeColors.border}
                activeOutlineColor={themeColors.primaryAccent}
              />

              {responseImages.length > 0 && (
                <View style={styles.imageGrid}>
                  {responseImages.map((img, index) => (
                    <Image
                      key={index}
                      source={{ uri: getImageUrl(img) }}
                      style={styles.evidenceImage}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              )}

              <Button
                mode="outlined"
                onPress={pickImage}
                disabled={uploading}
                icon="camera"
                style={styles.button}
                textColor={themeColors.primaryAccent}
              >
                {uploading ? 'Uploading...' : 'Add Evidence Photo'}
              </Button>

              <Button
                mode="contained"
                onPress={handleSubmitResponse}
                disabled={responseMutation.isPending}
                loading={responseMutation.isPending}
                style={styles.button}
                buttonColor={themeColors.primaryAccent}
              >
                Submit Response
              </Button>
            </Card.Content>
          </Card>
        ) : null}

        {dispute.status === 'resolved' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>This dispute has been resolved by an administrator.</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
