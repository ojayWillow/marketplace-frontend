import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, Button } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useAuthStore, getUserProfile, getUserReviewStats, getImageUrl, getUnreadCount, getNotifications, normalizeSkills } from '@marketplace/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../src/stores/themeStore';
import { useTranslation } from '../../src/hooks/useTranslation';
import { colors } from '../../src/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { ProfileHeader } from './profile/components/ProfileHeader';
import { ProfileAvatar } from './profile/components/ProfileAvatar';
import { ProfileStats } from './profile/components/ProfileStats';
import { ProfileSkills } from './profile/components/ProfileSkills';
import { ActivityMenu } from './profile/components/ActivityMenu';

export default function ProfileScreen() {
  const { t } = useTranslation();
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
      
      // Prefetch notifications so they're ready when user taps the bell
      // This eliminates loading time on the notifications screen
      if (isAuthenticated) {
        queryClient.prefetchQuery({
          queryKey: ['notifications'],
          queryFn: () => getNotifications(1, 50, false),
          staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
        });
      }
    }, [refetchUser, refetchStats, refetchUnread, isAuthenticated, queryClient])
  );

  const handleLogout = () => {
    Alert.alert(
      t.profile.logoutTitle,
      t.profile.logoutConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.profile.logout,
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
          <Text variant="headlineSmall" style={[styles.notLoggedInTitle, { color: themeColors.text }]}>{t.profile.notLoggedInTitle}</Text>
          <Text style={[styles.notLoggedInSubtitle, { color: themeColors.textSecondary }]}>
            {t.profile.notLoggedInSubtitle}
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInButton}
          >
            {t.auth.login.title}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const displayUser = userData || user;
  const isLoading = isLoadingUser || isLoadingStats;

  const profilePictureUrl = displayUser.profile_picture_url || displayUser.avatar_url;
  const fullProfilePictureUrl = profilePictureUrl ? getImageUrl(profilePictureUrl) : null;

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
        <ProfileHeader activeTheme={activeTheme} unreadCount={unreadCount} />

        <ProfileAvatar
          displayName={displayName}
          username={user.username}
          city={displayUser.city}
          bio={displayUser.bio}
          profilePictureUrl={fullProfilePictureUrl}
          themeColors={themeColors}
        />

        <ProfileStats
          reviewStats={reviewStats}
          completedTasksCount={displayUser.completed_tasks_count}
          isLoading={isLoading}
          themeColors={themeColors}
        />

        <ProfileSkills skills={userSkills} themeColors={themeColors} />

        <ActivityMenu themeColors={themeColors} />

        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            textColor="#ef4444"
            style={styles.logoutButton}
            icon="logout"
          >
            {t.profile.logout}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.memberSince, { color: themeColors.textMuted }]}>
            {t.profile.memberSince} {new Date(user.created_at).toLocaleDateString()}
          </Text>
          <Text style={[styles.version, { color: themeColors.textMuted }]}>{t.profile.appVersion}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  centerContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  guestAvatar: { marginBottom: 16 },
  notLoggedInTitle: { fontWeight: '600', marginBottom: 8 },
  notLoggedInSubtitle: { textAlign: 'center', marginBottom: 24 },
  signInButton: { paddingHorizontal: 24 },
  logoutContainer: { marginTop: 32, marginHorizontal: 20 },
  logoutButton: { borderColor: '#fecaca', borderRadius: 12 },
  footer: { paddingVertical: 24, alignItems: 'center' },
  memberSince: { fontSize: 13 },
  version: { fontSize: 12, marginTop: 4 },
});
