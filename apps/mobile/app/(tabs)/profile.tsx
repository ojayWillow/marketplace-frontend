import { View, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, Surface, Divider, Button, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore, getUserProfile, getUserReviewStats } from '@marketplace/shared';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getActiveTheme, mode } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

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

  // Get appearance label
  const getAppearanceLabel = () => {
    if (mode === 'system') return 'System';
    if (mode === 'dark') return 'Dark';
    return 'Light';
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
        <View style={styles.centerContainer}>
          <Avatar.Icon size={80} icon="account" style={[styles.guestAvatar, { backgroundColor: themeColors.border }]} />
          <Text variant="headlineSmall" style={[styles.notLoggedInTitle, { color: themeColors.text }]}>Not Logged In</Text>
          <Text style={[styles.notLoggedInSubtitle, { color: themeColors.textSecondary }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Surface style={[styles.header, { backgroundColor: themeColors.card }]} elevation={1}>
          <Pressable 
            onPress={() => router.push('/profile/edit')}
            style={styles.avatarContainer}
          >
            <Avatar.Text
              size={96}
              label={user.username?.charAt(0).toUpperCase() || 'U'}
              style={styles.avatar}
            />
            <View style={[styles.editBadge, { backgroundColor: themeColors.card }]}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </Pressable>
          
          <Text variant="headlineSmall" style={[styles.name, { color: themeColors.text }]}>
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.username}
          </Text>
          <Text style={[styles.username, { color: themeColors.textSecondary }]}>@{user.username}</Text>
          
          {displayUser.bio ? (
            <Text style={[styles.bio, { color: themeColors.textSecondary }]} numberOfLines={2}>{displayUser.bio}</Text>
          ) : null}
          
          {/* Stats */}
          {isLoading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="small" color="#0ea5e9" />
            </View>
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text variant="titleLarge" style={[styles.statValue, { color: themeColors.text }]}>
                  {reviewStats?.average_rating?.toFixed(1) || '-'}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>⭐ Rating</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
              <View style={styles.stat}>
                <Text variant="titleLarge" style={[styles.statValue, { color: themeColors.text }]}>
                  {reviewStats?.total_reviews || 0}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Reviews</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
              <View style={styles.stat}>
                <Text variant="titleLarge" style={[styles.statValue, { color: themeColors.text }]}>
                  {displayUser.completed_tasks_count || 0}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Completed</Text>
              </View>
            </View>
          )}
        </Surface>

        {/* Account Section */}
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>Account</Text>
        <Surface style={[styles.menuContainer, { backgroundColor: themeColors.card }]} elevation={0}>
          <MenuItem 
            title="Edit Profile" 
            icon="✏️" 
            onPress={() => router.push('/profile/edit')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="My Public Profile" 
            icon="👤" 
            onPress={() => router.push(`/user/${user.id}`)}
            themeColors={themeColors}
          />
        </Surface>

        {/* My Activity Section */}
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>My Activity</Text>
        <Surface style={[styles.menuContainer, { backgroundColor: themeColors.card }]} elevation={0}>
          <MenuItem 
            title="Jobs I Posted" 
            subtitle="Jobs you're looking for help with"
            icon="📋" 
            onPress={() => router.push('/activity/posted-jobs')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="My Applications" 
            subtitle="Jobs you've applied for"
            icon="📨" 
            onPress={() => router.push('/activity/applications')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="Jobs I'm Working On" 
            subtitle="Jobs assigned to you"
            icon="💼" 
            onPress={() => router.push('/activity/my-jobs')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="My Services" 
            subtitle="Services you offer"
            icon="🛠️" 
            onPress={() => router.push('/activity/my-services')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="Listings" 
            subtitle="coming soon"
            icon="🛒️" 
            onPress={() => Alert.alert('Coming Soon', 'This feature is under development')} 
            disabled
            themeColors={themeColors}
          />
        </Surface>

        {/* Messages */}
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>Communication</Text>
        <Surface style={[styles.menuContainer, { backgroundColor: themeColors.card }]} elevation={0}>
          <MenuItem 
            title="Messages" 
            icon="💬" 
            onPress={() => router.push('/(tabs)/messages')}
            themeColors={themeColors}
          />
        </Surface>

        {/* Settings Section */}
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>Settings</Text>
        <Surface style={[styles.menuContainer, { backgroundColor: themeColors.card }]} elevation={0}>
          <MenuItem 
            title="Appearance" 
            icon="🎨" 
            subtitle={getAppearanceLabel()}
            onPress={() => router.push('/settings/appearance')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="Notifications" 
            icon="🔔" 
            onPress={() => router.push('/settings/notifications')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="Language" 
            icon="🌐" 
            subtitle="English"
            onPress={() => router.push('/settings/language')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="Help & Support" 
            icon="❓" 
            onPress={() => Alert.alert('Help & Support', 'Contact us at support@quickhelp.lv')}
            themeColors={themeColors}
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
          <Text style={[styles.memberSince, { color: themeColors.textMuted }]}>
            Member since {new Date(user.created_at).toLocaleDateString()}
          </Text>
          <Text style={[styles.version, { color: themeColors.textMuted }]}>App version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ 
  title, 
  subtitle,
  icon, 
  onPress,
  disabled = false,
  themeColors,
}: { 
  title: string; 
  subtitle?: string;
  icon: string; 
  onPress: () => void;
  disabled?: boolean;
  themeColors: typeof colors.light;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && !disabled && { backgroundColor: themeColors.backgroundSecondary },
        disabled && styles.menuItemDisabled,
      ]}
    >
      <Text style={[styles.menuIcon, disabled && styles.menuIconDisabled]}>{icon}</Text>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: themeColors.text }, disabled && { color: themeColors.textMuted }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.menuSubtitle, { color: themeColors.textMuted }, disabled && styles.menuSubtitleDisabled]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {!disabled && <Text style={[styles.menuArrow, { color: themeColors.textMuted }]}>›</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 16,
  },
  notLoggedInTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  notLoggedInSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    paddingHorizontal: 24,
  },
  header: {
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
  },
  username: {
    marginTop: 4,
  },
  bio: {
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
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
  },
  menuContainer: {
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 28,
  },
  menuIconDisabled: {
    opacity: 0.5,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  menuSubtitleDisabled: {
    fontStyle: 'italic',
  },
  menuArrow: {
    fontSize: 24,
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
    fontSize: 13,
  },
  version: {
    fontSize: 12,
    marginTop: 4,
  },
});
