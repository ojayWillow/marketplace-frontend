import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme, Snackbar, Card } from 'react-native-paper';
import { authApi, useAuthStore } from '@marketplace/shared';
import Constants from 'expo-constants';
import { haptic } from '../../utils/haptics';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

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
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      haptic.warning();
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');
    haptic.medium();

    try {
      const response = await authApi.login({ email: email.trim(), password });
      const token = response.access_token || (response as any).token;
      
      if (!token) {
        haptic.error();
        setError('Login failed: No token received from server');
        return;
      }
      
      haptic.success();
      setAuth(response.user, token);
      router.replace('/(tabs)');
    } catch (error: any) {
      haptic.error();
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    haptic.light();
    router.push('/(auth)/forgot-password');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
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
      color: themeColors.text,
    },
    subtitle: {
      marginBottom: 24,
      color: themeColors.textSecondary,
    },
    infoBanner: {
      marginBottom: 24,
      borderRadius: 12,
      backgroundColor: activeTheme === 'dark' ? themeColors.card : themeColors.backgroundSecondary,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    infoBannerText: {
      color: themeColors.text,
      lineHeight: 20,
    },
    input: {
      marginBottom: 16,
      backgroundColor: themeColors.card,
    },
    forgotButton: {
      alignSelf: 'flex-end',
      marginBottom: 24,
    },
    loginButton: {
      borderRadius: 12,
      marginBottom: 16,
      backgroundColor: themeColors.primaryAccent,
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
      backgroundColor: themeColors.border,
    },
    dividerText: {
      marginHorizontal: 16,
      color: themeColors.textMuted,
    },
    phoneButton: {
      borderRadius: 12,
      marginBottom: 16,
      borderColor: themeColors.primaryAccent,
    },
    registerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    registerText: {
      color: themeColors.textSecondary,
    },
    guestButton: {
      marginTop: 32,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text variant="headlineLarge" style={styles.title}>
              Welcome Back
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Sign in to continue
            </Text>

            {isExpoGo && (
              <Card style={styles.infoBanner} elevation={0}>
                <Card.Content>
                  <Text variant="bodySmall" style={styles.infoBannerText}>
                    📱 Running in Expo Go - Email login only. Phone authentication will be available in production builds.
                  </Text>
                </Card.Content>
              </Card>
            )}

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
              outlineColor={themeColors.border}
              activeOutlineColor={themeColors.primaryAccent}
              textColor={themeColors.text}
              placeholderTextColor={themeColors.textMuted}
              left={<TextInput.Icon icon="email" color={themeColors.primaryAccent} />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              disabled={loading}
              mode="outlined"
              style={styles.input}
              outlineColor={themeColors.border}
              activeOutlineColor={themeColors.primaryAccent}
              textColor={themeColors.text}
              placeholderTextColor={themeColors.textMuted}
              left={<TextInput.Icon icon="lock" color={themeColors.primaryAccent} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  color={themeColors.textMuted}
                  onPress={() => { haptic.soft(); setShowPassword(!showPassword); }}
                />
              }
            />

            <Button
              mode="text"
              onPress={handleForgotPassword}
              disabled={loading}
              style={styles.forgotButton}
              textColor={themeColors.primaryAccent}
            >
              Forgot Password?
            </Button>

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              buttonColor={themeColors.primaryAccent}
              textColor="#ffffff"
            >
              {loading ? 'Signing In...' : 'Sign In with Email'}
            </Button>

            {isPhoneAuthAvailable && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text variant="bodySmall" style={styles.dividerText}>
                    or
                  </Text>
                  <View style={styles.dividerLine} />
                </View>

                <Link href="/(auth)/phone" asChild>
                  <Button
                    mode="outlined"
                    disabled={loading}
                    style={styles.phoneButton}
                    contentStyle={styles.buttonContent}
                    icon="phone"
                    textColor={themeColors.primaryAccent}
                    onPress={() => haptic.light()}
                  >
                    Sign In with Phone
                  </Button>
                </Link>
              </>
            )}

            <View style={styles.registerRow}>
              <Text variant="bodyMedium" style={styles.registerText}>
                Don't have an account?{' '}
              </Text>
              <Link href="/(auth)/register" asChild>
                <Button 
                  mode="text" 
                  disabled={loading} 
                  compact 
                  textColor={themeColors.primaryAccent}
                  onPress={() => haptic.light()}
                >
                  Sign Up
                </Button>
              </Link>
            </View>

            <Link href="/(tabs)" asChild>
              <Button 
                mode="text" 
                disabled={loading} 
                style={styles.guestButton} 
                textColor={themeColors.textMuted}
                onPress={() => haptic.light()}
              >
                Continue as Guest
              </Button>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
