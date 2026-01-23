import { View, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Switch, Divider, Button } from 'react-native-paper';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@marketplace/shared';
import { 
  registerPushToken, 
  unregisterPushToken, 
  requestPushPermissions,
  sendTestNotification 
} from '../../utils/pushNotifications';

const NOTIFICATION_SETTINGS_KEY = '@marketplace_notification_settings';

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  newMessages: boolean;
  taskApplications: boolean;
  taskUpdates: boolean;
  promotions: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: true,
  newMessages: true,
  taskApplications: true,
  taskUpdates: true,
  promotions: false,
};

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load notification settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      
      // If toggling push notifications, register/unregister with backend
      if (key === 'pushEnabled' && isAuthenticated && token) {
        if (value) {
          // Enable push notifications
          const success = await registerPushToken(token);
          if (!success) {
            Alert.alert(
              'Permission Required',
              'Please enable notifications in your device settings to receive push notifications.',
              [{ text: 'OK' }]
            );
            // Revert setting
            const revertedSettings = { ...newSettings, pushEnabled: false };
            setSettings(revertedSettings);
            await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(revertedSettings));
          } else {
            Alert.alert('✅ Success', 'Push notifications enabled!');
          }
        } else {
          // Disable push notifications
          await unregisterPushToken(token);
          Alert.alert('Push notifications disabled');
        }
      }
    } catch (e) {
      console.error('Failed to save notification settings:', e);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleTestNotification = async () => {
    if (!isAuthenticated || !token) {
      Alert.alert('Error', 'You must be logged in to test notifications');
      return;
    }

    if (!settings.pushEnabled) {
      Alert.alert('Push Disabled', 'Please enable push notifications first');
      return;
    }

    try {
      await sendTestNotification(token);
      Alert.alert('✅ Test Sent!', 'Check your notifications in a few seconds');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen 
          options={{ 
            headerShown: true, 
            title: 'Notifications',
            headerBackTitle: 'Back',
          }} 
        />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text variant="titleLarge" style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>
            Please sign in to manage your notification preferences
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Notifications',
          headerBackTitle: 'Back',
        }} 
      />
      
      {/* Main Toggles */}
      <Surface style={styles.section} elevation={0}>
        <Text style={styles.sectionTitle}>Notification Channels</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>🔔 Push Notifications</Text>
            <Text style={styles.settingDescription}>Receive alerts on your device</Text>
          </View>
          <Switch
            value={settings.pushEnabled}
            onValueChange={(value) => updateSetting('pushEnabled', value)}
            color="#0ea5e9"
          />
        </View>
        
        <Divider />
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>✉️ Email Notifications</Text>
            <Text style={styles.settingDescription}>Receive updates via email</Text>
          </View>
          <Switch
            value={settings.emailEnabled}
            onValueChange={(value) => updateSetting('emailEnabled', value)}
            color="#0ea5e9"
          />
        </View>
      </Surface>

      {/* Notification Types */}
      <Surface style={styles.section} elevation={0}>
        <Text style={styles.sectionTitle}>Notification Types</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>💬 New Messages</Text>
            <Text style={styles.settingDescription}>When someone sends you a message</Text>
          </View>
          <Switch
            value={settings.newMessages}
            onValueChange={(value) => updateSetting('newMessages', value)}
            color="#0ea5e9"
            disabled={!settings.pushEnabled && !settings.emailEnabled}
          />
        </View>
        
        <Divider />
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>📥 Task Applications</Text>
            <Text style={styles.settingDescription}>When someone applies to your task</Text>
          </View>
          <Switch
            value={settings.taskApplications}
            onValueChange={(value) => updateSetting('taskApplications', value)}
            color="#0ea5e9"
            disabled={!settings.pushEnabled && !settings.emailEnabled}
          />
        </View>
        
        <Divider />
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>📋 Task Updates</Text>
            <Text style={styles.settingDescription}>Status changes on your tasks</Text>
          </View>
          <Switch
            value={settings.taskUpdates}
            onValueChange={(value) => updateSetting('taskUpdates', value)}
            color="#0ea5e9"
            disabled={!settings.pushEnabled && !settings.emailEnabled}
          />
        </View>
        
        <Divider />
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>🎁 Promotions & Tips</Text>
            <Text style={styles.settingDescription}>Special offers and app tips</Text>
          </View>
          <Switch
            value={settings.promotions}
            onValueChange={(value) => updateSetting('promotions', value)}
            color="#0ea5e9"
            disabled={!settings.pushEnabled && !settings.emailEnabled}
          />
        </View>
      </Surface>

      {/* Test Notification Button */}
      {settings.pushEnabled && (
        <View style={styles.testSection}>
          <Button 
            mode="outlined" 
            onPress={handleTestNotification}
            icon="bell-ring"
          >
            Send Test Notification
          </Button>
        </View>
      )}

      {/* Warning */}
      {!settings.pushEnabled && !settings.emailEnabled ? (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ All notifications are disabled. You won't receive any alerts.
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Changes are saved automatically.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#9ca3af',
  },
  testSection: {
    padding: 16,
  },
  warningContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
  },
  warningText: {
    color: '#92400e',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
  },
});
