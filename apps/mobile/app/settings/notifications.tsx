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
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';

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
  const { t } = useTranslation();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

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
              t('notifications.settings.alerts.permissionRequired.title'),
              t('notifications.settings.alerts.permissionRequired.message'),
              [{ text: 'OK' }]
            );
            // Revert setting
            const revertedSettings = { ...newSettings, pushEnabled: false };
            setSettings(revertedSettings);
            await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(revertedSettings));
          } else {
            Alert.alert(t('notifications.settings.alerts.enabled.title'), t('notifications.settings.alerts.enabled.message'));
          }
        } else {
          // Disable push notifications
          await unregisterPushToken(token);
          Alert.alert(t('notifications.settings.alerts.disabled'));
        }
      }
    } catch (e) {
      console.error('Failed to save notification settings:', e);
      Alert.alert(t('notifications.settings.alerts.saveFailed.title'), t('notifications.settings.alerts.saveFailed.message'));
    }
  };

  const handleTestNotification = async () => {
    if (!isAuthenticated || !token) {
      Alert.alert(t('notifications.settings.test.error.title'), t('notifications.settings.test.error.notLoggedIn'));
      return;
    }

    if (!settings.pushEnabled) {
      Alert.alert(t('notifications.settings.test.error.title'), t('notifications.settings.test.error.pushDisabled'));
      return;
    }

    try {
      await sendTestNotification(token);
      Alert.alert(t('notifications.settings.test.success.title'), t('notifications.settings.test.success.message'));
    } catch (error) {
      Alert.alert(t('notifications.settings.test.error.title'), t('notifications.settings.test.error.message'));
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundSecondary,
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
      color: themeColors.text,
    },
    emptyText: {
      color: themeColors.textSecondary,
      textAlign: 'center',
    },
    section: {
      backgroundColor: themeColors.card,
      marginTop: 16,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: themeColors.textSecondary,
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
      color: themeColors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 13,
      color: themeColors.textMuted,
    },
    testSection: {
      padding: 16,
    },
    warningContainer: {
      margin: 16,
      padding: 16,
      backgroundColor: activeTheme === 'dark' ? '#422006' : '#fef3c7',
      borderRadius: 12,
    },
    warningText: {
      color: activeTheme === 'dark' ? '#fbbf24' : '#92400e',
      fontSize: 14,
      textAlign: 'center',
    },
    footer: {
      padding: 16,
    },
    footerText: {
      color: themeColors.textMuted,
      fontSize: 13,
      textAlign: 'center',
    },
  });

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen 
          options={{ 
            headerShown: true, 
            title: t('notifications.settings.title'),
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: themeColors.card },
            headerTintColor: themeColors.primaryAccent,
            headerTitleStyle: { color: themeColors.text },
          }} 
        />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text variant="titleLarge" style={styles.emptyTitle}>{t('notifications.settings.signInRequired.title')}</Text>
          <Text style={styles.emptyText}>
            {t('notifications.settings.signInRequired.message')}
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
          title: t('notifications.settings.title'),
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.primaryAccent,
          headerTitleStyle: { color: themeColors.text },
        }} 
      />
      
      {/* Main Toggles */}
      <Surface style={styles.section} elevation={0}>
        <Text style={styles.sectionTitle}>{t('notifications.settings.channels.title')}</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>🔔 {t('notifications.settings.channels.push.label')}</Text>
            <Text style={styles.settingDescription}>{t('notifications.settings.channels.push.description')}</Text>
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
            <Text style={styles.settingLabel}>✉️ {t('notifications.settings.channels.email.label')}</Text>
            <Text style={styles.settingDescription}>{t('notifications.settings.channels.email.description')}</Text>
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
        <Text style={styles.sectionTitle}>{t('notifications.settings.types.title')}</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>💬 {t('notifications.settings.types.newMessages.label')}</Text>
            <Text style={styles.settingDescription}>{t('notifications.settings.types.newMessages.description')}</Text>
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
            <Text style={styles.settingLabel}>📥 {t('notifications.settings.types.taskApplications.label')}</Text>
            <Text style={styles.settingDescription}>{t('notifications.settings.types.taskApplications.description')}</Text>
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
            <Text style={styles.settingLabel}>📋 {t('notifications.settings.types.taskUpdates.label')}</Text>
            <Text style={styles.settingDescription}>{t('notifications.settings.types.taskUpdates.description')}</Text>
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
          <View style={settings.settingInfo}>
            <Text style={styles.settingLabel}>🎁 {t('notifications.settings.types.promotions.label')}</Text>
            <Text style={styles.settingDescription}>{t('notifications.settings.types.promotions.description')}</Text>
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
            textColor={themeColors.text}
          >
            {t('notifications.settings.test.button')}
          </Button>
        </View>
      )}

      {/* Warning */}
      {!settings.pushEnabled && !settings.emailEnabled ? (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ {t('notifications.settings.warning.allDisabled')}
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('notifications.settings.footer')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
