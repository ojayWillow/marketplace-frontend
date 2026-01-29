import { View, ScrollView, StyleSheet, RefreshControl, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, NotificationType, type Notification } from '@marketplace/shared';
import { useState } from 'react';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(1, 50, false),
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
      Alert.alert('Success', 'All notifications marked as read');
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

    // Handle dispute notifications
    if (notification.type === NotificationType.TASK_DISPUTED) {
      router.push(`/dispute/${relatedId}`);
      return;
    }

    // Handle other notifications (task-related)
    const taskId = relatedId;
    switch (notification.type) {
      case NotificationType.NEW_APPLICATION:
        router.push(`/task/${taskId}/applications`);
        break;
      
      case NotificationType.APPLICATION_ACCEPTED:
        router.push(`/task/${taskId}`);
        break;
      
      case NotificationType.APPLICATION_REJECTED:
        router.push(`/task/${taskId}`);
        break;
      
      case NotificationType.TASK_MARKED_DONE:
        router.push(`/task/${taskId}`);
        break;
      
      case NotificationType.TASK_COMPLETED:
        router.push(`/task/${taskId}/review`);
        break;
      
      default:
        router.push(`/task/${taskId}`);
    }
  };

  const handleDelete = (notificationId: number) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMutation.mutate(notificationId)
        },
      ]
    );
  };

  const handleMarkAllRead = () => {
    if ((data?.unread_count || 0) === 0) {
      Alert.alert('No Unread', 'You have no unread notifications');
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
        return '🔔';
      default:
        return '🔔';
    }
  };

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count || 0;

  const headerOptions = {
    headerShown: true,
    title: 'Notifications',
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
        Mark All Read
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

  if (isLoading) {
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
          <Text variant="headlineSmall" style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySubtitle}>You're all caught up!</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          removeClippedSubviews={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {notifications.map((notification) => (
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
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
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
          ))}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return date.toLocaleDateString();
}
