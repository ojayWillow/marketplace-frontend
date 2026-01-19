import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme, Snackbar } from 'react-native-paper';
import { authApi, useAuthStore } from '@marketplace/shared';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const theme = useTheme();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authApi.login({ email: email.trim(), password });
      setAuth(response.user, response.access_token);
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
              Welcome Back
            </Text>

            {/* Email Input */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              disabled={loading}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            {/* Password Input */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              disabled={loading}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            {/* Forgot Password */}
            <Button
              mode="text"
              onPress={() => {}}
              disabled={loading}
              style={styles.forgotButton}
            >
              Forgot Password?
            </Button>

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Register Link */}
            <View style={styles.registerRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Don't have an account?{' '}
              </Text>
              <Link href="/(auth)/register" asChild>
                <Button mode="text" disabled={loading} compact>
                  Sign Up
                </Button>
              </Link>
            </View>

            {/* Browse as Guest */}
            <Link href="/(tabs)" asChild>
              <Button mode="text" disabled={loading} style={styles.guestButton}>
                Continue as Guest
              </Button>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Snackbar */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => setError(''),
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  guestButton: {
    marginTop: 32,
  },
});
