import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Appbar, Card, Button, ActivityIndicator, Chip, Divider, Menu } from 'react-native-paper';
import { router } from 'expo-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllDisputes, resolveDispute, useAuthStore, type Dispute } from '@marketplace/shared';
import { format } from 'date-fns';
import { useThemeStore } from '../../../src/stores/themeStore';
import { colors } from '../../../src/theme';

type FilterValue = 'all' | 'open' | 'under_review' | 'resolved';

export default function AdminDisputesScreen() {
  const { user } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterValue>('all');

  // Check admin access
  const isAdmin = user?.is_admin || user?.role === 'admin';

  // Fetch all disputes (admin only)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminDisputes', filter],
    queryFn: () => getAllDisputes(filter === 'all' ? undefined : filter),
    enabled: isAdmin,
  });

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: ({ disputeId, resolution, notes }: { disputeId: number; resolution: string; notes: string }) => 
      resolveDispute(disputeId, resolution, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDisputes'] });
      Alert.alert('Success', 'Dispute resolved successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to resolve dispute');
    },
  });

  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} edges={['top']}>
        <Appbar.Header style={{ backgroundColor: themeColors.card }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Admin Disputes" titleStyle={{ color: themeColors.text }} />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text style={{ color: themeColors.text }}>Access Denied: Admin only</Text>
        </View>
      </SafeAreaView>
    );
  }

  const disputes = data?.disputes || [];

  const handleResolve = (dispute: Dispute) => {
    Alert.alert(
      'Resolve Dispute',
      `Choose resolution for dispute #${dispute.id}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Refund Creator',
          onPress: () => promptNotes(dispute.id, 'refund'),
        },
        {
          text: 'Pay Worker',
          onPress: () => promptNotes(dispute.id, 'pay_worker'),
        },
        {
          text: 'Partial',
          onPress: () => promptNotes(dispute.id, 'partial'),
        },
        {
          text: 'Cancel Task',
          onPress: () => promptNotes(dispute.id, 'cancelled'),
          style: 'destructive',
        },
      ]
    );
  };

  const promptNotes = (disputeId: number, resolution: string) => {
    Alert.prompt(
      'Resolution Notes',
      'Add notes explaining your decision (optional):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: (notes) => {
            resolveMutation.mutate({
              disputeId,
              resolution,
              notes: notes || '',
            });
          },
        },
      ],
      'plain-text'
    );
  };

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

  const renderDispute = ({ item }: { item: Dispute }) => (
    <Card style={styles.disputeCard} mode="outlined">
      <Card.Content>
        <View style={styles.disputeHeader}>
          <Text variant="titleMedium" style={[styles.disputeTitle, { color: themeColors.text }]}>
            Dispute #{item.id}
          </Text>
          <Chip
            style={{ backgroundColor: getStatusColor(item.status) }}
            textStyle={{ color: '#fff', fontSize: 11, fontWeight: '600' }}
          >
            {getStatusLabel(item.status)}
          </Chip>
        </View>

        <Text variant="bodyMedium" style={[styles.taskTitle, { color: themeColors.textSecondary }]}>
          Task: {item.task_title}
        </Text>

        <View style={styles.partiesSection}>
          <View style={styles.partyRow}>
            <Text style={[styles.partyLabel, { color: themeColors.textSecondary }]}>Filed by:</Text>
            <Text style={[styles.partyName, { color: themeColors.text }]}>{item.filed_by_name}</Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={[styles.partyLabel, { color: themeColors.textSecondary }]}>Against:</Text>
            <Text style={[styles.partyName, { color: themeColors.text }]}>{item.filed_against_name}</Text>
          </View>
        </View>

        <View style={styles.reasonRow}>
          <Text style={[styles.reasonLabel, { color: themeColors.textSecondary }]}>Reason:</Text>
          <Text style={[styles.reason, { color: '#ef4444' }]}>{item.reason_label}</Text>
        </View>

        <Text variant="bodySmall" style={[styles.date, { color: themeColors.textMuted }]}>
          Filed: {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
        </Text>

        {item.response_description && (
          <View style={[styles.responseIndicator, { backgroundColor: themeColors.backgroundSecondary }]}>
            <Text style={[styles.responseText, { color: themeColors.textSecondary }]}>💬 Response received</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            mode="text"
            onPress={() => router.push(`/task/${item.task_id}/dispute/${item.id}`)}
            style={styles.viewButton}
          >
            View Details
          </Button>
          {item.status !== 'resolved' && (
            <Button
              mode="contained"
              onPress={() => handleResolve(item)}
              style={styles.resolveButton}
              loading={resolveMutation.isPending}
            >
              Resolve
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} edges={['top']}>
      <Appbar.Header style={{ backgroundColor: themeColors.card }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Manage Disputes" titleStyle={{ color: themeColors.text }} />
        <Appbar.Action icon="refresh" onPress={() => refetch()} />
      </Appbar.Header>

      {/* Filter Chips */}
      <View style={[styles.filterContainer, { backgroundColor: themeColors.card }]}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={styles.filterChip}
          mode={filter === 'all' ? 'flat' : 'outlined'}
        >
          All
        </Chip>
        <Chip
          selected={filter === 'open'}
          onPress={() => setFilter('open')}
          style={styles.filterChip}
          mode={filter === 'open' ? 'flat' : 'outlined'}
        >
          Open
        </Chip>
        <Chip
          selected={filter === 'under_review'}
          onPress={() => setFilter('under_review')}
          style={styles.filterChip}
          mode={filter === 'under_review' ? 'flat' : 'outlined'}
        >
          Review
        </Chip>
        <Chip
          selected={filter === 'resolved'}
          onPress={() => setFilter('resolved')}
          style={styles.filterChip}
          mode={filter === 'resolved' ? 'flat' : 'outlined'}
        >
          Resolved
        </Chip>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : disputes.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="titleLarge" style={{ color: themeColors.textMuted, marginBottom: 8 }}>
            ⚖️
          </Text>
          <Text style={{ color: themeColors.textSecondary }}>No disputes found</Text>
        </View>
      ) : (
        <FlatList
          data={disputes}
          keyExtractor={(item) => `dispute-${item.id}`}
          renderItem={renderDispute}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    height: 32,
  },
  listContent: {
    padding: 16,
  },
  disputeCard: {
    marginBottom: 16,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  disputeTitle: {
    fontWeight: 'bold',
  },
  taskTitle: {
    marginBottom: 12,
  },
  partiesSection: {
    marginBottom: 12,
  },
  partyRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  partyLabel: {
    width: 80,
    fontSize: 14,
  },
  partyName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  reasonRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reasonLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  reason: {
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    marginBottom: 12,
  },
  responseIndicator: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  responseText: {
    fontSize: 13,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  viewButton: {
    flex: 1,
  },
  resolveButton: {
    flex: 1,
  },
});
