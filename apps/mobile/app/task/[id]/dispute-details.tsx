import { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TextInput as RNTextInput,
  Alert,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import {
  getTask,
  getTaskDisputes,
  respondToDispute,
  uploadImage,
  getImageUrl,
  useAuthStore,
  type Dispute,
} from '@marketplace/shared';
import { useThemeStore } from '../../../src/stores/themeStore';
import { colors } from '../../../src/theme';

const SUPPORT_EMAIL = 'support@tirgus.lv';

export default function DisputeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id || '0', 10);
  const { user } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const queryClient = useQueryClient();

  const [responseText, setResponseText] = useState('');
  const [responseImages, setResponseImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch task details
  const { data: task } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: taskId > 0,
  });

  // Fetch disputes for this task
  const { data: disputesData, isLoading } = useQuery({
    queryKey: ['taskDisputes', taskId],
    queryFn: () => getTaskDisputes(taskId),
    enabled: taskId > 0,
  });

  const dispute = disputesData?.disputes?.[0]; // Get the most recent dispute

  // Determine user role
  const isFiledBy = user?.id === dispute?.filed_by_id;
  const isFiledAgainst = user?.id === dispute?.filed_against_id;
  const canRespond = isFiledAgainst && dispute?.status === 'open' && !dispute?.response_description;

  // Respond mutation
  const respondMutation = useMutation({
    mutationFn: async () => {
      if (!dispute) throw new Error('No dispute found');
      
      setIsUploading(true);
      const uploadedUrls: string[] = [];
      
      try {
        for (const image of responseImages) {
          const file = {
            uri: image.uri,
            type: image.mimeType || 'image/jpeg',
            name: image.fileName || `response_${Date.now()}.jpg`,
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

      return respondToDispute(dispute.id, {
        description: responseText.trim(),
        evidence_images: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      });
    },
    onSuccess: () => {
      Alert.alert('Response Submitted', 'Your response has been recorded. Our team will review both sides.');
      queryClient.invalidateQueries({ queryKey: ['taskDisputes', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setResponseText('');
      setResponseImages([]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit response');
    },
  });

  // Image picker
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
      selectionLimit: 5 - responseImages.length,
    });

    if (!result.canceled && result.assets) {
      setResponseImages([...responseImages, ...result.assets].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setResponseImages(responseImages.filter((_, i) => i !== index));
  };

  const handleContactSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Dispute Help - Task #${taskId}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
        <Stack.Screen options={{ headerShown: true, title: 'Dispute Details', headerBackTitle: 'Back' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  // No dispute found
  if (!dispute) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
        <Stack.Screen options={{ headerShown: true, title: 'Dispute Details', headerBackTitle: 'Back' }} />
        <View style={styles.centered}>
          <Text style={{ color: themeColors.text }}>No dispute found for this task.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: 'Dispute Details', headerBackTitle: 'Back' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Status Header */}
        <View style={[styles.statusHeader, { backgroundColor: getStatusColor(dispute.status) }]}> 
          <Text style={styles.statusIcon}>{getStatusIcon(dispute.status)}</Text>
          <Text style={styles.statusTitle}>{getStatusTitle(dispute.status)}</Text>
          <Text style={styles.statusSubtitle}>{getStatusSubtitle(dispute.status, isFiledBy)}</Text>
        </View>

        {/* Task Info */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.cardLabel, { color: themeColors.textMuted }]}>Task</Text>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>{task?.title || dispute.task_title}</Text>
        </View>

        {/* Report Details - The original complaint */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: themeColors.textMuted }]}>
              {isFiledBy ? 'Your Report' : 'Report Against You'}
            </Text>
            <Text style={[styles.dateText, { color: themeColors.textMuted }]}>
              {formatDate(dispute.created_at)}
            </Text>
          </View>
          
          <View style={[styles.reasonBadge, { backgroundColor: '#fef2f2' }]}>
            <Text style={styles.reasonText}>⚠️ {dispute.reason_label}</Text>
          </View>
          
          <Text style={[styles.descriptionLabel, { color: themeColors.textMuted }]}>Description:</Text>
          <Text style={[styles.descriptionText, { color: themeColors.text }]}>
            {dispute.description}
          </Text>
          
          {dispute.evidence_images && dispute.evidence_images.length > 0 && (
            <View style={styles.evidenceSection}>
              <Text style={[styles.evidenceLabel, { color: themeColors.textMuted }]}>Evidence:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceScroll}>
                {dispute.evidence_images.map((img, index) => (
                  <Image 
                    key={index} 
                    source={{ uri: getImageUrl(img) }} 
                    style={styles.evidenceImage} 
                  />
                ))}
              </ScrollView>
            </View>
          )}
          
          <Text style={[styles.filedBy, { color: themeColors.textMuted }]}>
            Filed by: {dispute.filed_by_name}
          </Text>
        </View>

        {/* Response Section - If there's a response */}
        {dispute.response_description && (
          <View style={[styles.card, { backgroundColor: themeColors.card, borderLeftColor: '#0ea5e9', borderLeftWidth: 4 }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: themeColors.textMuted }]}>
                {isFiledAgainst ? 'Your Response' : 'Their Response'}
              </Text>
              <Text style={[styles.dateText, { color: themeColors.textMuted }]}>
                {formatDate(dispute.responded_at)}
              </Text>
            </View>
            
            <Text style={[styles.descriptionText, { color: themeColors.text }]}>
              {dispute.response_description}
            </Text>
            
            {dispute.response_images && dispute.response_images.length > 0 && (
              <View style={styles.evidenceSection}>
                <Text style={[styles.evidenceLabel, { color: themeColors.textMuted }]}>Evidence:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceScroll}>
                  {dispute.response_images.map((img, index) => (
                    <Image 
                      key={index} 
                      source={{ uri: getImageUrl(img) }} 
                      style={styles.evidenceImage} 
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Response Form - Only for the accused party who hasn't responded */}
        {canRespond && (
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.cardTitle, { color: themeColors.text, marginBottom: 8 }]}>
              📝 Tell Your Side
            </Text>
            <Text style={[styles.cardLabel, { color: themeColors.textMuted, marginBottom: 12 }]}>
              Explain what happened from your perspective. This will help our team understand the full situation.
            </Text>
            
            <RNTextInput
              style={[
                styles.textInput,
                { backgroundColor: themeColors.background, color: themeColors.text },
              ]}
              placeholder="Describe what happened..."
              placeholderTextColor={themeColors.textMuted}
              value={responseText}
              onChangeText={setResponseText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: responseText.length >= 20 ? themeColors.textMuted : '#ef4444' }]}>
              {responseText.length}/20 minimum
            </Text>

            {/* Evidence Images */}
            <Text style={[styles.evidenceLabel, { color: themeColors.textMuted, marginTop: 12 }]}>
              Add evidence (optional):
            </Text>
            <View style={styles.imageGrid}>
              {responseImages.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.uploadImage} />
                  <Pressable style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                    <Text style={styles.removeImageText}>✕</Text>
                  </Pressable>
                </View>
              ))}
              {responseImages.length < 5 && (
                <Pressable
                  style={[styles.addImageBtn, { backgroundColor: themeColors.background }]}
                  onPress={pickImages}
                >
                  <Text style={styles.addImageIcon}>📷</Text>
                  <Text style={[styles.addImageText, { color: themeColors.textMuted }]}>Add</Text>
                </Pressable>
              )}
            </View>

            <Button
              mode="contained"
              onPress={() => respondMutation.mutate()}
              disabled={responseText.trim().length < 20 || respondMutation.isPending || isUploading}
              loading={respondMutation.isPending || isUploading}
              style={styles.submitButton}
              buttonColor="#0ea5e9"
            >
              Submit Response
            </Button>
          </View>
        )}

        {/* Waiting message for filer */}
        {isFiledBy && dispute.status === 'open' && !dispute.response_description && (
          <View style={[styles.card, { backgroundColor: '#fef3c7' }]}>
            <Text style={styles.waitingIcon}>⏳</Text>
            <Text style={[styles.waitingTitle, { color: '#92400e' }]}>Waiting for Response</Text>
            <Text style={[styles.waitingText, { color: '#a16207' }]}>
              The other party has been notified and can respond to your report. You'll be notified when they do.
            </Text>
          </View>
        )}

        {/* Under review message */}
        {dispute.status === 'under_review' && (
          <View style={[styles.card, { backgroundColor: '#dbeafe' }]}>
            <Text style={styles.waitingIcon}>🔍</Text>
            <Text style={[styles.waitingTitle, { color: '#1e40af' }]}>Under Review</Text>
            <Text style={[styles.waitingText, { color: '#1d4ed8' }]}>
              Our support team is reviewing this dispute. Both parties have provided their side. You'll be notified once a decision is made.
            </Text>
          </View>
        )}

        {/* Resolution - if resolved */}
        {dispute.status === 'resolved' && dispute.resolution && (
          <View style={[styles.card, { backgroundColor: '#dcfce7' }]}>
            <Text style={styles.waitingIcon}>✅</Text>
            <Text style={[styles.waitingTitle, { color: '#166534' }]}>Resolved</Text>
            <Text style={[styles.waitingText, { color: '#15803d' }]}>
              {getResolutionMessage(dispute.resolution)}
            </Text>
            {dispute.resolution_notes && (
              <Text style={[styles.resolutionNotes, { color: '#166534' }]}>
                Notes: {dispute.resolution_notes}
              </Text>
            )}
          </View>
        )}

        {/* Support Contact */}
        <Pressable style={[styles.supportCard, { backgroundColor: themeColors.card }]} onPress={handleContactSupport}>
          <Text style={[styles.supportLabel, { color: themeColors.textMuted }]}>Need help?</Text>
          <Text style={[styles.supportEmail, { color: '#0ea5e9' }]}>{SUPPORT_EMAIL}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions
function getStatusColor(status: string): string {
  switch (status) {
    case 'open': return '#fef3c7';
    case 'under_review': return '#dbeafe';
    case 'resolved': return '#dcfce7';
    default: return '#f3f4f6';
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'open': return '📩';
    case 'under_review': return '🔍';
    case 'resolved': return '✅';
    default: return '📋';
  }
}

function getStatusTitle(status: string): string {
  switch (status) {
    case 'open': return 'Report Open';
    case 'under_review': return 'Under Review';
    case 'resolved': return 'Resolved';
    default: return 'Dispute Status';
  }
}

function getStatusSubtitle(status: string, isFiledBy: boolean): string {
  switch (status) {
    case 'open': 
      return isFiledBy 
        ? 'Waiting for the other party to respond' 
        : 'Please review and respond to this report';
    case 'under_review': 
      return 'Our team is reviewing both sides';
    case 'resolved': 
      return 'This dispute has been resolved';
    default: 
      return '';
  }
}

function getResolutionMessage(resolution: string): string {
  switch (resolution) {
    case 'refund': return 'A full refund has been issued to the task creator.';
    case 'pay_worker': return 'The worker has been paid for the completed work.';
    case 'partial': return 'A partial resolution has been applied.';
    case 'cancelled': return 'The task has been cancelled.';
    default: return 'This dispute has been resolved.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  
  statusHeader: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: { fontSize: 40, marginBottom: 8 },
  statusTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  statusSubtitle: { fontSize: 14, color: '#4b5563', textAlign: 'center' },
  
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  dateText: { fontSize: 12 },
  
  reasonBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  reasonText: { fontSize: 14, fontWeight: '600', color: '#dc2626' },
  
  descriptionLabel: { fontSize: 12, marginBottom: 4 },
  descriptionText: { fontSize: 15, lineHeight: 22 },
  
  evidenceSection: { marginTop: 12 },
  evidenceLabel: { fontSize: 12, marginBottom: 8 },
  evidenceScroll: { marginBottom: 8 },
  evidenceImage: { width: 100, height: 100, borderRadius: 8, marginRight: 8 },
  
  filedBy: { fontSize: 12, marginTop: 12 },
  
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 4 },
  
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  imageWrapper: { position: 'relative' },
  uploadImage: { width: 70, height: 70, borderRadius: 8 },
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
  removeImageText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  addImageBtn: {
    width: 70,
    height: 70,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addImageIcon: { fontSize: 20, marginBottom: 2 },
  addImageText: { fontSize: 11 },
  
  submitButton: { marginTop: 16, borderRadius: 12 },
  
  waitingIcon: { fontSize: 32, textAlign: 'center', marginBottom: 8 },
  waitingTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  waitingText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  resolutionNotes: { fontSize: 13, marginTop: 12, fontStyle: 'italic' },
  
  supportCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  supportLabel: { fontSize: 12, marginBottom: 4 },
  supportEmail: { fontSize: 16, fontWeight: '600' },
});
