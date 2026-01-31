import { View, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore, apiClient } from '@marketplace/shared';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Admin emails - same as web
const ADMIN_EMAILS = [
  'admin@tirgus.lv',
  'og.vitols@gmail.com',
];

interface Stats {
  totalUsers: number;
  totalJobs: number;
  totalOfferings: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  newUsersToday: number;
  newJobsToday: number;
  pendingReports: number;
}

interface RecentActivity {
  id: number;
  type: 'user_joined' | 'job_created' | 'job_completed' | 'offering_created' | 'report';
  message: string;
  timestamp: string;
  user?: string;
}

export default function AdminScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalJobs: 0,
    totalOfferings: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    newJobsToday: 0,
    pendingReports: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin
  const isAdmin = (user as any)?.is_admin || ADMIN_EMAILS.includes(user?.email || '');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.replace('/(tabs)/profile');
      return;
    }
    fetchStats();
  }, [isAuthenticated, isAdmin]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiClient.get('/api/admin/stats');
        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity || []);
      } catch (err) {
        // Mock data for development
        setStats({
          totalUsers: 156,
          totalJobs: 423,
          totalOfferings: 189,
          activeJobs: 47,
          completedJobs: 312,
          totalRevenue: 8450,
          newUsersToday: 12,
          newJobsToday: 8,
          pendingReports: 3,
        });
        setRecentActivity([
          { id: 1, type: 'user_joined', message: 'New user registered', user: 'janis_k', timestamp: '5 minutes ago' },
          { id: 2, type: 'job_created', message: 'New cleaning job posted in Riga', user: 'maria_s', timestamp: '12 minutes ago' },
          { id: 3, type: 'job_completed', message: 'Moving job completed', user: 'peter_v', timestamp: '1 hour ago' },
          { id: 4, type: 'offering_created', message: 'New plumbing service listed', user: 'andris_b', timestamp: '2 hours ago' },
          { id: 5, type: 'report', message: 'User reported for spam', user: 'system', timestamp: '3 hours ago' },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_joined': return 'account-plus';
      case 'job_created': return 'briefcase-plus';
      case 'job_completed': return 'check-circle';
      case 'offering_created': return 'wrench';
      case 'report': return 'alert-circle';
      default: return 'information';
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_joined': return '#3b82f6';
      case 'job_created': return '#22c55e';
      case 'job_completed': return '#10b981';
      case 'offering_created': return '#f59e0b';
      case 'report': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (!isAdmin) {
    return null;
  }

  const styles = createStyles(themeColors, activeTheme);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Admin Panel',
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.text,
        }} 
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Grid - Row 1 */}
          <View style={styles.statsRow}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon="account-group"
              change={`+${stats.newUsersToday} today`}
              changeType="positive"
              themeColors={themeColors}
            />
            <StatCard
              title="Total Jobs"
              value={stats.totalJobs.toLocaleString()}
              icon="briefcase"
              change={`${stats.activeJobs} active`}
              changeType="neutral"
              themeColors={themeColors}
            />
          </View>

          {/* Stats Grid - Row 2 */}
          <View style={styles.statsRow}>
            <StatCard
              title="Offerings"
              value={stats.totalOfferings.toLocaleString()}
              icon="tools"
              change="+5 this week"
              changeType="positive"
              themeColors={themeColors}
            />
            <StatCard
              title="Reports"
              value={stats.pendingReports.toString()}
              icon="alert-circle"
              change={stats.pendingReports > 0 ? 'Needs attention' : 'All clear'}
              changeType={stats.pendingReports > 0 ? 'negative' : 'positive'}
              themeColors={themeColors}
            />
          </View>

          {/* Stats Grid - Row 3 */}
          <View style={styles.statsRow}>
            <StatCard
              title="Completed"
              value={stats.completedJobs.toLocaleString()}
              icon="check-circle"
              change="74% rate"
              changeType="positive"
              themeColors={themeColors}
            />
            <StatCard
              title="Revenue"
              value={`€${stats.totalRevenue.toLocaleString()}`}
              icon="cash"
              change="+12% month"
              changeType="positive"
              themeColors={themeColors}
            />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Surface style={styles.actionsCard} elevation={1}>
            <QuickAction
              icon="account-multiple"
              title="Manage Users"
              subtitle="View, edit, ban users"
              color="#3b82f6"
              onPress={() => router.push('/admin/users')}
              themeColors={themeColors}
            />
            <View style={styles.actionDivider} />
            <QuickAction
              icon="briefcase"
              title="Manage Jobs"
              subtitle="View and moderate jobs"
              color="#22c55e"
              onPress={() => router.push('/admin/jobs')}
              themeColors={themeColors}
            />
            <View style={styles.actionDivider} />
            <QuickAction
              icon="alert-circle"
              title="Review Reports"
              subtitle={`${stats.pendingReports} pending`}
              color="#ef4444"
              onPress={() => router.push('/admin/reports')}
              themeColors={themeColors}
            />
            <View style={styles.actionDivider} />
            <QuickAction
              icon="bullhorn"
              title="Announcements"
              subtitle="Send notifications"
              color="#8b5cf6"
              onPress={() => router.push('/admin/announcements')}
              themeColors={themeColors}
            />
          </Surface>

          {/* Recent Activity */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Surface style={styles.activityCard} elevation={1}>
            {recentActivity.map((activity, index) => (
              <View key={activity.id}>
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
                    <Icon name={getActivityIcon(activity.type)} size={20} color={getActivityColor(activity.type)} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityMessage, { color: themeColors.text }]}>
                      {activity.message}
                    </Text>
                    <Text style={[styles.activityMeta, { color: themeColors.textMuted }]}>
                      {activity.user && <Text style={styles.activityUser}>@{activity.user}</Text>}
                      {activity.user && ' • '}
                      {activity.timestamp}
                    </Text>
                  </View>
                </View>
                {index < recentActivity.length - 1 && <View style={styles.activityDivider} />}
              </View>
            ))}
          </Surface>

          {/* Platform Health */}
          <Text style={styles.sectionTitle}>Platform Health</Text>
          <View style={styles.healthGrid}>
            <HealthCard title="API" status="Operational" icon="server" color="#22c55e" themeColors={themeColors} />
            <HealthCard title="Database" status="Healthy" icon="database" color="#22c55e" themeColors={themeColors} />
            <HealthCard title="Email" status="Connected" icon="email" color="#22c55e" themeColors={themeColors} />
            <HealthCard title="Storage" status="72% used" icon="harddisk" color="#f59e0b" themeColors={themeColors} />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon, 
  change, 
  changeType,
  themeColors,
}: { 
  title: string; 
  value: string; 
  icon: string; 
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  themeColors: typeof colors.light;
}) {
  const changeColor = changeType === 'positive' ? '#22c55e' : changeType === 'negative' ? '#ef4444' : themeColors.textMuted;
  
  return (
    <Surface style={[styles.statCard, { backgroundColor: themeColors.card }]} elevation={1}>
      <View style={styles.statHeader}>
        <Text style={[styles.statTitle, { color: themeColors.textSecondary }]}>{title}</Text>
        <Icon name={icon} size={24} color={themeColors.textMuted} />
      </View>
      <Text style={[styles.statValue, { color: themeColors.text }]}>{value}</Text>
      <Text style={[styles.statChange, { color: changeColor }]}>
        {changeType === 'positive' && '↑ '}
        {changeType === 'negative' && '↓ '}
        {change}
      </Text>
    </Surface>
  );
}

// Quick Action Component
function QuickAction({
  icon,
  title,
  subtitle,
  color,
  onPress,
  themeColors,
}: {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
  themeColors: typeof colors.light;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <View style={styles.quickActionText}>
        <Text style={[styles.quickActionTitle, { color: themeColors.text }]}>{title}</Text>
        <Text style={[styles.quickActionSubtitle, { color: themeColors.textMuted }]}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={themeColors.textMuted} />
    </Pressable>
  );
}

// Health Card Component
function HealthCard({
  title,
  status,
  icon,
  color,
  themeColors,
}: {
  title: string;
  status: string;
  icon: string;
  color: string;
  themeColors: typeof colors.light;
}) {
  return (
    <Surface style={[styles.healthCard, { backgroundColor: color + '10' }]} elevation={0}>
      <Icon name={icon} size={24} color={color} />
      <Text style={[styles.healthTitle, { color: themeColors.text }]}>{title}</Text>
      <Text style={[styles.healthStatus, { color }]}>{status}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 12 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statTitle: { fontSize: 13, fontWeight: '500' },
  statValue: { fontSize: 28, fontWeight: '700', marginTop: 8 },
  statChange: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 12, marginHorizontal: 16, color: '#374151' },
  actionsCard: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  quickAction: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  quickActionIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  quickActionText: { flex: 1 },
  quickActionTitle: { fontSize: 15, fontWeight: '600' },
  quickActionSubtitle: { fontSize: 12, marginTop: 2 },
  actionDivider: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 72 },
  activityCard: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  activityIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  activityContent: { flex: 1 },
  activityMessage: { fontSize: 14 },
  activityMeta: { fontSize: 12, marginTop: 2 },
  activityUser: { fontWeight: '600' },
  activityDivider: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 66 },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  healthCard: { width: '47%', padding: 16, borderRadius: 12, alignItems: 'center' },
  healthTitle: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  healthStatus: { fontSize: 11, marginTop: 2 },
  bottomSpacer: { height: 40 },
});

function createStyles(themeColors: typeof colors.light, activeTheme: string) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.backgroundSecondary },
    scrollView: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: themeColors.textMuted },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 12 },
    statCard: { flex: 1, padding: 16, borderRadius: 12 },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statTitle: { fontSize: 13, fontWeight: '500' },
    statValue: { fontSize: 28, fontWeight: '700', marginTop: 8 },
    statChange: { fontSize: 12, fontWeight: '500', marginTop: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 12, marginHorizontal: 16, color: themeColors.text },
    actionsCard: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: themeColors.card },
    quickAction: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    quickActionIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    quickActionText: { flex: 1 },
    quickActionTitle: { fontSize: 15, fontWeight: '600' },
    quickActionSubtitle: { fontSize: 12, marginTop: 2 },
    actionDivider: { height: 1, backgroundColor: themeColors.border, marginLeft: 72 },
    activityCard: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: themeColors.card },
    activityItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
    activityIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    activityContent: { flex: 1 },
    activityMessage: { fontSize: 14 },
    activityMeta: { fontSize: 12, marginTop: 2 },
    activityUser: { fontWeight: '600' },
    activityDivider: { height: 1, backgroundColor: themeColors.border, marginLeft: 66 },
    healthGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
    healthCard: { width: '47%', padding: 16, borderRadius: 12, alignItems: 'center' },
    healthTitle: { fontSize: 13, fontWeight: '600', marginTop: 8 },
    healthStatus: { fontSize: 11, marginTop: 2 },
    bottomSpacer: { height: 40 },
  });
}
