import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getTaskDisputes, useAuthStore, type Dispute } from '@marketplace/shared';
import { useThemeStore } from '../../../../stores/themeStore';
import { colors } from '../../../../theme';

interface TaskDisputeInfoProps {
  taskId: number;
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

export function TaskDisputeInfo({ taskId }: TaskDisputeInfoProps) {
  const { user } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  // Fetch disputes for this task
  const { data, isLoading, error } = useQuery({
    queryKey: ['taskDisputes', taskId],
    queryFn: () => getTaskDisputes(taskId),
    enabled: taskId > 0,
    retry: false,
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
  const canRespond = !isFiledByMe && activeDispute.status === 'open' && !activeDispute.response_description;

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
        return 'Open';
      case 'under_review':
        return 'Under Review';
      case 'resolved':
        return 'Resolved';
      default:
        return status.replace('_', ' ').toUpperCase();
    }
  };

  // Use filed_by_name if available, otherwise 'Unknown'
  const filedByName = isFiledByMe ? 'You' : (activeDispute.filed_by_name || 'Unknown');

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
    respondButton: {
      marginTop: 16,
      backgroundColor: themeColors.primaryAccent,
    },
    reviewNotice: {
      backgroundColor: '#dbeafe',
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
    },
    reviewText: {
      color: '#1e40af',
      lineHeight: 18,
    },
  });

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            ⚠️ Dispute Status
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activeDispute.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(activeDispute.status)}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text variant="bodyMedium" style={styles.label}>
            Filed by:
          </Text>
          <Text variant="bodyMedium" style={styles.value}>
            {filedByName}
          </Text>
        </View>

        <View style={styles.info}>
          <Text variant="bodyMedium" style={styles.label}>
            Reason:
          </Text>
          <Text variant="bodyMedium" style={styles.value}>
            {activeDispute.reason_label || REASON_LABELS[activeDispute.reason] || activeDispute.reason}
          </Text>
        </View>

        {activeDispute.status === 'under_review' && (
          <View style={styles.reviewNotice}>
            <Text variant="bodySmall" style={styles.reviewText}>
              ℹ️ Both sides have shared their stories. Support is reviewing this dispute.
            </Text>
          </View>
        )}

        <Button
          mode="contained"
          onPress={() => router.push(`/dispute/${activeDispute.id}`)}
          style={styles.respondButton}
        >
          {canRespond ? 'View & Respond to Dispute' : 'View Dispute Details'}
        </Button>
      </Card.Content>
    </Card>
  );
}
