import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Appbar, Chip, Badge } from 'react-native-paper';
import { router } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, getCreatedTasks, getMyApplications, getMyTasks, getMyOfferings, type Task } from '@marketplace/shared';
import TaskCard from '../../components/TaskCard';
import OfferingCard from '../../components/OfferingCard';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';

type TabValue = 'requests' | 'work' | 'services';
type FilterValue = 'all' | 'active' | 'done';

// Helper to determine if a task needs action from the current user
const needsAction = (task: Task, userId: number, isCreator: boolean): boolean => {
  if (task.status === 'disputed') return true;
  
  if (isCreator) {
    // Creator needs to: confirm completion, review applicants
    if (task.status === 'pending_confirmation') return true;
    if (task.status === 'open' && (task.pending_applications_count ?? 0) > 0) return true;
  } else {
    // Worker needs to: work on assigned/in-progress tasks
    if (task.status === 'assigned') return true;
    if (task.status === 'in_progress') return true;
  }
  
  return false;
};

// Get action priority (lower = higher priority, shown first)
const getActionPriority = (task: Task, userId: number, isCreator: boolean): number => {
  if (task.status === 'disputed') return 0; // Highest priority
  if (isCreator && task.status === 'pending_confirmation') return 1;
  if (isCreator && task.status === 'open' && (task.pending_applications_count ?? 0) > 0) return 2;
  if (task.status === 'in_progress') return 3;
  if (task.status === 'assigned') return 4;
  if (task.status === 'open') return 5;
  if (task.status === 'completed') return 6;
  return 10; // Default low priority
};

export default function JobsAndOfferingsScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const [activeTab, setActiveTab] = useState<TabValue>('requests');
  const [filter, setFilter] = useState<FilterValue>('all');

  // Fetch data for all tabs
  const { data: postedJobsData, isLoading: isLoadingPosted } = useQuery({
    queryKey: ['myPostedTasks'],
    queryFn: getCreatedTasks,
    enabled: !!user,
  });

  const { data: applicationsData, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['myApplications'],
    queryFn: getMyApplications,
    enabled: !!user,
  });

  const { data: assignedJobsData, isLoading: isLoadingAssigned } = useQuery({
    queryKey: ['myAssignedTasks'],
    queryFn: getMyTasks,
    enabled: !!user,
  });

  const { data: myServicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: ['myOfferings'],
    queryFn: getMyOfferings,
    enabled: !!user,
  });

  // Extract arrays from API responses
  const postedJobs = postedJobsData?.tasks || [];
  const applications = applicationsData?.applications || [];
  const assignedJobs = assignedJobsData?.tasks || [];
  const myServices = myServicesData?.offerings || [];

  // Combine applications + assigned for "My Work" tab with type markers
  // FIX: Filter out applications where the task is already in assignedJobs to prevent duplicates
  const myWork = useMemo(() => {
    // Create a Set of assigned task IDs for fast lookup
    const assignedTaskIds = new Set(assignedJobs.map((task: any) => task.id));
    
    // Filter out applications whose task is already in assignedJobs
    const filteredApplications = applications.filter((app: any) => {
      const taskId = app.task?.id || app.task_id;
      return !assignedTaskIds.has(taskId);
    });
    
    return [
      ...filteredApplications.map((item: any) => ({ ...item, _type: 'application' })),
      ...assignedJobs.map((item: any) => ({ ...item, _type: 'task' }))
    ];
  }, [applications, assignedJobs]);

  // Count actions needed for each tab
  const actionCounts = useMemo(() => {
    const requestsCount = postedJobs.filter((task: Task) => 
      needsAction(task, user?.id || 0, true)
    ).length;

    const workCount = myWork.filter((item: any) => {
      const task = item._type === 'application' ? item.task : item;
      if (!task) return false;
      return needsAction(task, user?.id || 0, false);
    }).length;

    return { requests: requestsCount, work: workCount, services: 0 };
  }, [postedJobs, myWork, user?.id]);

  // Sort function - action-needed items first
  const sortByActionPriority = (data: any[], isCreator: boolean) => {
    return [...data].sort((a, b) => {
      const taskA = a._type === 'application' ? a.task : a;
      const taskB = b._type === 'application' ? b.task : b;
      if (!taskA || !taskB) return 0;
      
      const priorityA = getActionPriority(taskA, user?.id || 0, isCreator);
      const priorityB = getActionPriority(taskB, user?.id || 0, isCreator);
      
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      // Secondary sort by date (newest first)
      const dateA = new Date(taskA.created_at || 0).getTime();
      const dateB = new Date(taskB.created_at || 0).getTime();
      return dateB - dateA;
    });
  };

  // Apply filters
  const getFilteredData = (data: any[]) => {
    if (filter === 'all') return data;
    if (filter === 'active') {
      return data.filter((item: any) => {
        const status = item.status || item.task?.status;
        return ['open', 'in_progress', 'pending', 'active', 'assigned', 'pending_confirmation', 'disputed'].includes(status);
      });
    }
    if (filter === 'done') {
      return data.filter((item: any) => {
        const status = item.status || item.task?.status;
        return status === 'completed' || status === 'closed';
      });
    }
    return data;
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'requests': 
        return sortByActionPriority(getFilteredData(postedJobs), true);
      case 'work': 
        return sortByActionPriority(getFilteredData(myWork), false);
      case 'services': 
        return myServices; // No sorting/filters for services
      default: 
        return [];
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
      case 'requests': return t.activity.postedJobs.empty.subtitle;
      case 'work': return t.activity.myJobs.empty.subtitle;
      case 'services': return t.activity.myServices.empty.subtitle;
      default: return t.activity.noActivity;
    }
  };

  const data = getActiveData();

  // Tab button component with badge at corner OUTSIDE
  const TabButton = ({ 
    value, 
    label, 
    badgeCount 
  }: { 
    value: TabValue; 
    label: string; 
    badgeCount: number;
  }) => {
    const isActive = activeTab === value;
    return (
      <View style={styles.tabButtonWrapper}>
        <Chip
          selected={isActive}
          onPress={() => {
            setActiveTab(value);
            setFilter('all');
          }}
          style={[
            styles.tabChip,
            isActive && { backgroundColor: themeColors.primaryAccent }
          ]}
          textStyle={{ color: isActive ? '#fff' : themeColors.text }}
          mode={isActive ? 'flat' : 'outlined'}
        >
          {label}
        </Chip>
        {badgeCount > 0 && (
          <View style={styles.cornerBadge} pointerEvents="none">
            <View style={styles.badgeCircle}>
              <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} edges={['top']}>
      <Appbar.Header style={{ backgroundColor: themeColors.card }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t.activity.jobsAndOfferings.title} titleStyle={{ color: themeColors.text }} />
      </Appbar.Header>

      {/* Main Tabs with Badges */}
      <View style={[styles.tabContainer, { backgroundColor: themeColors.card }]}>
        <View style={styles.tabsRow}>
          <TabButton value="requests" label={t.activity.jobsAndOfferings.tabs.postedJobs} badgeCount={actionCounts.requests} />
          <TabButton value="work" label={t.activity.jobsAndOfferings.tabs.myJobs} badgeCount={actionCounts.work} />
          <TabButton value="services" label={t.activity.jobsAndOfferings.tabs.myServices} badgeCount={actionCounts.services} />
        </View>
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
            {t.common.all}
          </Chip>
          <Chip
            selected={filter === 'active'}
            onPress={() => setFilter('active')}
            style={styles.filterChip}
            mode={filter === 'active' ? 'flat' : 'outlined'}
          >
            {t.common.active}
          </Chip>
          <Chip
            selected={filter === 'done'}
            onPress={() => setFilter('done')}
            style={styles.filterChip}
            mode={filter === 'done' ? 'flat' : 'outlined'}
          >
            {t.common.done}
          </Chip>
        </View>
      )}

      {/* Content */}
      {isLoading() ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: themeColors.textSecondary }}>{t.activity.loading}</Text>
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
            // For work tab, check if item is an application with nested task
            // FIX: Add has_applied flag so TaskCard shows the "Applied" badge
            if (activeTab === 'work' && item._type === 'application' && item.task) {
              const taskWithAppliedFlag = { ...item.task, has_applied: true };
              return <TaskCard task={taskWithAppliedFlag} />;
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
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButtonWrapper: {
    flex: 1,
    position: 'relative',
  },
  tabChip: {
    justifyContent: 'center',
  },
  cornerBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    zIndex: 10,
  },
  badgeCircle: {
    backgroundColor: '#ef4444',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
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
});
