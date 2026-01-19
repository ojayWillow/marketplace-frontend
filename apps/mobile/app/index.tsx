import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo placeholder */}
        <View className="w-24 h-24 bg-primary-500 rounded-full items-center justify-center mb-8">
          <Text className="text-white text-4xl font-bold">M</Text>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Marketplace
        </Text>
        <Text className="text-gray-500 text-center mb-12">
          Find services and tasks in your local community
        </Text>

        {/* Buttons */}
        <View className="w-full gap-4">
          <Link href="/(auth)/login" asChild>
            <Pressable className="bg-primary-500 py-4 rounded-xl items-center active:bg-primary-600">
              <Text className="text-white font-semibold text-lg">Sign In</Text>
            </Pressable>
          </Link>

          <Link href="/(auth)/register" asChild>
            <Pressable className="bg-gray-100 py-4 rounded-xl items-center active:bg-gray-200">
              <Text className="text-gray-900 font-semibold text-lg">Create Account</Text>
            </Pressable>
          </Link>
        </View>

        {/* Browse as guest */}
        <Link href="/(tabs)" asChild>
          <Pressable className="mt-6">
            <Text className="text-primary-500 font-medium">Browse as Guest</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
