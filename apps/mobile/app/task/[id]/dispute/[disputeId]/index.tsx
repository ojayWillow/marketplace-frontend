import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Text, Button, ActivityIndicator, Card, Divider } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { getDispute, useAuthStore } from '@marketplace/shared';
import { format } from 'date-fns';

export default function DisputeDetailsScreen() {
  const { id, disputeId } = useLocalSearchParams<{ id: string; disputeId: string }>();
  const taskId = parseInt(id || '0', 10);
  const disputeIdNum = parseInt(disputeId || '0', 10);
  const { user } = useAuthStore();

  // Fetch dispute details
  const { data, isLoading } = useQuery({
    queryKey: ['dispute', disputeIdNum],
    queryFn: () => getDispute(disputeIdNum),
    enabled: disputeIdNum > 0,
  });

  const dispute = data?.dispute;

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

  const isFiledByMe = dispute.filed_by_id === user?.id;
  const canRespond = !isFiledByMe && !dispute.response_description;

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
        return 'Open';
      case 'under_review':
        return 'Under Review';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Dispute Details',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <View style={styles.statusHeader}>
              <Text variant="headlineSmall" style={styles.title}>
                Dispute #{dispute.id}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dispute.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(dispute.status)}</Text>
              </View>
            </View>
            <Text variant="bodyMedium" style={styles.taskTitle}>
              Task: {dispute.task_title}
            </Text>
            <Text variant="bodySmall" style={styles.date}>
              Filed: {format(new Date(dispute.created_at), 'MMM d, yyyy h:mm a')}
            </Text>
          </Card.Content>
        </Card>

        {/* Original Dispute */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              🚩 Original Dispute
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.field}>
              <Text variant="bodySmall" style={styles.label}>
                Filed by:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {isFiledByMe ? 'You' : dispute.filed_by_name}
              </Text>
            </View>

            <View style={styles.field}>
              <Text variant="bodySmall" style={styles.label}>
                Against:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {isFiledByMe ? dispute.filed_against_name : 'You'}
              </Text>
            </View>

            <View style={styles.field}>
              <Text variant="bodySmall" style={styles.label}>
                Reason:
              </Text>
              <Text variant="bodyMedium" style={[styles.value, styles.reason]}>
                {dispute.reason_label}
              </Text>
            </View>

            <View style={styles.field}>
              <Text variant="bodySmall" style={styles.label}>
                Description:
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                {dispute.description}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Response (if exists) */}
        {dispute.response_description && (
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                💬 Response
              </Text>
              <Divider style={styles.divider} />
              
              <View style={styles.field}>
                <Text variant="bodySmall" style={styles.label}>
                  From:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {isFiledByMe ? dispute.filed_against_name : 'You'}
                </Text>
              </View>

              <View style={styles.field}>
                <Text variant="bodySmall" style={styles.label}>
                  Responded:
                </Text>
                <Text variant="bodySmall" style={styles.date}>
                  {format(new Date(dispute.responded_at!), 'MMM d, yyyy h:mm a')}
                </Text>
              </View>

              <View style={styles.field}>
                <Text variant="bodySmall" style={styles.label}>
                  Response:
                </Text>
                <Text variant="bodyMedium" style={styles.description}>
                  {dispute.response_description}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Resolution (if resolved) */}
        {dispute.status === 'resolved' && dispute.resolution && (
          <Card style={styles.card} mode="outlined">
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                ✅ Resolution
              </Text>
              <Divider style={styles.divider} />
              
              <View style={styles.field}>
                <Text variant="bodySmall" style={styles.label}>
                  Resolution:
                </Text>
                <Text variant="bodyMedium" style={[styles.value, styles.resolution]}>
                  {dispute.resolution.replace('_', ' ').toUpperCase()}
                </Text>
              </View>

              {dispute.resolution_notes && (
                <View style={styles.field}>
                  <Text variant="bodySmall" style={styles.label}>
                    Notes:
                  </Text>
                  <Text variant="bodyMedium" style={styles.description}>
                    {dispute.resolution_notes}
                  </Text>
                </View>
              )}

              <View style={styles.field}>
                <Text variant="bodySmall" style={styles.label}>
                  Resolved:
                </Text>
                <Text variant="bodySmall" style={styles.date}>
                  {format(new Date(dispute.resolved_at!), 'MMM d, yyyy h:mm a')}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        {canRespond && (
          <View style={styles.actionSection}>
            <Text variant="bodyMedium" style={styles.actionText}>
              You haven't responded yet. Share your side of the story:
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push(`/task/${taskId}/dispute/${disputeId}/respond`)}
              style={styles.actionButton}
            >
              Add My Response
            </Button>
          </View>
        )}

        {dispute.status === 'under_review' && (
          <Card style={[styles.card, styles.infoCard]} mode="outlined">
            <Card.Content>
              <Text variant="bodyMedium" style={styles.infoText}>
                ℹ️ Both sides have been heard. Support is reviewing this dispute and will reach out with a resolution.
              </Text>
              {data?.support_email && (
                <Text variant="bodySmall" style={styles.supportEmail}>
                  Support: {data.support_email}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        <Button
          mode="outlined"
          onPress={() => router.push(`/task/${taskId}`)}
          style={styles.backButton}
        >
          Back to Task
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
  card: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  taskTitle: {
    color: '#6b7280',
    marginBottom: 4,
  },
  date: {
    color: '#9ca3af',
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
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    color: '#111827',
  },
  reason: {
    fontWeight: '600',
    color: '#ef4444',
  },
  resolution: {
    fontWeight: '600',
    color: '#10b981',
  },
  description: {
    color: '#374151',
    lineHeight: 22,
  },
  actionSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionText: {
    marginBottom: 12,
    color: '#6b7280',
  },
  actionButton: {
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  infoText: {
    color: '#1e40af',
    lineHeight: 20,
  },
  supportEmail: {
    color: '#1e3a8a',
    marginTop: 8,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: 32,
  },
});
