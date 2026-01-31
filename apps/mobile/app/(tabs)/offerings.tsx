import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Chip, ActivityIndicator, Button, Surface, FAB, Avatar } from 'react-native-paper';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { getOfferings, getMyOfferings, useAuthStore, type Offering } from '@marketplace/shared';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';

type FilterTab = 'all' | 'my_offerings';

const OFFERING_COLOR = '#f97316'; // Orange for services

export default function OfferingsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { user, isAuthenticated } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const CATEGORIES = [
    { id: 'all', label: t('offerings.categories.all'), emoji: '💼' },
    { id: 'cleaning', label: t('offerings.categories.cleaning'), emoji: '🧹' },
    { id: 'repair', label: t('offerings.categories.repair'), emoji: '🔧' },
    { id: 'delivery', label: t('offerings.categories.delivery'), emoji: '🚚' },
    { id: 'tutoring', label: t('offerings.categories.tutoring'), emoji: '📚' },
    { id: 'beauty', label: t('offerings.categories.beauty'), emoji: '💇' },
    { id: 'tech', label: t('offerings.categories.tech'), emoji: '💻' },
    { id: 'other', label: t('offerings.categories.other'), emoji: '📦' },
  ];

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['offerings', activeTab, selectedCategory, user?.id],
    queryFn: async ({ pageParam = 1 }) => {
      if (activeTab === 'my_offerings' && user) {
        // My offerings doesn't support pagination yet, return all
        return await getMyOfferings();
      } else {
        const params: any = { page: pageParam, per_page: 20, status: 'active' };
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        return await getOfferings(params);
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // My offerings doesn't have pagination
      if (activeTab === 'my_offerings') return undefined;
      
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.total / 20);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: activeTab === 'all' || !!user,
  });

  const offerings = data?.pages.flatMap((page) => page.offerings) || [];
  const totalCount = data?.pages[0]?.total || offerings.length;

  const tabs: { id: FilterTab; label: string; requiresAuth: boolean }[] = [
    { id: 'all', label: t('offerings.tabs.browse'), requiresAuth: false },
    { id: 'my_offerings', label: t('offerings.tabs.myServices'), requiresAuth: true },
  ];

  const visibleTabs = tabs.filter(tab => !tab.requiresAuth || isAuthenticated);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', text: '#166534' };
      case 'paused': return { bg: '#fef3c7', text: '#92400e' };
      case 'closed': return { bg: '#f3f4f6', text: '#374151' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('offerings.status.active');
      case 'paused': return t('offerings.status.paused');
      case 'closed': return t('offerings.status.closed');
      default: return status;
    }
  };

  const getPriceLabel = (offering: Offering) => {
    if (!offering.price) return t('offerings.priceTypes.negotiable');
    switch (offering.price_type) {
      case 'hourly': return `€${offering.price}${t('offerings.priceTypes.hourly')}`;
      case 'fixed': return `€${offering.price}`;
      case 'negotiable': return `${t('offerings.priceTypes.from')} €${offering.price}`;
      default: return `€${offering.price}`;
    }
  };

  const getCategoryEmoji = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.emoji || '💼';
  };

  const handleCreateOffering = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
    } else {
      router.push('/offering/create');
    }
  };

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundSecondary,
    },
    header: {
      padding: 16,
      backgroundColor: themeColors.card,
    },
    title: {
      fontWeight: 'bold',
      color: themeColors.text,
    },
    subtitle: {
      color: themeColors.textSecondary,
      marginTop: 4,
    },
    tabContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: themeColors.card,
    },
    categoryContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: themeColors.backgroundSecondary,
    },
    card: {
      marginBottom: 12,
      backgroundColor: themeColors.card,
      borderRadius: 12,
      // Orange left border accent for services
      borderLeftWidth: 4,
      borderLeftColor: OFFERING_COLOR,
      // Subtle shadow for depth
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: activeTheme === 'dark' ? 0.3 : 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    providerName: {
      fontWeight: '600',
      color: themeColors.text,
    },
    rating: {
      color: themeColors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    cardTitle: {
      fontWeight: '600',
      color: themeColors.text,
      flex: 1,
    },
    description: {
      color: themeColors.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    price: {
      color: OFFERING_COLOR,
      fontWeight: 'bold',
      fontSize: 16,
    },
    location: {
      color: themeColors.textMuted,
      fontSize: 13,
    },
    statusText: {
      marginTop: 12,
      color: themeColors.textSecondary,
      textAlign: 'center',
    },
    errorText: {
      color: '#ef4444',
      marginBottom: 12,
    },
  });

  const renderOfferingCard = ({ item: offering }: { item: Offering }) => {
    const statusColors = getStatusColor(offering.status);
    const isMyOffering = activeTab === 'my_offerings';
    
    return (
      <Card
        key={offering.id}
        style={dynamicStyles.card}
        onPress={() => router.push(`/offering/${offering.id}`)}
      >
        <Card.Content>
          {/* Header Row */}
          <View style={styles.cardHeader}>
            <View style={styles.providerSection}>
              <Avatar.Text 
                size={40} 
                label={offering.creator_name?.charAt(0).toUpperCase() || 'U'}
                style={styles.avatar}
              />
              <View style={styles.providerInfo}>
                <Text style={dynamicStyles.providerName}>{offering.creator_name}</Text>
                {offering.creator_rating ? (
                  <Text style={dynamicStyles.rating}>
                    ⭐ {offering.creator_rating.toFixed(1)} ({offering.creator_review_count || 0})
                  </Text>
                ) : null}
              </View>
            </View>
            {isMyOffering ? (
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusText2, { color: statusColors.text }]}>
                  {getStatusLabel(offering.status)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Title & Category */}
          <View style={styles.titleRow}>
            <Text style={styles.categoryEmoji}>{getCategoryEmoji(offering.category)}</Text>
            <Text variant="titleMedium" numberOfLines={1} style={dynamicStyles.cardTitle}>
              {offering.title}
            </Text>
          </View>

          {/* Description */}
          <Text style={dynamicStyles.description} numberOfLines={2}>
            {offering.description}
          </Text>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <Text style={dynamicStyles.price}>{getPriceLabel(offering)}</Text>
            <Text style={dynamicStyles.location}>
              📍 {offering.location || t('offerings.location')}
            </Text>
          </View>

          {/* Boost Badge */}
          {offering.is_boost_active ? (
            <View style={styles.boostBadge}>
              <Text style={styles.boostText}>⚡ {t('offerings.boosted')}</Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>
    );
  };

  const renderListHeader = () => (
    <>
      {/* Header */}
      <Surface style={dynamicStyles.header} elevation={1}>
        <Text variant="headlineMedium" style={dynamicStyles.title}>{t('offerings.title')}</Text>
        <Text style={dynamicStyles.subtitle}>{t('offerings.subtitle')}</Text>
      </Surface>

      {/* Tabs */}
      <Surface style={dynamicStyles.tabContainer} elevation={1}>
        <View style={styles.tabsRow}>
          {visibleTabs.map((tab) => (
            <Chip
              key={tab.id}
              selected={activeTab === tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={styles.tab}
              mode={activeTab === tab.id ? 'flat' : 'outlined'}
            >
              {tab.label}
            </Chip>
          ))}
        </View>
      </Surface>

      {/* Category Filter - only show on Browse tab */}
      {activeTab === 'all' ? (
        <Surface style={dynamicStyles.categoryContainer} elevation={0}>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={styles.categoryChip}
                mode={selectedCategory === cat.id ? 'flat' : 'outlined'}
                compact
              >
                {cat.emoji} {cat.label}
              </Chip>
            ))}
          </View>
        </Surface>
      ) : null}
    </>
  );

  const renderListEmpty = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyIcon}>🛠️</Text>
      <Text style={dynamicStyles.statusText}>
        {activeTab === 'my_offerings'
          ? t('offerings.empty.myServices')
          : t('offerings.empty.noServices')}
      </Text>
      {activeTab === 'my_offerings' ? (
        <Button 
          mode="contained" 
          onPress={handleCreateOffering}
          style={styles.createButton}
          buttonColor={OFFERING_COLOR}
        >
          {t('offerings.offerFirstService')}
        </Button>
      ) : null}
    </View>
  );

  const renderListFooter = () => {
    if (!isFetchingNextPage) return <View style={styles.fabSpacer} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={OFFERING_COLOR} />
        <Text style={styles.footerText}>{t('offerings.loadingMore')}</Text>
        <View style={styles.fabSpacer} />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        {renderListHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={OFFERING_COLOR} />
          <Text style={dynamicStyles.statusText}>{t('offerings.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        {renderListHeader()}
        <View style={styles.centerContainer}>
          <Text style={dynamicStyles.errorText}>{t('offerings.error')}</Text>
          <Button mode="contained" onPress={() => refetch()} buttonColor={OFFERING_COLOR}>
            {t('offerings.retry')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <FlatList
        data={offerings}
        renderItem={renderOfferingCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshing={false}
        onRefresh={refetch}
      />

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateOffering}
        label={t('offerings.offerService')}
      />
    </SafeAreaView>
  );
}

// Static styles that don't change with theme
const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
  },
  tab: {
    marginRight: 8,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  centerContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  createButton: {
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#f97316',
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText2: {
    fontSize: 11,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boostBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  boostText: {
    color: '#92400e',
    fontSize: 11,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 12,
  },
  fabSpacer: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#f97316',
  },
});
