import { View, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, Surface, Button, ActivityIndicator, IconButton, Badge } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useAuthStore, getUserProfile, getUserReviewStats, getImageUrl, getUnreadCount, getCategoryIcon, getCategoryLabel, normalizeSkills } from '@marketplace/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const { data: userData, isLoading: isLoadingUser, refetch: refetchUser } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => getUserProfile(user!.id),
    enabled: !!user?.id,
  });

  const { data: reviewStats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['userReviewStats', user?.id],
    queryFn: () => getUserReviewStats(user!.id),
    enabled: !!user?.id,
  });

  const { data: unreadData, refetch: refetchUnread } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  useFocusEffect(
    useCallback(() => {
      refetchUser();
      refetchStats();
      refetchUnread();
    }, [refetchUser, refetchStats, refetchUnread])
  );

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
            queryClient.clear();
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const unreadCount = unreadData?.unread_count || 0;

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
        <Stack.Screen 
          options={{ 
            headerShown: false,
          }} 
        />
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

  const profilePictureUrl = displayUser.profile_picture_url || displayUser.avatar_url;
  const fullProfilePictureUrl = profilePictureUrl ? getImageUrl(profilePictureUrl) : null;

  // Parse and normalize skills - converts legacy skills and filters invalid ones
  const rawSkills = displayUser.skills 
    ? (Array.isArray(displayUser.skills) ? displayUser.skills : displayUser.skills.split(',').map((s: string) => s.trim()).filter(Boolean))
    : [];
  const userSkills = normalizeSkills(rawSkills);

  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.username;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Header with Gradient */}
        <LinearGradient
          colors={activeTheme === 'dark' ? ['#1e3a5f', '#0c1929'] : ['#0ea5e9', '#0284c7']}
          style={styles.heroGradient}
        >
          <SafeAreaView edges={['top']}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <Text style={styles.headerTitle}>Profile</Text>
              <View style={styles.topBarRight}>
                <Pressable onPress={() => router.push('/settings')} style={styles.iconButton}>
                  <Text style={styles.iconEmoji}>⚙️</Text>
                </Pressable>
                <Pressable onPress={() => router.push('/notifications')} style={styles.iconButton}>
                  <Text style={styles.iconEmoji}>🔔</Text>
                  {unreadCount > 0 && (
                    <View style={styles.badgeContainer}>
                      <Badge size={16} style={styles.badge}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Avatar - overlapping gradient, clean without edit badge */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            {fullProfilePictureUrl ? (
              <Avatar.Image
                size={100}
                source={{ uri: fullProfilePictureUrl }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text
                size={100}
                label={displayName.charAt(0).toUpperCase()}
                style={styles.avatar}
              />
            )}
          </View>
        </View>

        {/* Name & Location */}
        <View style={styles.nameSection}>
          <Text variant="headlineSmall" style={[styles.name, { color: themeColors.text }]}>
            {displayName}
          </Text>
          <Text style={[styles.username, { color: themeColors.textSecondary }]}>
            @{user.username} {displayUser.city && `· 📍 ${displayUser.city}`}
          </Text>
          {displayUser.bio && (
            <Text style={[styles.bio, { color: themeColors.textSecondary }]} numberOfLines={2}>
              {displayUser.bio}
            </Text>
          )}
        </View>

        {/* Edit Profile Button */}
        <View style={styles.editProfileContainer}>
          <Button
            mode="outlined"
            onPress={() => router.push('/profile/edit')}
            style={styles.editProfileButton}
            labelStyle={styles.editProfileButtonLabel}
            contentStyle={styles.editProfileButtonContent}
            icon="account-edit"
          >
            Edit Profile
          </Button>
        </View>

        {/* Stats Card */}
        <Surface style={[styles.statsCard, { backgroundColor: themeColors.card }]} elevation={2}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#0ea5e9" />
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <View style={styles.statValueRow}>
                  <Text style={styles.starEmoji}>⭐</Text>
                  <Text style={[styles.statValue, { color: themeColors.text }]}>
                    {reviewStats?.average_rating ? reviewStats.average_rating.toFixed(1) : '—'}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Rating</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: themeColors.text }]}>
                  {reviewStats?.total_reviews || 0}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Reviews</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: themeColors.text }]}>
                  {displayUser.completed_tasks_count || 0}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Completed</Text>
              </View>
            </View>
          )}
        </Surface>

        {/* Skills Section - Horizontal Scroll */}
        {userSkills.length > 0 && (
          <View style={styles.skillsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Skills</Text>
              <Pressable onPress={() => router.push('/profile/edit')}>
                <Text style={styles.editLink}>Edit</Text>
              </Pressable>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.skillsScrollContent}
            >
              {userSkills.map((skillKey: string, index: number) => (
                <View 
                  key={index} 
                  style={[styles.skillItem, { backgroundColor: themeColors.card }]}
                >
                  <Text style={styles.skillIcon}>{getCategoryIcon(skillKey)}</Text>
                  <Text style={[styles.skillLabel, { color: themeColors.text }]} numberOfLines={1}>
                    {getCategoryLabel(skillKey)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* No Skills - Prompt to add */}
        {userSkills.length === 0 && (
          <Pressable 
            onPress={() => router.push('/profile/edit')}
            style={[styles.addSkillsPrompt, { backgroundColor: themeColors.card }]}
          >
            <Text style={styles.addSkillsIcon}>🛠️</Text>
            <View style={styles.addSkillsText}>
              <Text style={[styles.addSkillsTitle, { color: themeColors.text }]}>Add your skills</Text>
              <Text style={[styles.addSkillsSubtitle, { color: themeColors.textSecondary }]}>
                Let others know what you can help with
              </Text>
            </View>
            <Text style={[styles.addSkillsArrow, { color: themeColors.textMuted }]}>›</Text>
          </Pressable>
        )}

        {/* Activity Section */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 12, marginHorizontal: 20 }]}>
            Activity
          </Text>
          <Surface style={[styles.menuCard, { backgroundColor: themeColors.card }]} elevation={1}>
            <MenuItem 
              title="Jobs & Offerings" 
              subtitle="View all your jobs and services"
              icon="📄" 
              onPress={() => router.push('/activity/jobs-and-offerings')}
              themeColors={themeColors}
            />
          </Surface>
        </View>

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

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.memberSince, { color: themeColors.textMuted }]}>
            Member since {new Date(user.created_at).toLocaleDateString()}
          </Text>
          <Text style={[styles.version, { color: themeColors.textMuted }]}>App version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MenuItem({ 
  title, 
  subtitle,
  icon, 
  onPress,
  themeColors,
}: { 
  title: string; 
  subtitle?: string;
  icon: string; 
  onPress: () => void;
  themeColors: typeof colors.light;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { backgroundColor: themeColors.backgroundSecondary },
      ]}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: themeColors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: themeColors.textMuted }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Text style={[styles.menuArrow, { color: themeColors.textMuted }]}>›</Text>
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
  
  // Hero Header
  heroGradient: {
    paddingBottom: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  badge: {
    backgroundColor: '#ef4444',
    fontSize: 10,
  },

  // Avatar - Clean design with subtle shadow
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatarContainer: {
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 6,
  },
  avatar: {
    backgroundColor: '#0ea5e9',
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  // Name Section
  nameSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  name: {
    fontWeight: 'bold',
  },
  username: {
    marginTop: 4,
    fontSize: 14,
  },
  bio: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },

  // Edit Profile Button
  editProfileContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  editProfileButton: {
    borderColor: '#0ea5e9',
    borderRadius: 10,
  },
  editProfileButtonLabel: {
    color: '#0ea5e9',
    fontSize: 15,
    fontWeight: '600',
  },
  editProfileButtonContent: {
    paddingVertical: 4,
  },

  // Stats Card
  statsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  starEmoji: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
  },

  // Skills Section
  skillsSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editLink: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  skillsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  skillItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  skillIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  skillLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Add Skills Prompt
  addSkillsPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addSkillsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  addSkillsText: {
    flex: 1,
  },
  addSkillsTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  addSkillsSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addSkillsArrow: {
    fontSize: 24,
  },

  // Menu Section
  menuSection: {
    marginTop: 24,
  },
  menuCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
  },

  // Logout
  logoutContainer: {
    marginTop: 32,
    marginHorizontal: 20,
  },
  logoutButton: {
    borderColor: '#fecaca',
    borderRadius: 12,
  },

  // Footer
  footer: {
    paddingVertical: 24,
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
