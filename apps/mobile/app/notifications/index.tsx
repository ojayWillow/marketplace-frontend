import { View, ScrollView, StyleSheet, RefreshControl, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, NotificationType, type Notification } from '@marketplace/shared';
import { useState } from 'react';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';

// Helper to interpolate variables in translation strings
const interpolate = (template: string, data: Record<string, string | undefined>): string => {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || `{${key}}`);
};

// Empty placeholder data for instant rendering
const EMPTY_NOTIFICATIONS = {
  notifications: [],
  total: 0,
  page: 1,
  per_page: 50,
  has_more: false,
  unread_count: 0,
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(1, 50, false),
    // Use cached data for 2 minutes before refetching
    staleTime: 2 * 60 * 1000,
    // Show empty list immediately while fetching (if no cached data)
    placeholderData: EMPTY_NOTIFICATIONS,
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      Alert.alert(t.common.success, t.notifications.markAllSuccess);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }

    const relatedId = notification.related_id;
    if (!relatedId) return;

    // Handle routing based on notification type
    // All notification types now use task_id in related_id for consistency
    
    switch (notification.type) {
      case NotificationType.TASK_DISPUTED:
        // Backend stores task_id - route to task page which shows dispute info
        router.push(`/task/${relatedId}`);
        break;
        
      case NotificationType.NEW_APPLICATION:
        router.push(`/task/${relatedId}/applications`);
        break;
      
      case NotificationType.APPLICATION_ACCEPTED:
        router.push(`/task/${relatedId}`);
        break;
      
      case NotificationType.APPLICATION_REJECTED:
        router.push(`/task/${relatedId}`);
        break;
      
      case NotificationType.TASK_MARKED_DONE:
        router.push(`/task/${relatedId}`);
        break;
      
      case NotificationType.TASK_COMPLETED:
        router.push(`/task/${relatedId}/review`);
        break;
      
      default:
        router.push(`/task/${relatedId}`);
    }
  };

  const handleDelete = (notificationId: number) => {
    Alert.alert(
      t.notifications.deleteTitle,
      t.notifications.deleteMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        { 
          text: t.common.delete, 
          style: 'destructive',
          onPress: () => deleteMutation.mutate(notificationId)
        },
      ]
    );
  };

  const handleMarkAllRead = () => {
    if ((data?.unread_count || 0) === 0) {
      Alert.alert(t.notifications.noUnread, t.notifications.noUnreadMessage);
      return;
    }

    markAllMutation.mutate();
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_APPLICATION:
        return '📩';
      case NotificationType.APPLICATION_ACCEPTED:
        return '🎉';
      case NotificationType.APPLICATION_REJECTED:
        return '🚧';
      case NotificationType.TASK_MARKED_DONE:
        return '⏳';
      case NotificationType.TASK_COMPLETED:
        return '✅';
      case NotificationType.TASK_DISPUTED:
        return '⚠️';
      default:
        return '🔔';
    }
  };

  // Get translated notification content
  // Uses translation templates if available, falls back to backend-provided content
  const getNotificationContent = (notification: Notification): { title: string; message: string } => {
    const contentTemplates = t.notifications.content as Record<string, { title: string; message: string } | undefined>;
    const template = contentTemplates?.[notification.type];
    
    // If we have a translation template for this notification type, use it
    if (template) {
      // Get data from notification (backend sends this in the data field)
      const notificationData = notification.data || {};
      
      // Map backend field names to template placeholders
      const templateData: Record<string, string> = {
        taskTitle: notificationData.task_title || '',
        applicantName: notificationData.applicant_name || '',
        workerName: notificationData.worker_name || '',
      };
      
      // If we have data, interpolate the template
      if (Object.values(templateData).some(v => v)) {
        return {
          title: interpolate(template.title, templateData),
          message: interpolate(template.message, templateData),
        };
      }
      
      // If no data available but we have a template, use template with original values
      // This provides at least translated titles for notifications without dynamic data
      return {
        title: template.title.replace(/\{\w+\}/g, '').trim() || notification.title,
        message: notification.message, // Keep original message if we can't interpolate
      };
    }
    
    // Fallback to backend-provided content for unknown notification types
    return {
      title: notification.title,
      message: notification.message,
    };
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return t.notifications.timeAgo.justNow;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}${t.notifications.timeAgo.minutesAgo}`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}${t.notifications.timeAgo.hoursAgo}`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}${t.notifications.timeAgo.daysAgo}`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}${t.notifications.timeAgo.weeksAgo}`;
    return date.toLocaleDateString();
  };

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count || 0;
  
  // Show loading only on initial load with no cached data
  const showInitialLoading = isLoading && notifications.length === 0;

  const headerOptions = {
    headerShown: true,
    title: t.notifications.title,
    headerBackTitle: '',
    headerStyle: { backgroundColor: themeColors.card },
    headerTintColor: themeColors.primaryAccent,
    headerTitleStyle: { color: themeColors.text },
    headerRight: () => (
      <Button
        onPress={handleMarkAllRead}
        compact
        style={{ opacity: unreadCount > 0 ? 1 : 0 }}
        disabled={unreadCount === 0}
        textColor={themeColors.primaryAccent}
      >
        {t.notifications.markAllRead}
      </Button>
    ),
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundSecondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 48,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      color: themeColors.textSecondary,
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    notificationCard: {
      backgroundColor: themeColors.card,
      marginBottom: 1,
    },
    unreadCard: {
      backgroundColor: activeTheme === 'dark' ? themeColors.elevated : '#eff6ff',
    },
    notificationContent: {
      flexDirection: 'row',
      padding: 16,
      alignItems: 'flex-start',
    },
    notificationLeft: {
      position: 'relative',
      marginRight: 12,
    },
    notificationIcon: {
      fontSize: 32,
    },
    unreadDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#ef4444',
      borderWidth: 2,
      borderColor: themeColors.card,
    },
    notificationBody: {
      flex: 1,
    },
    notificationTitle: {
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 4,
    },
    notificationMessage: {
      color: themeColors.textSecondary,
      lineHeight: 20,
      marginBottom: 4,
    },
    notificationTime: {
      fontSize: 12,
      color: themeColors.textMuted,
    },
    deleteButton: {
      margin: 0,
    },
    bottomSpacer: {
      height: 24,
    },
    pressed: {
      opacity: 0.7,
    },
  });

  // Only show full-screen loading on very first load with no data at all
  if (showInitialLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']} collapsable={false}>
        <Stack.Screen options={headerOptions} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primaryAccent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']} collapsable={false}>
      <Stack.Screen options={headerOptions} />
      
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text variant="headlineSmall" style={styles.emptyTitle}>{t.notifications.noNotifications}</Text>
          <Text style={styles.emptySubtitle}>{t.notifications.allCaughtUp}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          removeClippedSubviews={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {notifications.map((notification) => {
            const content = getNotificationContent(notification);
            return (
              <Pressable
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
                style={({ pressed }) => [
                  pressed && styles.pressed
                ]}
              >
                <Surface 
                  style={[
                    styles.notificationCard,
                    !notification.is_read && styles.unreadCard
                  ]} 
                  elevation={0}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationLeft}>
                      <Text style={styles.notificationIcon}>
                        {getNotificationIcon(notification.type)}
                      </Text>
                      {!notification.is_read && <View style={styles.unreadDot} />}
                    </View>
                    
                    <View style={styles.notificationBody}>
                      <Text variant="titleMedium" style={styles.notificationTitle}>
                        {content.title}
                      </Text>
                      <Text style={styles.notificationMessage} numberOfLines={2}>
                        {content.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {getTimeAgo(notification.created_at)}
                      </Text>
                    </View>

                    <IconButton
                      icon="delete-outline"
                      size={20}
                      onPress={() => handleDelete(notification.id)}
                      style={styles.deleteButton}
                      iconColor={themeColors.textMuted}
                    />
                  </View>
                </Surface>
              </Pressable>
            );
          })}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
