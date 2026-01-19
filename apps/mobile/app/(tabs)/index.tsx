import { View, Text, ScrollView, Pressable, TextInput, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  // Fetch offerings
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Marketplace</Text>

        {/* Search Bar */}
        <View className="mt-4 flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-base"
            placeholder="Search offerings..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Categories */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full mr-2 border ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-200 active:bg-gray-50'
                }`}
              >
                <Text
                  className={`${
                    selectedCategory === category.id ? 'text-white font-semibold' : 'text-gray-700'
                  }`}
                >
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Offerings List */}
        <View className="px-4 pb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            {selectedCategory === 'all' ? 'All Offerings' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Offerings`}
          </Text>

          {/* Loading State */}
          {isLoading && (
            <View className="items-center py-12">
              <Text className="text-gray-500">Loading offerings...</Text>
            </View>
          )}

          {/* Error State */}
          {isError && (
            <View className="items-center py-12">
              <Text className="text-red-500 mb-2">Failed to load offerings</Text>
              <Pressable onPress={() => refetch()} className="bg-primary-500 px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">Retry</Text>
              </Pressable>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !isError && offerings.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-4xl mb-2">📦</Text>
              <Text className="text-gray-500 text-center">
                {searchQuery ? 'No offerings found for your search' : 'No offerings available'}
              </Text>
            </View>
          )}

          {/* Offerings Grid */}
          {!isLoading && !isError && offerings.length > 0 && (
            <>
              {offerings.map((offering: any) => (
                <Pressable
                  key={offering.id}
                  onPress={() => router.push(`/offering/${offering.id}`)}
                  className="bg-white rounded-xl p-4 mb-3 border border-gray-100 active:bg-gray-50"
                >
                  {/* Image */}
                  {offering.images && offering.images.length > 0 ? (
                    <Image
                      source={{ uri: offering.images[0] }}
                      className="h-40 rounded-lg mb-3"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-40 bg-gray-200 rounded-lg mb-3 items-center justify-center">
                      <Text className="text-gray-400 text-4xl">📦</Text>
                    </View>
                  )}

                  {/* Title */}
                  <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
                    {offering.title}
                  </Text>

                  {/* Description */}
                  <Text className="text-gray-500 mt-1" numberOfLines={2}>
                    {offering.description}
                  </Text>

                  {/* Footer */}
                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-primary-500 font-bold">
                      €{offering.price ? offering.price.toFixed(2) : '0.00'}
                      {offering.price_type === 'hourly' && '/hr'}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      📍 {offering.location?.city || 'Location'}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
