import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
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
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Categories */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            {['All', 'Cleaning', 'Moving', 'Repairs', 'Tutoring', 'Other'].map((category) => (
              <Pressable
                key={category}
                className="bg-white px-4 py-2 rounded-full mr-2 border border-gray-200 active:bg-gray-50"
              >
                <Text className="text-gray-700">{category}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured Offerings */}
        <View className="px-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Featured Offerings</Text>
          
          {/* Placeholder cards */}
          {[1, 2, 3].map((i) => (
            <Pressable
              key={i}
              className="bg-white rounded-xl p-4 mb-3 border border-gray-100 active:bg-gray-50"
            >
              {/* Image placeholder */}
              <View className="h-40 bg-gray-200 rounded-lg mb-3 items-center justify-center">
                <Text className="text-gray-400">Image</Text>
              </View>
              
              <Text className="text-lg font-semibold text-gray-900">Offering Title {i}</Text>
              <Text className="text-gray-500 mt-1">Lorem ipsum dolor sit amet...</Text>
              
              <View className="flex-row justify-between items-center mt-3">
                <Text className="text-primary-500 font-bold">€25/hr</Text>
                <Text className="text-gray-400 text-sm">📍 Riga</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
