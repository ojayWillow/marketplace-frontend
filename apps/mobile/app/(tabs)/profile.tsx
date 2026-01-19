import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@marketplace/shared';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
            <Text className="text-gray-400 text-3xl">?</Text>
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">Not Logged In</Text>
          <Text className="text-gray-500 text-center mb-6">
            Sign in to access your profile, listings, and messages
          </Text>
          <Pressable
            onPress={handleLogin}
            className="bg-primary-500 px-8 py-3 rounded-xl active:bg-primary-600"
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-8 items-center border-b border-gray-100">
          {/* Avatar */}
          <View className="w-24 h-24 bg-primary-500 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          
          {/* Name */}
          <Text className="text-xl font-bold text-gray-900">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.username}
          </Text>
          <Text className="text-gray-500">@{user.username}</Text>
          
          {/* Stats */}
          {user.reputation_score !== undefined && (
            <View className="flex-row mt-4 gap-6">
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {user.reputation_score?.toFixed(1) || '0.0'}
                </Text>
                <Text className="text-gray-500 text-sm">Rating</Text>
              </View>
              {user.completion_rate !== undefined && (
                <View className="items-center">
                  <Text className="text-lg font-bold text-gray-900">
                    {Math.round(user.completion_rate * 100)}%
                  </Text>
                  <Text className="text-gray-500 text-sm">Completion</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View className="mt-4">
          <MenuItem title="Edit Profile" icon="✏️" onPress={() => {}} />
          <MenuItem title="My Listings" icon="📦" onPress={() => {}} />
          <MenuItem title="My Tasks" icon="📋" onPress={() => {}} />
          <MenuItem title="Favorites" icon="❤️" onPress={() => {}} />
          <MenuItem title="Settings" icon="⚙️" onPress={() => {}} />
          <MenuItem title="Help & Support" icon="❓" onPress={() => {}} />
        </View>

        {/* Logout */}
        <View className="mt-4 mb-8">
          <Pressable
            onPress={handleLogout}
            className="bg-white mx-4 py-4 rounded-xl items-center border border-red-200 active:bg-red-50"
          >
            <Text className="text-red-500 font-semibold">Logout</Text>
          </Pressable>
        </View>

        {/* Account Info */}
        <View className="px-6 pb-8">
          <Text className="text-gray-400 text-center text-sm">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50"
    >
      <Text className="text-xl mr-4">{icon}</Text>
      <Text className="flex-1 text-gray-900 text-base">{title}</Text>
      <Text className="text-gray-400">›</Text>
    </Pressable>
  );
}
