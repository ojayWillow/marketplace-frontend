import { View, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getTaskDisputes, respondToDispute, useAuthStore, type Dispute } from '@marketplace/shared';
import { useThemeStore } from '../../../../stores/themeStore';
import { useTranslation } from '../../../../hooks/useTranslation';
import { colors } from '../../../../theme';

interface TaskDisputeInfoProps {
  taskId: number;
}

export function TaskDisputeInfo({ taskId }: TaskDisputeInfoProps) {
  const { user } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const { t } = useTranslation();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const queryClient = useQueryClient();

  // Reason labels mapping using translations
  const REASON_LABELS: Record<string, string> = {
    'work_not_completed': t.dispute.reasons.workNotCompleted,
    'poor_quality': t.dispute.reasons.poorQuality,
    'task_changed': t.dispute.reasons.taskChanged,
    'payment_issue': t.dispute.reasons.paymentIssue,
    'safety_concern': t.dispute.reasons.safetyConcern,
    'communication': t.dispute.reasons.communication,
    'other': t.dispute.reasons.other,
  };

  // Response form state
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');

  // Fetch disputes for this task
  const { data, isLoading, error } = useQuery({
    queryKey: ['taskDisputes', taskId],
    queryFn: () => getTaskDisputes(taskId),
    enabled: taskId > 0,
    retry: false,
  });

  // Mutation for submitting response
  const respondMutation = useMutation({
    mutationFn: (params: { disputeId: number; description: string }) => 
      respondToDispute(params.disputeId, { description: params.description }),
    onSuccess: () => {
      Alert.alert(
        t.dispute.alerts.responseSubmittedTitle,
        t.dispute.alerts.responseSubmittedMessage,
        [{ text: t.dispute.alerts.ok }]
      );
      setShowResponseForm(false);
      setResponseText('');
      // Refresh dispute data
      queryClient.invalidateQueries({ queryKey: ['taskDisputes', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || t.dispute.alerts.errorSubmit;
      Alert.alert(t.dispute.alerts.error, message);
    },
  });

  // Don't render if loading, error, or no disputes
  if (isLoading || error || !data || !data.disputes || data.disputes.length === 0) {
    return null;
  }

  // Get the most recent open/under_review dispute
  const activeDispute: Dispute | undefined = data.disputes.find(
    (d: Dispute) => d.status === 'open' || d.status === 'under_review'
  );

  if (!activeDispute) {
    return null;
  }

  const isFiledByMe = activeDispute.filed_by_id === user?.id;
  const isFiledAgainstMe = activeDispute.filed_against_id === user?.id;
  
  // User can respond if:
  // 1. They are the one the dispute is filed against
  // 2. The dispute is still open
  // 3. No response has been submitted yet
  const canRespond = isFiledAgainstMe && activeDispute.status === 'open' && !activeDispute.response_description;

  const handleSubmitResponse = () => {
    if (responseText.trim().length < 20) {
      Alert.alert(t.dispute.alerts.error, t.dispute.alerts.errorMinLength);
      return;
    }
    
    respondMutation.mutate({
      disputeId: activeDispute.id,
      description: responseText.trim(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#f59e0b';
      case 'under_review':
        return '#3b82f6';
      case 'resolved':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return t.dispute.status.open;
      case 'under_review':
        return t.dispute.status.underReview;
      case 'resolved':
        return t.dispute.status.resolved;
      default:
        return status.replace('_', ' ').toUpperCase();
    }
  };

  // Use filed_by_name if available, otherwise translated text
  const filedByName = isFiledByMe ? t.dispute.info.you : (activeDispute.filed_by_name || t.dispute.info.theOtherParty);

  const styles = StyleSheet.create({
    card: {
      marginHorizontal: 16,
      marginVertical: 12,
      borderColor: '#ef4444',
      borderWidth: 2,
      backgroundColor: themeColors.card,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontWeight: 'bold',
      color: '#ef4444',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    info: {
      marginBottom: 12,
    },
    label: {
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 4,
    },
    value: {
      color: themeColors.textSecondary,
    },
    descriptionSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    description: {
      color: themeColors.text,
      lineHeight: 20,
    },
    reviewNotice: {
      backgroundColor: activeTheme === 'dark' ? '#1e3a5f' : '#dbeafe',
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
    },
    reviewText: {
      color: activeTheme === 'dark' ? '#93c5fd' : '#1e40af',
      lineHeight: 18,
    },
    respondNotice: {
      backgroundColor: activeTheme === 'dark' ? '#4a2c2c' : '#fee2e2',
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
    },
    respondText: {
      color: activeTheme === 'dark' ? '#fca5a5' : '#991b1b',
      lineHeight: 18,
      marginBottom: 12,
    },
    respondButton: {
      marginTop: 4,
    },
    responseSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    responseHeader: {
      fontWeight: '600',
      color: '#10b981',
      marginBottom: 8,
    },
    // Response form styles
    responseFormContainer: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    responseFormTitle: {
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 12,
    },
    textInput: {
      backgroundColor: themeColors.backgroundSecondary,
      marginBottom: 12,
    },
    characterCount: {
      fontSize: 12,
      color: themeColors.textMuted,
      textAlign: 'right',
      marginBottom: 12,
    },
    formButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    cancelButton: {
      marginRight: 8,
    },
  });

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            ⚠️ {t.dispute.info.disputeStatus}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activeDispute.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(activeDispute.status)}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text variant="bodyMedium" style={styles.label}>
            {t.dispute.info.filedBy}
          </Text>
          <Text variant="bodyMedium" style={styles.value}>
            {filedByName}
          </Text>
        </View>

        <View style={styles.info}>
          <Text variant="bodyMedium" style={styles.label}>
            {t.dispute.info.reason}
          </Text>
          <Text variant="bodyMedium" style={styles.value}>
            {activeDispute.reason_label || REASON_LABELS[activeDispute.reason] || activeDispute.reason}
          </Text>
        </View>

        {activeDispute.description && (
          <View style={styles.descriptionSection}>
            <Text variant="bodyMedium" style={styles.label}>
              {t.dispute.info.theirComplaint}
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {activeDispute.description}
            </Text>
          </View>
        )}

        {/* Show response if already submitted */}
        {activeDispute.response_description && (
          <View style={styles.responseSection}>
            <Text variant="bodyMedium" style={styles.responseHeader}>
              ✅ {t.dispute.info.responseSubmitted}
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {activeDispute.response_description}
            </Text>
          </View>
        )}

        {/* Response form - shown when user clicks respond */}
        {canRespond && showResponseForm && (
          <View style={styles.responseFormContainer}>
            <Text variant="bodyMedium" style={styles.responseFormTitle}>
              📝 {t.dispute.responseForm.title}
            </Text>
            <Text variant="bodySmall" style={{ color: themeColors.textSecondary, marginBottom: 12 }}>
              {t.dispute.responseForm.subtitle}
            </Text>
            <TextInput
              mode="outlined"
              placeholder={t.dispute.responseForm.placeholder}
              value={responseText}
              onChangeText={setResponseText}
              multiline
              numberOfLines={5}
              style={styles.textInput}
              outlineColor={themeColors.border}
              activeOutlineColor={themeColors.primaryAccent}
              textColor={themeColors.text}
              placeholderTextColor={themeColors.textMuted}
              disabled={respondMutation.isPending}
            />
            <Text style={styles.characterCount}>
              {responseText.length} {t.dispute.responseForm.characterCount}
            </Text>
            <View style={styles.formButtons}>
              <Button 
                mode="outlined" 
                onPress={() => {
                  setShowResponseForm(false);
                  setResponseText('');
                }}
                style={styles.cancelButton}
                textColor={themeColors.textSecondary}
                disabled={respondMutation.isPending}
              >
                {t.dispute.responseForm.cancelButton}
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSubmitResponse}
                buttonColor="#ef4444"
                textColor="#fff"
                disabled={respondMutation.isPending || responseText.trim().length < 20}
                loading={respondMutation.isPending}
              >
                {t.dispute.responseForm.submitButton}
              </Button>
            </View>
          </View>
        )}

        {/* Show respond button if user can respond and form is not shown */}
        {canRespond && !showResponseForm && (
          <View style={styles.respondNotice}>
            <Text variant="bodySmall" style={styles.respondText}>
              ⚠️ {t.dispute.notices.respondNotice}
            </Text>
            <Button 
              mode="contained" 
              onPress={() => setShowResponseForm(true)}
              buttonColor="#ef4444"
              textColor="#fff"
              style={styles.respondButton}
            >
              {t.dispute.notices.respondButton}
            </Button>
          </View>
        )}

        {/* Show waiting notice if user filed the dispute */}
        {isFiledByMe && activeDispute.status === 'open' && !activeDispute.response_description && (
          <View style={styles.reviewNotice}>
            <Text variant="bodySmall" style={styles.reviewText}>
              ⏳ {t.dispute.notices.waitingNotice}
            </Text>
          </View>
        )}

        {activeDispute.status === 'under_review' && (
          <View style={styles.reviewNotice}>
            <Text variant="bodySmall" style={styles.reviewText}>
              ℹ️ {t.dispute.notices.underReviewNotice}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}
