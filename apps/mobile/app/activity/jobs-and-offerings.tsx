import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Appbar, SegmentedButtons, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, getCreatedTasks, getMyApplications, getMyTasks, getMyOfferings } from '@marketplace/shared';
import TaskCard from '../../components/TaskCard';
import OfferingCard from '../../components/OfferingCard';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

type TabValue = 'requests' | 'work' | 'services';
type FilterValue = 'all' | 'active' | 'done';

export default function JobsAndOfferingsScreen() {
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

  // Combine applications + assigned for "My Work" tab
  const myWork = [...applications, ...assignedJobs];

  // Apply filters
  const getFilteredData = (data: any[]) => {
    if (filter === 'all') return data;
    if (filter === 'active') {
      return data.filter((item: any) => {
        const status = item.status || item.task?.status;
        return status === 'open' || status === 'in_progress' || status === 'pending' || status === 'active';
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

  const data = getActiveData();

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
              label: 'My Work',
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
          keyExtractor={(item) => `${activeTab}-${item.id}`}
          renderItem={({ item }) => {
            if (activeTab === 'services') {
              return <OfferingCard offering={item} />;
            }
            // For work tab, check if item is an application with nested task
            if (activeTab === 'work' && item.task) {
              return <TaskCard task={item.task} />;
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
});
