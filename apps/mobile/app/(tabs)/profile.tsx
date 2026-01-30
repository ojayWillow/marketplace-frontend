import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, Button } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useAuthStore, getUserProfile, getUserReviewStats, getImageUrl, getUnreadCount, normalizeSkills } from '@marketplace/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

// Import extracted components
import { ProfileHeader } from './profile/components/ProfileHeader';
import { ProfileAvatar } from './profile/components/ProfileAvatar';
import { ProfileStats } from './profile/components/ProfileStats';
import { ProfileSkills } from './profile/components/ProfileSkills';
import { ActivityMenu } from './profile/components/ActivityMenu';

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

  // Not logged in view
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} collapsable={false}>
        <Stack.Screen options={{ headerShown: false }} />
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

  // Parse and normalize skills
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
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
      >
        {/* Header with gradient and buttons */}
        <ProfileHeader activeTheme={activeTheme} unreadCount={unreadCount} />

        {/* Avatar, name, bio, edit button */}
        <ProfileAvatar
          displayName={displayName}
          username={user.username}
          city={displayUser.city}
          bio={displayUser.bio}
          profilePictureUrl={fullProfilePictureUrl}
          themeColors={themeColors}
        />

        {/* Stats card */}
        <ProfileStats
          reviewStats={reviewStats}
          completedTasksCount={displayUser.completed_tasks_count}
          isLoading={isLoading}
          themeColors={themeColors}
        />

        {/* Skills section */}
        <ProfileSkills skills={userSkills} themeColors={themeColors} />

        {/* Activity & Marketplace menu */}
        <ActivityMenu themeColors={themeColors} />

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
  logoutContainer: {
    marginTop: 32,
    marginHorizontal: 20,
  },
  logoutButton: {
    borderColor: '#fecaca',
    borderRadius: 12,
  },
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
