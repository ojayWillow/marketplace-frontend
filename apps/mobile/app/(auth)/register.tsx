import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme, Snackbar, Card } from 'react-native-paper';
import { authApi, useAuthStore } from '@marketplace/shared';
import Constants from 'expo-constants';
import { haptic } from '../../utils/haptics';

// Check if phone auth is available (not in Expo Go)
const isExpoGo = Constants.appOwnership === 'expo';
const isPhoneAuthAvailable = !isExpoGo;

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const theme = useTheme();

  const handleRegister = async () => {
    // Validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      haptic.warning();
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      haptic.warning();
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      haptic.warning();
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    haptic.medium(); // Haptic on submit

    try {
      const response = await authApi.register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      haptic.success(); // Success haptic
      setAuth(response.user, response.access_token);
      router.replace('/(tabs)');
    } catch (error: any) {
      haptic.error(); // Error haptic
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
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
              Create Account
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Join the marketplace community
            </Text>

            {/* Expo Go Info Banner */}
            {isExpoGo && (
              <Card style={[styles.infoBanner, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Card.Content>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer }}>
                    📱 Running in Expo Go - Email registration only. Phone registration will be available in production builds.
                  </Text>
                </Card.Content>
              </Card>
            )}

            {/* Username Input */}
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              disabled={loading}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

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
                  onPress={() => { haptic.soft(); setShowPassword(!showPassword); }}
                />
              }
            />

            {/* Confirm Password Input */}
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              disabled={loading}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => { haptic.soft(); setShowConfirmPassword(!showConfirmPassword); }}
                />
              }
            />

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Creating Account...' : 'Create Account with Email'}
            </Button>

            {/* Phone Registration Option - Only in Production */}
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
                    onPress={() => haptic.light()}
                  >
                    Register with Phone
                  </Button>
                </Link>
              </>
            )}

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Already have an account?{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Button mode="text" disabled={loading} compact onPress={() => haptic.light()}>
                  Sign In
                </Button>
              </Link>
            </View>

            {/* Terms */}
            <Text variant="bodySmall" style={[styles.terms, { color: theme.colors.onSurfaceVariant }]}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
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
          onPress: () => { haptic.soft(); setError(''); },
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    flex: 1,
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
  registerButton: {
    borderRadius: 12,
    marginTop: 8,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  terms: {
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
  },
});
