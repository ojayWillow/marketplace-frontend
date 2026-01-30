import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card, Avatar, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '@marketplace/shared';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { getActiveTheme, setTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const toggleTheme = () => {
    setTheme(activeTheme === 'light' ? 'dark' : 'light');
  };

  const testOnboarding = () => {
    router.push('/onboarding/welcome');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    header: {
      padding: 24,
      alignItems: 'center',
    },
    avatar: {
      marginBottom: 16,
      backgroundColor: themeColors.primaryAccent,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: 4,
    },
    email: {
      fontSize: 14,
      color: themeColors.textSecondary,
    },
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: themeColors.textSecondary,
      marginBottom: 8,
      marginLeft: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    card: {
      marginBottom: 16,
      backgroundColor: themeColors.card,
      borderRadius: 12,
    },
    button: {
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 12,
    },
    logoutButton: {
      borderRadius: 12,
      marginHorizontal: 16,
      marginTop: 8,
      backgroundColor: '#ef4444',
    },
    testButton: {
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: '#f59e0b',
    },
    divider: {
      marginVertical: 16,
      backgroundColor: themeColors.border,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={user?.username?.[0]?.toUpperCase() || 'U'}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'No email'}</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Development Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Development</Text>
          <Button
            mode="contained"
            icon="rocket-launch"
            onPress={testOnboarding}
            style={styles.testButton}
            labelStyle={{ color: '#ffffff' }}
          >
            Test Onboarding Flow
          </Button>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <Button
            mode="outlined"
            icon={activeTheme === 'light' ? 'weather-night' : 'weather-sunny'}
            onPress={toggleTheme}
            style={styles.button}
            textColor={themeColors.text}
          >
            {activeTheme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>

          <Button
            mode="outlined"
            icon="account-edit"
            onPress={() => router.push('/profile/edit')}
            style={styles.button}
            textColor={themeColors.text}
          >
            Edit Profile
          </Button>

          <Button
            mode="outlined"
            icon="bell-outline"
            onPress={() => router.push('/settings/notifications')}
            style={styles.button}
            textColor={themeColors.text}
          >
            Notifications
          </Button>
        </View>

        <Divider style={styles.divider} />

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <Button
            mode="outlined"
            icon="help-circle-outline"
            onPress={() => router.push('/help')}
            style={styles.button}
            textColor={themeColors.text}
          >
            Help & Support
          </Button>

          <Button
            mode="outlined"
            icon="shield-check"
            onPress={() => router.push('/privacy')}
            style={styles.button}
            textColor={themeColors.text}
          >
            Privacy & Terms
          </Button>
        </View>

        {/* Logout */}
        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={{ color: '#ffffff' }}
        >
          Logout
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
