import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      // TODO: Show error toast
      console.log('Passwords do not match');
      return;
    }

    setLoading(true);
    // TODO: Implement Firebase auth
    console.log('Register:', { name, email, password });
    
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
        <ScrollView className="flex-1 px-6 pt-8">
          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoCorrect={false}
            />
          </View>

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
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Confirm Password</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {/* Register Button */}
          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className={`py-4 rounded-xl items-center ${loading ? 'bg-primary-300' : 'bg-primary-500 active:bg-primary-600'}`}
          >
            <Text className="text-white font-semibold text-lg">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </Pressable>

          {/* Login Link */}
          <View className="flex-row justify-center mt-6 mb-8">
            <Text className="text-gray-500">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-primary-500 font-medium">Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
