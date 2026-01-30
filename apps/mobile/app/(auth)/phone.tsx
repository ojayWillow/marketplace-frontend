import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme, Snackbar, HelperText } from 'react-native-paper';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { getFirebaseAuth } from '../../src/config/firebase';
import * as WebBrowser from 'expo-web-browser';
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
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const theme = useTheme();

  useEffect(() => {
    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, [recaptchaVerifier]);

  const formatPhoneNumber = (phone: string): string => {
    let formatted = phone.trim();
    if (!formatted.startsWith('+')) {
      formatted = '+371' + formatted.replace(/^0+/, '');
    }
    return formatted;
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setError(t.auth.forgotPassword.errorNoEmail);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const auth = getFirebaseAuth();
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, undefined as any);
      setConfirmationResult(confirmation);
      setStep('code');
    } catch (err: any) {
      console.error('Phone auth error:', err);
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (!confirmationResult) {
      setError('Verification session expired. Please request a new code.');
      setStep('phone');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await confirmationResult.confirm(verificationCode);
      if (!userCredential || !userCredential.user) {
        throw new Error('Verification failed');
      }

      const idToken = await userCredential.user.getIdToken();
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const response = await apiClient.post('/api/auth/phone/verify', {
        idToken,
        phoneNumber: formattedPhone
      });

      const { access_token, user, is_new_user } = response.data;

      if (is_new_user) {
        setIsNewUser(true);
        setStep('complete');
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
      setError(err.response?.data?.message || err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!username.trim() || username.length < 3) {
      setError('Username must be at least 3 characters');
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
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setVerificationCode('');
    setConfirmationResult(null);
    await handleSendCode();
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
              {step === 'code' && t.auth.phone.codeLabel + ` ${formatPhoneNumber(phoneNumber)}`}
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
                  placeholder="+371 XXXXXXXX"
                  disabled={loading}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="phone" />}
                />
                <HelperText type="info">
                  Include country code (e.g., +371 for Latvia)
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
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  disabled={loading}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="shield-check" />}
                />

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
                    disabled={loading}
                    compact
                  >
                    {t.auth.phone.resendCode}
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => {
                      setStep('phone');
                      setConfirmationResult(null);
                      setVerificationCode('');
                    }}
                    disabled={loading}
                    compact
                  >
                    {t.auth.forgotPassword.backToLogin}
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
                />

                <TextInput
                  label={t.auth.register.emailLabel + ' (Optional)'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholder="your@email.com"
                  disabled={loading}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
                <HelperText type="info">
                  Used for account recovery and notifications
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
                  ✓ {t.onboarding.welcome.title}
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
                  {isNewUser ? t.onboarding.complete.subtitle : 'Redirecting you to the app...'}
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
  input: { marginBottom: 8 },
  button: { borderRadius: 12, marginTop: 16 },
  buttonContent: { paddingVertical: 8 },
  codeActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  successContainer: { paddingVertical: 48 },
});
