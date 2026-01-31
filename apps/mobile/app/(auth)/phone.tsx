import React, { useState, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme, Snackbar, HelperText } from 'react-native-paper';
import { useAuthStore } from '@marketplace/shared';
import apiClient from '@marketplace/shared/src/api/client';
import { useTranslation } from '../../src/hooks/useTranslation';

type Step = 'phone' | 'code' | 'complete' | 'success';

export default function PhoneAuthScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  
  const cooldownInterval = useRef<NodeJS.Timeout | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const theme = useTheme();

  const formatPhoneNumber = (phone: string): string => {
    let formatted = phone.trim();
    // Remove any non-digit characters except +
    formatted = formatted.replace(/[^\d+]/g, '');
    // Add Latvia country code if not present
    if (!formatted.startsWith('+')) {
      formatted = '+371' + formatted.replace(/^0+/, '');
    }
    return formatted;
  };

  const startCooldown = (seconds: number) => {
    setCooldownSeconds(seconds);
    if (cooldownInterval.current) {
      clearInterval(cooldownInterval.current);
    }
    cooldownInterval.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (cooldownInterval.current) {
            clearInterval(cooldownInterval.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setError(t.auth.phone.errorInvalidPhone || 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Send OTP via our backend (Twilio)
      const response = await apiClient.post('/api/auth/phone/send-otp', {
        phoneNumber: formattedPhone
      });

      if (response.data.success) {
        setStep('code');
        startCooldown(60); // 60 second cooldown before resend
      } else {
        setError(response.data.error || 'Failed to send verification code');
      }
    } catch (err: any) {
      console.error('Phone auth error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to send verification code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError(t.auth.phone.errorInvalidCode || 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Verify OTP via our backend (Twilio)
      const response = await apiClient.post('/api/auth/phone/verify-otp', {
        phoneNumber: formattedPhone,
        code: verificationCode
      });

      if (!response.data.success) {
        setError(response.data.error || 'Invalid verification code');
        return;
      }

      const { access_token, user, is_new_user } = response.data;

      if (is_new_user) {
        setIsNewUser(true);
        setStep('complete');
        // Store temporarily for complete registration
        (global as any).tempToken = access_token;
        (global as any).tempUser = user;
      } else {
        setAuth(user, access_token);
        setStep('success');
        setTimeout(() => {
          if (user && user.onboarding_completed === false) {
            router.replace('/onboarding/welcome');
          } else {
            router.replace('/(tabs)');
          }
        }, 1500);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Invalid verification code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!username.trim() || username.length < 3) {
      setError(t.auth.register.errorUsername || 'Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.put(
        '/api/auth/complete-registration',
        { username: username.trim(), email: email.trim() || undefined },
        { headers: { Authorization: `Bearer ${(global as any).tempToken}` } }
      );

      const { access_token, user } = response.data;
      delete (global as any).tempToken;
      delete (global as any).tempUser;

      setAuth(user, access_token);
      setStep('success');
      setTimeout(() => router.replace('/onboarding/welcome'), 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldownSeconds > 0) {
      setError(`Please wait ${cooldownSeconds} seconds before requesting a new code`);
      return;
    }
    setVerificationCode('');
    await handleSendCode();
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setVerificationCode('');
    setCooldownSeconds(0);
    if (cooldownInterval.current) {
      clearInterval(cooldownInterval.current);
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
            <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
              {step === 'complete' ? t.auth.register.title : t.auth.phone.title}
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {step === 'phone' && t.auth.phone.subtitle}
              {step === 'code' && `${t.auth.phone.codeSent || 'Code sent to'} ${formatPhoneNumber(phoneNumber)}`}
              {step === 'complete' && t.auth.register.subtitle}
              {step === 'success' && t.onboarding.complete.title}
            </Text>

            {step === 'phone' && (
              <View>
                <TextInput
                  label={t.auth.phone.phoneLabel}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="+371 20000000"
                  disabled={loading}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="phone" />}
                  autoFocus
                />
                <HelperText type="info">
                  {t.auth.phone.helperText || 'Include country code (e.g., +371 for Latvia)'}
                </HelperText>

                <Button
                  mode="contained"
                  onPress={handleSendCode}
                  loading={loading}
                  disabled={loading || !phoneNumber.trim()}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  {t.auth.phone.sendCode}
                </Button>
              </View>
            )}

            {step === 'code' && (
              <View>
                <TextInput
                  label={t.auth.phone.codeLabel}
                  value={verificationCode}
                  onChangeText={(text) => setVerificationCode(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  disabled={loading}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="shield-check" />}
                  autoFocus
                />
                <HelperText type="info">
                  {t.auth.phone.codeHelperText || 'Enter the 6-digit code sent to your phone'}
                </HelperText>

                <Button
                  mode="contained"
                  onPress={handleVerifyCode}
                  loading={loading}
                  disabled={loading || verificationCode.length !== 6}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  {t.auth.phone.verifyCode}
                </Button>

                <View style={styles.codeActions}>
                  <Button
                    mode="text"
                    onPress={handleResendCode}
                    disabled={loading || cooldownSeconds > 0}
                    compact
                  >
                    {cooldownSeconds > 0 
                      ? `${t.auth.phone.resendCode} (${cooldownSeconds}s)` 
                      : t.auth.phone.resendCode}
                  </Button>
                  <Button
                    mode="text"
                    onPress={handleChangeNumber}
                    disabled={loading}
                    compact
                  >
                    {t.auth.phone.changeNumber || 'Change number'}
                  </Button>
                </View>
              </View>
            )}

            {step === 'complete' && (
              <View>
                <TextInput
                  label={t.auth.register.nameLabel}
                  value={username}
                  onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="john_doe"
                  disabled={loading}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                  autoFocus
                />
                <HelperText type="info">
                  {t.auth.register.usernameHelperText || 'Letters, numbers, and underscores only'}
                </HelperText>

                <TextInput
                  label={`${t.auth.register.emailLabel} (${t.common.optional || 'Optional'})`}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="your@email.com"
                  disabled={loading}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
                <HelperText type="info">
                  {t.auth.register.emailHelperText || 'Used for account recovery and notifications'}
                </HelperText>

                <Button
                  mode="contained"
                  onPress={handleCompleteRegistration}
                  loading={loading}
                  disabled={loading || !username.trim()}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  {t.auth.register.createAccount}
                </Button>
              </View>
            )}

            {step === 'success' && (
              <View style={styles.successContainer}>
                <Text variant="headlineMedium" style={{ color: theme.colors.primary, textAlign: 'center' }}>
                  ✓ {t.auth.phone.verificationSuccess || 'Verified!'}
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
                  {isNewUser 
                    ? t.onboarding.complete.subtitle 
                    : (t.auth.phone.redirecting || 'Redirecting you to the app...')}
                </Text>
              </View>
            )}

            {step === 'phone' && (
              <View style={styles.loginRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t.auth.register.hasAccount}{' '}
                </Text>
                <Link href="/(auth)/login" asChild>
                  <Button mode="text" disabled={loading} compact>
                    {t.auth.register.signIn}
                  </Button>
                </Link>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        action={{
          label: t.common.dismiss,
          onPress: () => setError(''),
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 },
  content: { flex: 1 },
  title: { fontWeight: 'bold', marginBottom: 8 },
  subtitle: { marginBottom: 32 },
  input: { marginBottom: 4 },
  button: { borderRadius: 12, marginTop: 16 },
  buttonContent: { paddingVertical: 8 },
  codeActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  successContainer: { paddingVertical: 48 },
});
