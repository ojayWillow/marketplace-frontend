import { View, Pressable, ScrollView, Alert, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, Surface, Divider, Button, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, apiClient } from '@marketplace/shared';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();

  // Fetch fresh user data from API
  const { data: profileData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const response = await apiClient.get('/api/users/me');
      return response.data;
    },
    enabled: isAuthenticated && !!user,
  });

  const profile = profileData || user;

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <Surface style={styles.header} elevation={1}>
          {isLoading ? (
            <ActivityIndicator size="large" style={{ marginVertical: 24 }} />
          ) : (
            <>
              <Avatar.Text
                size={96}
                label={profile?.username?.charAt(0).toUpperCase() || 'U'}
                style={styles.avatar}
              />
              
              <Text variant="headlineSmall" style={styles.name}>
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.username || user.username}
              </Text>
              <Text style={styles.username}>@{profile?.username || user.username}</Text>
              
              {/* Stats */}
              {(profile?.reputation_score !== undefined || profile?.completion_rate !== undefined) && (
                <View style={styles.statsContainer}>
                  {profile?.reputation_score !== undefined && (
                    <View style={styles.stat}>
                      <Text variant="titleLarge" style={styles.statValue}>
                        {profile.reputation_score?.toFixed(1) || '0.0'}
                      </Text>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>
                  )}
                  {profile?.completion_rate !== undefined && (
                    <View style={styles.stat}>
                      <Text variant="titleLarge" style={styles.statValue}>
                        {Math.round(profile.completion_rate * 100)}%
                      </Text>
                      <Text style={styles.statLabel}>Completion</Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </Surface>

        {/* Menu Items */}
        <Surface style={styles.menuContainer} elevation={0}>
          <MenuItem 
            title="My Tasks" 
            icon="📋" 
            onPress={() => router.push('/(tabs)/tasks')} 
          />
          <Divider />
          <MenuItem 
            title="Messages" 
            icon="💬" 
            onPress={() => router.push('/(tabs)/messages')} 
          />
          <Divider />
          <MenuItem 
            title="Settings" 
            icon="⚙️" 
            onPress={() => Alert.alert('Coming Soon', 'Settings screen will be available soon')} 
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
          >
            Logout
          </Button>
        </View>

        {/* Account Info */}
        <View style={styles.footer}>
          <Text style={styles.memberSince}>
            Member since {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuTitle}>{title}</Text>
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
  avatar: {
    backgroundColor: '#0ea5e9',
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  username: {
    color: '#6b7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 48,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  menuItemPressed: {
    backgroundColor: '#f9fafb',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  logoutContainer: {
    marginTop: 16,
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
});
