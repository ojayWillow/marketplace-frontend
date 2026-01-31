import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyOfferings, type Offering } from '@marketplace/shared';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';

const OFFERING_COLOR = '#f97316';

export default function MyServicesScreen() {
  const { t } = useTranslation();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['my-services'],
    queryFn: getMyOfferings,
  });

  const offerings = data?.offerings || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', text: '#166534' };
      case 'paused': return { bg: '#fef3c7', text: '#92400e' };
      case 'inactive': return { bg: '#f3f4f6', text: '#374151' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`offerings.status.${status}`);
  };

  const getPriceLabel = (offering: Offering) => {
    if (!offering.price) return t('offerings.priceTypes.negotiable');
    switch (offering.price_type) {
      case 'hourly': return `€${offering.price}${t('offerings.priceTypes.hourly')}`;
      case 'fixed': return `€${offering.price}`;
      case 'negotiable': return t('offerings.priceTypes.negotiable');
      default: return `€${offering.price}`;
    }
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
      backgroundColor: OFFERING_COLOR
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
      color: OFFERING_COLOR, 
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
      color: OFFERING_COLOR, 
      fontWeight: 'bold', 
      fontSize: 16 
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('activity.myServices.title'), 
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
            <ActivityIndicator size="large" color={OFFERING_COLOR} />
          </View>
        ) : isError ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{t('activity.error')}</Text>
            <Button mode="contained" onPress={() => refetch()} buttonColor={OFFERING_COLOR}>{t('activity.retry')}</Button>
          </View>
        ) : offerings.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>{t('activity.myServices.empty.icon')}</Text>
            <Text style={styles.emptyText}>{t('activity.myServices.empty.title')}</Text>
            <Text style={styles.emptySubtext}>{t('activity.myServices.empty.subtitle')}</Text>
            <Button mode="contained" onPress={() => router.push('/offering/create')} style={styles.createButton}>
              {t('activity.myServices.empty.createButton')}
            </Button>
          </View>
        ) : (
          offerings.map((offering: Offering) => {
            const statusColors = getStatusColor(offering.status || 'active');
            return (
              <Card key={offering.id} style={styles.card} onPress={() => router.push(`/offering/${offering.id}`)}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>{offering.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>{getStatusLabel(offering.status || 'active')}</Text>
                    </View>
                  </View>
                  <Text style={styles.category}>{offering.category}</Text>
                  <Text style={styles.description} numberOfLines={2}>{offering.description}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.price}>{getPriceLabel(offering)}</Text>
                    <Button 
                      mode="text" 
                      compact 
                      onPress={() => router.push(`/offering/${offering.id}/edit`)}
                      textColor={OFFERING_COLOR}
                    >
                      {t('common.edit')}
                    </Button>
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
