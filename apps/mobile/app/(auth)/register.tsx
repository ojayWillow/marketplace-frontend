import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { Link, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme, Snackbar, Card } from 'react-native-paper';
import { authApi, useAuthStore } from '@marketplace/shared';
import Constants from 'expo-constants';
import { haptic } from '../../utils/haptics';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';

// Check if phone auth is available (not in Expo Go)
const isExpoGo = Constants.appOwnership === 'expo';
const isPhoneAuthAvailable = !isExpoGo;

export default function RegisterScreen() {
  const { t } = useTranslation();
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
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const handleRegister = async () => {
    // Validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      haptic.warning();
      setError(t.auth.register.errorNoName + ', ' + t.auth.register.errorNoEmail.toLowerCase() + ', ' + t.auth.register.errorNoPassword.toLowerCase());
      return;
    }

    if (password !== confirmPassword) {
      haptic.warning();
      setError(t.auth.register.errorPasswordMatch);
      return;
    }

    if (password.length < 6) {
      haptic.warning();
      setError('Password must be at least 6 characters'); // This needs a key
      return;
    }

    setLoading(true);
    setError('');
    haptic.medium();

    try {
      const response = await authApi.register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      haptic.success();
      const token = response.token || response.access_token;
      setAuth(response.user, token);
      
      // New users ALWAYS see onboarding
      router.replace('/onboarding/welcome');
    } catch (error: any) {
      haptic.error();
      const message = error.response?.data?.message || error.response?.data?.error || t.auth.register.errorGeneric;
      setError(message);
    } finally {
      setLoading(false);
    }
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
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    content: {
      flex: 1,
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
      backgroundColor: activeTheme === 'dark' ? themeColors.card : '#f3e8ff',
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    infoBannerText: {
      color: themeColors.text,
      lineHeight: 20,
    },
    input: {
      marginBottom: 16,
      backgroundColor: themeColors.inputBackground || themeColors.card,
    },
    registerButton: {
      borderRadius: 12,
      marginTop: 8,
      marginBottom: 16,
      backgroundColor: themeColors.primaryAccent,
      shadowColor: themeColors.primaryAccent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
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
      borderWidth: 1.5,
    },
    loginRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    loginText: {
      color: themeColors.textSecondary,
    },
    terms: {
      textAlign: 'center',
      marginTop: 32,
      paddingHorizontal: 16,
      color: themeColors.textMuted,
      fontSize: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text variant="headlineLarge" style={styles.title}>
              {t.auth.register.title}
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              {t.auth.register.subtitle}
            </Text>

            {isExpoGo && (
              <Card style={styles.infoBanner} elevation={0}>
                <Card.Content>
                  <Text variant="bodySmall" style={styles.infoBannerText}>
                    📱 Running in Expo Go - Email registration only. Phone registration will be available in production builds.
                  </Text>
                </Card.Content>
              </Card>
            )}

            <TextInput
              label={t.auth.register.nameLabel}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              disabled={loading}
              mode="outlined"
              style={styles.input}
              outlineColor={themeColors.inputBorder || themeColors.border}
              activeOutlineColor={themeColors.inputFocus || themeColors.primaryAccent}
              textColor={themeColors.text}
              placeholderTextColor={themeColors.inputPlaceholder || themeColors.textMuted}
              left={<TextInput.Icon icon="account" color={themeColors.primaryAccent} />}
            />

            <TextInput
              label={t.auth.register.emailLabel}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              disabled={loading}
              mode="outlined"
              style={styles.input}
              outlineColor={themeColors.inputBorder || themeColors.border}
              activeOutlineColor={themeColors.inputFocus || themeColors.primaryAccent}
              textColor={themeColors.text}
              placeholderTextColor={themeColors.inputPlaceholder || themeColors.textMuted}
              left={<TextInput.Icon icon="email" color={themeColors.primaryAccent} />}
            />

            <TextInput
              label={t.auth.register.passwordLabel}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              disabled={loading}
              mode="outlined"
              style={styles.input}
              outlineColor={themeColors.inputBorder || themeColors.border}
              activeOutlineColor={themeColors.inputFocus || themeColors.primaryAccent}
              textColor={themeColors.text}
              placeholderTextColor={themeColors.inputPlaceholder || themeColors.textMuted}
              left={<TextInput.Icon icon="lock" color={themeColors.primaryAccent} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  color={themeColors.textMuted}
                  onPress={() => { haptic.soft(); setShowPassword(!showPassword); }}
                />
              }
            />

            <TextInput
              label={t.auth.register.confirmPasswordLabel}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              disabled={loading}
              mode="outlined"
              style={styles.input}
              outlineColor={themeColors.inputBorder || themeColors.border}
              activeOutlineColor={themeColors.inputFocus || themeColors.primaryAccent}
              textColor={themeColors.text}
              placeholderTextColor={themeColors.inputPlaceholder || themeColors.textMuted}
              left={<TextInput.Icon icon="lock-check" color={themeColors.primaryAccent} />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  color={themeColors.textMuted}
                  onPress={() => { haptic.soft(); setShowConfirmPassword(!showConfirmPassword); }}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
              buttonColor={themeColors.primaryAccent}
              textColor="#ffffff"
            >
              {loading ? t.auth.register.creatingAccount : t.auth.register.createAccount}
            </Button>

            {isPhoneAuthAvailable && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text variant="bodySmall" style={styles.dividerText}>
                    {t.common.confirm || 'or'}
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
                    {t.auth.phone.signIn}
                  </Button>
                </Link>
              </>
            )}

            <View style={styles.loginRow}>
              <Text variant="bodyMedium" style={styles.loginText}>
                {t.auth.register.hasAccount + ' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Button 
                  mode="text" 
                  disabled={loading} 
                  compact
                  textColor={themeColors.primaryAccent}
                  onPress={() => haptic.light()}
                >
                  {t.auth.register.signIn}
                </Button>
              </Link>
            </View>

            <Text variant="bodySmall" style={styles.terms}>
              {t.auth.register.termsAgreement}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        action={{
          label: t.common.dismiss,
          onPress: () => { haptic.soft(); setError(''); },
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}
