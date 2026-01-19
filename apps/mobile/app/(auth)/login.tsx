import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // TODO: Implement Firebase auth
    console.log('Login:', { email, password });
    
    // Temporary: navigate to main app
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-8">
          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Forgot Password */}
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable className="self-end mb-6">
              <Text className="text-primary-500">Forgot Password?</Text>
            </Pressable>
          </Link>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className={`py-4 rounded-xl items-center ${loading ? 'bg-primary-300' : 'bg-primary-500 active:bg-primary-600'}`}
          >
            <Text className="text-white font-semibold text-lg">
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </Pressable>

          {/* Register Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="text-primary-500 font-medium">Sign Up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
