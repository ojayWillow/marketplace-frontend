import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Appbar, SegmentedButtons, Chip, Card, Badge } from 'react-native-paper';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, getCreatedTasks, getMyApplications, getMyTasks, getMyOfferings } from '@marketplace/shared';
import TaskCard from '../../components/TaskCard';
import OfferingCard from '../../components/OfferingCard';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

type TabValue = 'requests' | 'work' | 'services';
type FilterValue = 'all' | 'active' | 'done';

// Status groups for filtering
const ACTIVE_STATUSES = ['open', 'assigned', 'accepted', 'in_progress', 'pending_confirmation', 'pending', 'active', 'disputed'];
const DONE_STATUSES = ['completed', 'closed', 'cancelled', 'rejected'];

export default function JobsAndOfferingsScreen() {
  const { user } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const [activeTab, setActiveTab] = useState<TabValue>('requests');
  const [filter, setFilter] = useState<FilterValue>('all');

  // Fetch data for all tabs
  const { data: postedJobsData, isLoading: isLoadingPosted, refetch: refetchPosted } = useQuery({
    queryKey: ['myPostedTasks'],
    queryFn: getCreatedTasks,
    enabled: !!user,
  });

  const { data: applicationsData, isLoading: isLoadingApplications, refetch: refetchApplications } = useQuery({
    queryKey: ['myApplications'],
    queryFn: getMyApplications,
    enabled: !!user,
  });

  const { data: assignedJobsData, isLoading: isLoadingAssigned, refetch: refetchAssigned } = useQuery({
    queryKey: ['myAssignedTasks'],
    queryFn: getMyTasks,
    enabled: !!user,
  });

  const { data: myServicesData, isLoading: isLoadingServices, refetch: refetchServices } = useQuery({
    queryKey: ['myOfferings'],
    queryFn: getMyOfferings,
    enabled: !!user,
  });

  // Extract arrays from API responses
  const postedJobs = postedJobsData?.tasks || [];
  const applications = applicationsData?.applications || [];
  const assignedJobs = assignedJobsData?.tasks || [];
  const myServices = myServicesData?.offerings || [];

  // Get the set of task IDs that are already assigned (to avoid duplicates)
  const assignedTaskIds = new Set(assignedJobs.map((t: any) => t.id));

  // Filter out applications for tasks that are now assigned to us
  const pendingApplications = applications.filter((app: any) => {
    // If this application's task is in our assigned list, don't show the application
    if (app.task_id && assignedTaskIds.has(app.task_id)) return false;
    // Only show pending applications (not rejected ones)
    return app.status === 'pending';
  });

  // Combine: assigned jobs (main work) + pending applications (waiting)
  const myWork = [
    ...assignedJobs.map((item: any) => ({ ...item, _type: 'task', _workStatus: getWorkStatus(item.status) })),
    ...pendingApplications.map((item: any) => ({ ...item, _type: 'application', _workStatus: 'pending_app' }))
  ];

  // Sort: active jobs first, then by date
  myWork.sort((a: any, b: any) => {
    // Priority: in_progress > assigned > pending_confirmation > disputed > pending_app > completed
    const priority: Record<string, number> = {
      'in_progress': 1,
      'assigned': 2,
      'pending_confirmation': 3,
      'disputed': 4,
      'pending_app': 5,
      'completed': 6,
      'cancelled': 7,
    };
    const aPriority = priority[a._workStatus] || 10;
    const bPriority = priority[b._workStatus] || 10;
    if (aPriority !== bPriority) return aPriority - bPriority;
    // Then by date (newest first)
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  function getWorkStatus(status: string): string {
    return status; // Pass through task status
  }

  // Apply filters
  const getFilteredData = (data: any[]) => {
    if (filter === 'all') return data;
    if (filter === 'active') {
      return data.filter((item: any) => {
        const status = item._workStatus || item.status || item.task?.status;
        return ACTIVE_STATUSES.includes(status);
      });
    }
    if (filter === 'done') {
      return data.filter((item: any) => {
        const status = item._workStatus || item.status || item.task?.status;
        return DONE_STATUSES.includes(status);
      });
    }
    return data;
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'requests': return getFilteredData(postedJobs);
      case 'work': return getFilteredData(myWork);
      case 'services': return myServices; // No filters for services
      default: return [];
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case 'requests': return isLoadingPosted;
      case 'work': return isLoadingApplications || isLoadingAssigned;
      case 'services': return isLoadingServices;
      default: return false;
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'requests': return 'You haven\'t posted any job requests yet';
      case 'work': return 'You haven\'t applied to or started any work yet';
      case 'services': return 'You haven\'t created any service offerings yet';
      default: return 'No items found';
    }
  };

  // Count active items for badge
  const activeWorkCount = myWork.filter((item: any) => {
    const status = item._workStatus;
    return ['in_progress', 'assigned', 'pending_confirmation', 'disputed'].includes(status);
  }).length;

  const data = getActiveData();

  const renderWorkItem = ({ item }: { item: any }) => {
    if (item._type === 'application') {
      // Show pending application with its task
      const task = item.task;
      if (!task) return null;
      return (
        <Card 
          style={[styles.workCard, { backgroundColor: themeColors.card }]}
          onPress={() => router.push(`/task/${task.id}`)}
        >
          <Card.Content>
            <View style={styles.workCardHeader}>
              <View style={[styles.statusBadge, styles.pendingBadge]}>
                <Text style={styles.statusBadgeText}>⏳ Application Pending</Text>
              </View>
            </View>
            <Text variant="titleMedium" style={[styles.workCardTitle, { color: themeColors.text }]} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={[styles.workCardCategory, { color: themeColors.primary }]}>{task.category}</Text>
            <Text style={[styles.workCardDesc, { color: themeColors.textSecondary }]} numberOfLines={2}>
              {task.description}
            </Text>
            <View style={styles.workCardFooter}>
              <Text style={[styles.workCardPrice, { color: themeColors.primary }]}>
                €{task.budget?.toFixed(0) || item.proposed_price?.toFixed(0) || '0'}
              </Text>
              <Text style={[styles.workCardClient, { color: themeColors.textMuted }]}>
                Client: {task.creator_name || 'Anonymous'}
              </Text>
            </View>
          </Card.Content>
        </Card>
      );
    }

    // Show assigned task with status
    const statusInfo = getStatusInfo(item.status);
    return (
      <Card 
        style={[
          styles.workCard, 
          { backgroundColor: themeColors.card },
          statusInfo.isActive && styles.activeWorkCard,
          item.status === 'disputed' && styles.disputedWorkCard,
        ]}
        onPress={() => router.push(`/task/${item.id}`)}
      >
        <Card.Content>
          <View style={styles.workCardHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <Text style={[styles.statusBadgeText, { color: statusInfo.textColor }]}>{statusInfo.label}</Text>
            </View>
          </View>
          <Text variant="titleMedium" style={[styles.workCardTitle, { color: themeColors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.workCardCategory, { color: themeColors.primary }]}>{item.category}</Text>
          <Text style={[styles.workCardDesc, { color: themeColors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.workCardFooter}>
            <Text style={[styles.workCardPrice, { color: themeColors.primary }]}>
              €{item.budget?.toFixed(0) || '0'}
            </Text>
            <Text style={[styles.workCardClient, { color: themeColors.textMuted }]}>
              Client: {item.creator_name || 'Anonymous'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  function getStatusInfo(status: string): { label: string; bgColor: string; textColor: string; isActive: boolean } {
    switch (status) {
      case 'assigned':
        return { label: '🟢 Ready to Start', bgColor: '#dcfce7', textColor: '#166534', isActive: true };
      case 'in_progress':
        return { label: '🟡 In Progress', bgColor: '#fef3c7', textColor: '#92400e', isActive: true };
      case 'pending_confirmation':
        return { label: '🟣 Awaiting Confirmation', bgColor: '#f3e8ff', textColor: '#7c3aed', isActive: true };
      case 'disputed':
        return { label: '⚠️ Under Review', bgColor: '#fef3c7', textColor: '#d97706', isActive: true };
      case 'completed':
        return { label: '✅ Completed', bgColor: '#f3f4f6', textColor: '#374151', isActive: false };
      case 'cancelled':
        return { label: '❌ Cancelled', bgColor: '#fee2e2', textColor: '#991b1b', isActive: false };
      default:
        return { label: status, bgColor: '#f3f4f6', textColor: '#374151', isActive: false };
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} edges={['top']}>
      <Appbar.Header style={{ backgroundColor: themeColors.card }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Jobs & Offerings" titleStyle={{ color: themeColors.text }} />
      </Appbar.Header>

      {/* Main Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: themeColors.card }]}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as TabValue);
            setFilter('all'); // Reset filter when switching tabs
          }}
          buttons={[
            {
              value: 'requests',
              label: 'Requests',
            },
            {
              value: 'work',
              label: `My Work${activeWorkCount > 0 ? ` (${activeWorkCount})` : ''}`,
            },
            {
              value: 'services',
              label: 'Services',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Filter Chips (only for requests and work tabs) */}
      {(activeTab === 'requests' || activeTab === 'work') && (
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
            selected={filter === 'active'}
            onPress={() => setFilter('active')}
            style={styles.filterChip}
            mode={filter === 'active' ? 'flat' : 'outlined'}
          >
            Active
          </Chip>
          <Chip
            selected={filter === 'done'}
            onPress={() => setFilter('done')}
            style={styles.filterChip}
            mode={filter === 'done' ? 'flat' : 'outlined'}
          >
            Done
          </Chip>
        </View>
      )}

      {/* Content */}
      {isLoading() ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: themeColors.textSecondary }}>Loading...</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text variant="titleLarge" style={{ color: themeColors.textMuted, marginBottom: 8 }}>
            📦
          </Text>
          <Text style={{ color: themeColors.textSecondary }}>{getEmptyMessage()}</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => {
            // Create unique keys based on type and ID
            if (activeTab === 'work') {
              return item._type === 'application' ? `app-${item.id}` : `task-${item.id}`;
            }
            return `${activeTab}-${item.id}`;
          }}
          renderItem={({ item }) => {
            if (activeTab === 'services') {
              return <OfferingCard offering={item} />;
            }
            if (activeTab === 'work') {
              return renderWorkItem({ item });
            }
            return <TaskCard task={item} />;
          }}
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
  tabContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  segmentedButtons: {
    // Custom styling if needed
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    height: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    padding: 16,
  },
  // Work card styles
  workCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  activeWorkCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  disputedWorkCard: {
    borderLeftColor: '#f59e0b',
  },
  workCardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#e0f2fe',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369a1',
  },
  workCardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  workCardCategory: {
    fontSize: 13,
    marginBottom: 6,
  },
  workCardDesc: {
    marginBottom: 12,
    lineHeight: 20,
  },
  workCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workCardPrice: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  workCardClient: {
    fontSize: 13,
  },
});
