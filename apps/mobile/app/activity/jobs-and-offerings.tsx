import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Appbar, SegmentedButtons } from 'react-native-paper';
import { router } from 'expo-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, getCreatedTasks, getMyApplications, getMyTasks, getMyOfferings } from '@marketplace/shared';
import TaskCard from '../../components/TaskCard';
import OfferingCard from '../../components/OfferingCard';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

type TabValue = 'posted' | 'applications' | 'assigned' | 'services';

export default function JobsAndOfferingsScreen() {
  const { user } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const [activeTab, setActiveTab] = useState<TabValue>('posted');

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

  const getActiveData = () => {
    switch (activeTab) {
      case 'posted': return postedJobs;
      case 'applications': return applications;
      case 'assigned': return assignedJobs;
      case 'services': return myServices;
      default: return [];
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case 'posted': return isLoadingPosted;
      case 'applications': return isLoadingApplications;
      case 'assigned': return isLoadingAssigned;
      case 'services': return isLoadingServices;
      default: return false;
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'posted': return 'You haven\'t posted any jobs yet';
      case 'applications': return 'You haven\'t applied to any jobs yet';
      case 'assigned': return 'No jobs assigned to you yet';
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

      {/* Segmented Buttons for Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: themeColors.card }]}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue)}
          buttons={[
            {
              value: 'posted',
              label: 'Posted',
              icon: '📋',
            },
            {
              value: 'applications',
              label: 'Applied',
              icon: '📨',
            },
            {
              value: 'assigned',
              label: 'Working',
              icon: '💼',
            },
            {
              value: 'services',
              label: 'Services',
              icon: '🛠️',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

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
            // For applications tab, the item is a TaskApplication with nested task
            if (activeTab === 'applications' && item.task) {
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
    paddingVertical: 12,
  },
  segmentedButtons: {
    // Custom styling if needed
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
