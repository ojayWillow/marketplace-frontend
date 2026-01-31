import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getCreatedTasks, type Task } from '@marketplace/shared';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function PostedJobsScreen() {
  const { t } = useTranslation();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['posted-jobs'],
    queryFn: getCreatedTasks,
  });

  const tasks = data?.tasks || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return { bg: '#dcfce7', text: '#166534' };
      case 'assigned': return { bg: '#fef3c7', text: '#92400e' };
      case 'in_progress': return { bg: '#dbeafe', text: '#1e40af' };
      case 'pending_confirmation': return { bg: '#f3e8ff', text: '#7c3aed' };
      case 'completed': return { bg: '#f3f4f6', text: '#374151' };
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'open': t('task.status.open'),
      'assigned': t('task.status.assigned'),
      'in_progress': t('task.status.inProgress'),
      'pending_confirmation': t('task.status.pendingConfirmation'),
      'completed': t('task.status.completed'),
      'cancelled': t('task.status.cancelled'),
    };
    return statusMap[status] || status;
  };

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: themeColors.backgroundSecondary
    },
    scrollView: { 
      flex: 1 
    },
    scrollContent: { 
      padding: 16,
      paddingBottom: 32,
    },
    centerContainer: { 
      alignItems: 'center', 
      paddingVertical: 48 
    },
    errorText: { 
      color: '#ef4444', 
      marginBottom: 12 
    },
    emptyIcon: { 
      fontSize: 48 
    },
    emptyText: { 
      marginTop: 12, 
      color: themeColors.textSecondary, 
      fontSize: 16, 
      fontWeight: '500' 
    },
    emptySubtext: { 
      marginTop: 4, 
      color: themeColors.textMuted, 
      fontSize: 14 
    },
    createButton: { 
      marginTop: 16, 
      backgroundColor: themeColors.primaryAccent
    },
    card: { 
      marginBottom: 12, 
      backgroundColor: themeColors.card, 
      borderRadius: 12 
    },
    cardHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 4 
    },
    cardTitle: { 
      fontWeight: '600', 
      flex: 1, 
      marginRight: 12, 
      color: themeColors.text
    },
    statusBadge: { 
      paddingHorizontal: 10, 
      paddingVertical: 4, 
      borderRadius: 12 
    },
    statusBadgeText: { 
      fontSize: 12, 
      fontWeight: '600' 
    },
    category: { 
      color: themeColors.primaryAccent, 
      fontSize: 13, 
      marginBottom: 6 
    },
    description: { 
      color: themeColors.textSecondary, 
      marginBottom: 12, 
      lineHeight: 20 
    },
    cardFooter: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    },
    price: { 
      color: themeColors.primaryAccent, 
      fontWeight: 'bold', 
      fontSize: 16 
    },
    date: { 
      color: themeColors.textMuted, 
      fontSize: 13 
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('activity.postedJobs.title'), 
          headerBackTitle: 'Back',
          headerShown: true,
        }} 
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={themeColors.primaryAccent} />
          </View>
        ) : isError ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{t('activity.error')}</Text>
            <Button mode="contained" onPress={() => refetch()} buttonColor={themeColors.primaryAccent}>{t('activity.retry')}</Button>
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>{t('activity.postedJobs.empty.icon')}</Text>
            <Text style={styles.emptyText}>{t('activity.postedJobs.empty.title')}</Text>
            <Text style={styles.emptySubtext}>{t('activity.postedJobs.empty.subtitle')}</Text>
            <Button mode="contained" onPress={() => router.push('/task/create')} style={styles.createButton}>
              {t('activity.postedJobs.empty.createButton')}
            </Button>
          </View>
        ) : (
          tasks.map((task: Task) => {
            const statusColors = getStatusColor(task.status);
            return (
              <Card key={task.id} style={styles.card} onPress={() => router.push(`/task/${task.id}`)}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>{task.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>{getStatusLabel(task.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.category}>{task.category}</Text>
                  <Text style={styles.description} numberOfLines={2}>{task.description}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.price}>€{task.budget?.toFixed(0) || '0'}</Text>
                    <Text style={styles.date}>{new Date(task.created_at).toLocaleDateString()}</Text>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
