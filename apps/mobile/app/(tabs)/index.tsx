import { View, ScrollView, RefreshControl, TextInput, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Chip, ActivityIndicator, Button, Surface } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import { offeringsAPI } from '@marketplace/shared';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'moving', label: 'Moving' },
  { id: 'repairs', label: 'Repairs' },
  { id: 'tutoring', label: 'Tutoring' },
  { id: 'other', label: 'Other' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['offerings', selectedCategory, searchQuery],
    queryFn: async () => {
      const params: any = { page: 1, limit: 20 };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const response = await offeringsAPI.getOfferings(params);
      return response.data;
    },
  });

  const offerings = data?.offerings || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>Marketplace</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search offerings..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </Surface>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {CATEGORIES.map((category) => (
                <Chip
                  key={category.id}
                  selected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={styles.chip}
                  mode={selectedCategory === category.id ? 'flat' : 'outlined'}
                >
                  {category.label}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Offerings */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Offerings' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
          </Text>

          {/* Loading */}
          {isLoading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.statusText}>Loading offerings...</Text>
            </View>
          )}

          {/* Error */}
          {isError && (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Failed to load offerings</Text>
              <Button mode="contained" onPress={() => refetch()} style={styles.retryButton}>
                Retry
              </Button>
            </View>
          )}

          {/* Empty */}
          {!isLoading && !isError && offerings.length === 0 && (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.statusText}>
                {searchQuery ? 'No offerings found' : 'No offerings available'}
              </Text>
            </View>
          )}

          {/* Offerings List */}
          {!isLoading && !isError && offerings.length > 0 && (
            <View>
              {offerings.map((offering: any) => (
                <Card
                  key={offering.id}
                  style={styles.card}
                  onPress={() => router.push(`/offering/${offering.id}`)}
                >
                  {offering.images && offering.images.length > 0 ? (
                    <Card.Cover source={{ uri: offering.images[0] }} style={styles.cardImage} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderIcon}>📦</Text>
                    </View>
                  )}
                  <Card.Content style={styles.cardContent}>
                    <Text variant="titleMedium" numberOfLines={1}>{offering.title}</Text>
                    <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
                      {offering.description}
                    </Text>
                    <View style={styles.cardFooter}>
                      <Text variant="titleMedium" style={styles.price}>
                        €{offering.price?.toFixed(2) || '0.00'}
                        {offering.price_type === 'hourly' && '/hr'}
                      </Text>
                      <Text variant="bodySmall" style={styles.location}>
                        📍 {offering.location?.city || 'Location'}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchContainer: {
    marginTop: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchInput: {
    height: 44,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  centerContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  statusText: {
    marginTop: 12,
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
  },
  retryButton: {
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  cardImage: {
    height: 160,
  },
  placeholderImage: {
    height: 160,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  cardContent: {
    paddingTop: 12,
  },
  description: {
    color: '#6b7280',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  price: {
    color: '#0ea5e9',
    fontWeight: 'bold',
  },
  location: {
    color: '#9ca3af',
  },
});
