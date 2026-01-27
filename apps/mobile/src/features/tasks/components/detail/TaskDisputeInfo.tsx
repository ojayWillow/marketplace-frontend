import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getTaskDisputes, useAuthStore, type Dispute } from '@marketplace/shared';

interface TaskDisputeInfoProps {
  taskId: number;
}

export function TaskDisputeInfo({ taskId }: TaskDisputeInfoProps) {
  const { user } = useAuthStore();

  // Fetch disputes for this task
  const { data, isLoading } = useQuery({
    queryKey: ['taskDisputes', taskId],
    queryFn: () => getTaskDisputes(taskId),
    enabled: taskId > 0,
  });

  if (isLoading || !data || data.disputes.length === 0) {
    return null;
  }

  // Get the most recent open/under_review dispute
  const activeDispute = data.disputes.find(
    (d: Dispute) => d.status === 'open' || d.status === 'under_review'
  );

  if (!activeDispute) {
    return null;
  }

  const isFiledByMe = activeDispute.filed_by_id === user?.id;
  const canRespond = !isFiledByMe && !activeDispute.response_description;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#ef4444';
      case 'under_review':
        return '#f59e0b';
      case 'resolved':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Dispute Filed';
      case 'under_review':
        return 'Under Review';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

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
            {isFiledByMe ? 'You' : activeDispute.filed_by_name}
          </Text>
        </View>

        <View style={styles.info}>
          <Text variant="bodyMedium" style={styles.label}>
            Reason:
          </Text>
          <Text variant="bodyMedium" style={styles.value}>
            {activeDispute.reason_label}
          </Text>
        </View>

        <View style={styles.info}>
          <Text variant="bodyMedium" style={styles.label}>
            Description:
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {activeDispute.description}
          </Text>
        </View>

        {activeDispute.response_description && (
          <View style={[styles.info, styles.responseSection]}>
            <Text variant="bodyMedium" style={styles.label}>
              Response from {isFiledByMe ? activeDispute.filed_against_name : 'you'}:
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {activeDispute.response_description}
            </Text>
          </View>
        )}

        {canRespond && (
          <Button
            mode="contained"
            onPress={() => router.push(`/task/${taskId}/dispute/${activeDispute.id}/respond`)}
            style={styles.respondButton}
          >
            Add Your Response
          </Button>
        )}

        {activeDispute.status === 'under_review' && (
          <View style={styles.reviewNotice}>
            <Text variant="bodySmall" style={styles.reviewText}>
              ℹ️ Both sides have shared their stories. Support is reviewing this dispute.
            </Text>
          </View>
        )}

        <Button
          mode="text"
          onPress={() => router.push(`/task/${taskId}/dispute/${activeDispute.id}`)}
          style={styles.viewButton}
        >
          View Full Details
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderColor: '#ef4444',
    borderWidth: 2,
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
    color: '#374151',
    marginBottom: 4,
  },
  value: {
    color: '#6b7280',
  },
  description: {
    color: '#6b7280',
    lineHeight: 20,
  },
  responseSection: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  respondButton: {
    marginTop: 16,
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
  viewButton: {
    marginTop: 8,
  },
});
