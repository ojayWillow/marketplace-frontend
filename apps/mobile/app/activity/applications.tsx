import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyApplications, type TaskApplication } from '@marketplace/shared';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function ApplicationsScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['my-applications'],
    queryFn: getMyApplications,
  });

  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const applications = data?.applications || [];

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', text: '#92400e' };
      case 'accepted': return { bg: '#dcfce7', text: '#166534' };
      case 'rejected': return { bg: '#fee2e2', text: '#991b1b' };
      case 'withdrawn': return { bg: '#f3f4f6', text: '#374151' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getApplicationStatusLabel = (status: string) => {
    return t(`activity.applications.status.${status}`);
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
    browseButton: { 
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
      marginBottom: 8 
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
    message: { 
      color: themeColors.textSecondary, 
      fontStyle: 'italic', 
      marginBottom: 12 
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
          title: t('activity.applications.title'), 
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
        ) : applications.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>{t('activity.applications.empty.icon')}</Text>
            <Text style={styles.emptyText}>{t('activity.applications.empty.title')}</Text>
            <Text style={styles.emptySubtext}>{t('activity.applications.empty.subtitle')}</Text>
            <Button mode="contained" onPress={() => router.push('/(tabs)/tasks')} style={styles.browseButton}>
              {t('activity.applications.empty.browseButton')}
            </Button>
          </View>
        ) : (
          applications.map((app: TaskApplication) => {
            const statusColors = getApplicationStatusColor(app.status);
            return (
              <Card key={app.id} style={styles.card} onPress={() => app.task && router.push(`/task/${app.task.id}`)}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>
                      {app.task?.title || t('activity.applications.job')}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                        {getApplicationStatusLabel(app.status)}
                      </Text>
                    </View>
                  </View>
                  
                  {app.message ? (
                    <Text style={styles.message} numberOfLines={2}>"{app.message}"</Text>
                  ) : null}
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.price}>€{app.proposed_price?.toFixed(0) || app.task?.budget?.toFixed(0) || '0'}</Text>
                    <Text style={styles.date}>{t('activity.applications.applied')} {new Date(app.created_at).toLocaleDateString()}</Text>
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
