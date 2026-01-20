import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme, Snackbar, Card } from 'react-native-paper';
import { authApi, useAuthStore } from '@marketplace/shared';
import Constants from 'expo-constants';

// Check if phone auth is available (not in Expo Go)
const isExpoGo = Constants.appOwnership === 'expo';
const isPhoneAuthAvailable = !isExpoGo;

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
      console.log('[Login] Response:', JSON.stringify(response, null, 2));
      
      // Handle both possible token field names from backend
      const token = response.access_token || (response as any).token;
      console.log('[Login] Token extracted:', token ? 'yes' : 'no');
      console.log('[Login] User:', response.user?.username);
      
      if (!token) {
        setError('Login failed: No token received from server');
        return;
      }
      
      setAuth(response.user, token);
      
      // Verify auth state was set
      const state = useAuthStore.getState();
      console.log('[Login] After setAuth - token:', state.token ? 'yes' : 'no');
      console.log('[Login] After setAuth - isAuthenticated:', state.isAuthenticated);
      
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('[Login] Error:', error.response?.data || error.message);
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
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign in to continue
            </Text>

            {/* Expo Go Info Banner */}
            {isExpoGo && (
              <Card style={[styles.infoBanner, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Card.Content>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer }}>
                    📱 Running in Expo Go - Email login only. Phone authentication will be available in production builds.
                  </Text>
                </Card.Content>
              </Card>
            )}

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
              {loading ? 'Signing In...' : 'Sign In with Email'}
            </Button>

            {/* Phone Login Option - Only in Production */}
            {isPhoneAuthAvailable && (
              <>
                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
                  <Text variant="bodySmall" style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>
                    or
                  </Text>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
                </View>

                <Link href="/(auth)/phone" asChild>
                  <Button
                    mode="outlined"
                    disabled={loading}
                    style={styles.phoneButton}
                    contentStyle={styles.buttonContent}
                    icon="phone"
                  >
                    Sign In with Phone
                  </Button>
                </Link>
              </>
            )}

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
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  infoBanner: {
    marginBottom: 24,
    borderRadius: 12,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  phoneButton: {
    borderRadius: 12,
    marginBottom: 16,
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
