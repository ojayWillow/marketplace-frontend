import { View, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, Surface, Divider, Button, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore, getUserProfile, getUserReviewStats } from '@marketplace/shared';
import { useQuery } from '@tanstack/react-query';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();

  // Fetch fresh user data with stats
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => getUserProfile(user!.id),
    enabled: !!user?.id,
  });

  const { data: reviewStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['userReviewStats', user?.id],
    queryFn: () => getUserReviewStats(user!.id),
    enabled: !!user?.id,
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Avatar.Icon size={80} icon="account" style={styles.guestAvatar} />
          <Text variant="headlineSmall" style={styles.notLoggedInTitle}>Not Logged In</Text>
          <Text style={styles.notLoggedInSubtitle}>
            Sign in to access your profile, listings, and messages
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInButton}
          >
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const displayUser = userData || user;
  const isLoading = isLoadingUser || isLoadingStats;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Surface style={styles.header} elevation={1}>
          <Pressable 
            onPress={() => router.push('/profile/edit')}
            style={styles.avatarContainer}
          >
            <Avatar.Text
              size={96}
              label={user.username?.charAt(0).toUpperCase() || 'U'}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </Pressable>
          
          <Text variant="headlineSmall" style={styles.name}>
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.username}
          </Text>
          <Text style={styles.username}>@{user.username}</Text>
          
          {displayUser.bio ? (
            <Text style={styles.bio} numberOfLines={2}>{displayUser.bio}</Text>
          ) : null}
          
          {/* Stats */}
          {isLoading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="small" color="#0ea5e9" />
            </View>
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {reviewStats?.average_rating?.toFixed(1) || '-'}
                </Text>
                <Text style={styles.statLabel}>⭐ Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {reviewStats?.total_reviews || 0}
                </Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text variant="titleLarge" style={styles.statValue}>
                  {displayUser.completed_tasks_count || 0}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          )}
        </Surface>

        {/* Account Section */}
        <Text style={styles.sectionLabel}>Account</Text>
        <Surface style={styles.menuContainer} elevation={0}>
          <MenuItem 
            title="Edit Profile" 
            icon="✏️" 
            onPress={() => router.push('/profile/edit')} 
          />
          <Divider />
          <MenuItem 
            title="My Public Profile" 
            icon="👤" 
            onPress={() => router.push(`/user/${user.id}`)} 
          />
        </Surface>

        {/* My Activity Section */}
        <Text style={styles.sectionLabel}>My Activity</Text>
        <Surface style={styles.menuContainer} elevation={0}>
          <MenuItem 
            title="Jobs I Posted" 
            subtitle="Jobs you're looking for help with"
            icon="📋" 
            onPress={() => router.push('/activity/posted-jobs')} 
          />
          <Divider />
          <MenuItem 
            title="My Applications" 
            subtitle="Jobs you've applied for"
            icon="📨" 
            onPress={() => router.push('/activity/applications')} 
          />
          <Divider />
          <MenuItem 
            title="Jobs I'm Working On" 
            subtitle="Jobs assigned to you"
            icon="💼" 
            onPress={() => router.push('/activity/my-jobs')} 
          />
          <Divider />
          <MenuItem 
            title="My Services" 
            subtitle="Services you offer"
            icon="🛠️" 
            onPress={() => router.push('/activity/my-services')} 
          />
        </Surface>

        {/* Messages */}
        <Text style={styles.sectionLabel}>Communication</Text>
        <Surface style={styles.menuContainer} elevation={0}>
          <MenuItem 
            title="Messages" 
            icon="💬" 
            onPress={() => router.push('/(tabs)/messages')} 
          />
        </Surface>

        {/* Settings Section */}
        <Text style={styles.sectionLabel}>Settings</Text>
        <Surface style={styles.menuContainer} elevation={0}>
          <MenuItem 
            title="Notifications" 
            icon="🔔" 
            onPress={() => router.push('/settings/notifications')} 
          />
          <Divider />
          <MenuItem 
            title="Language" 
            icon="🌐" 
            subtitle="English"
            onPress={() => router.push('/settings/language')} 
          />
          <Divider />
          <MenuItem 
            title="Help & Support" 
            icon="❓" 
            onPress={() => Alert.alert('Help & Support', 'Contact us at support@quickhelp.lv')} 
          />
        </Surface>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            textColor="#ef4444"
            style={styles.logoutButton}
            icon="logout"
          >
            Logout
          </Button>
        </View>

        {/* Account Info */}
        <View style={styles.footer}>
          <Text style={styles.memberSince}>
            Member since {new Date(user.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.version}>App version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ 
  title, 
  subtitle,
  icon, 
  onPress 
}: { 
  title: string; 
  subtitle?: string;
  icon: string; 
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  guestAvatar: {
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  notLoggedInTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  notLoggedInSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    paddingHorizontal: 24,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#0ea5e9',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editBadgeText: {
    fontSize: 14,
  },
  name: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  username: {
    color: '#6b7280',
    marginTop: 4,
  },
  bio: {
    color: '#4b5563',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  statsLoading: {
    marginTop: 24,
    paddingVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemPressed: {
    backgroundColor: '#f9fafb',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 28,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#1f2937',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: '#9ca3af',
  },
  logoutContainer: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  logoutButton: {
    borderColor: '#fecaca',
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  memberSince: {
    color: '#9ca3af',
    fontSize: 13,
  },
  version: {
    color: '#d1d5db',
    fontSize: 12,
    marginTop: 4,
  },
});
