import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ProfileScreen() {
  // TODO: Get from auth context
  const isLoggedIn = false;

  if (!isLoggedIn) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
            <Text className="text-gray-400 text-3xl">👤</Text>
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">Not signed in</Text>
          <Text className="text-gray-500 text-center mb-6">
            Sign in to manage your offerings, tasks, and messages
          </Text>
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="bg-primary-500 px-8 py-3 rounded-xl active:bg-primary-600"
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-white px-4 py-6 items-center border-b border-gray-100">
          <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-3">
            <Text className="text-primary-600 text-3xl font-bold">JD</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">John Doe</Text>
          <Text className="text-gray-500">john@example.com</Text>
          
          <Pressable className="mt-4 px-6 py-2 border border-gray-300 rounded-full active:bg-gray-50">
            <Text className="text-gray-700 font-medium">Edit Profile</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View className="flex-row bg-white mt-2">
          <View className="flex-1 py-4 items-center border-r border-gray-100">
            <Text className="text-2xl font-bold text-gray-900">12</Text>
            <Text className="text-gray-500 text-sm">Offerings</Text>
          </View>
          <View className="flex-1 py-4 items-center border-r border-gray-100">
            <Text className="text-2xl font-bold text-gray-900">5</Text>
            <Text className="text-gray-500 text-sm">Tasks</Text>
          </View>
          <View className="flex-1 py-4 items-center">
            <Text className="text-2xl font-bold text-gray-900">4.8</Text>
            <Text className="text-gray-500 text-sm">Rating</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white mt-2">
          {[
            { label: 'My Offerings', icon: '📦' },
            { label: 'My Tasks', icon: '📋' },
            { label: 'Favorites', icon: '❤️' },
            { label: 'Settings', icon: '⚙️' },
            { label: 'Help & Support', icon: '❓' },
          ].map((item, index) => (
            <Pressable
              key={item.label}
              className={`flex-row items-center px-4 py-4 active:bg-gray-50 ${
                index < 4 ? 'border-b border-gray-100' : ''
              }`}
            >
              <Text className="text-xl mr-3">{item.icon}</Text>
              <Text className="flex-1 text-gray-900 font-medium">{item.label}</Text>
              <Text className="text-gray-400">→</Text>
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable className="bg-white mt-2 px-4 py-4 items-center active:bg-gray-50">
          <Text className="text-red-500 font-medium">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
