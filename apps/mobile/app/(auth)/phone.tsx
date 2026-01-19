import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme, Snackbar, HelperText } from 'react-native-paper';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, firebaseConfig } from '../../src/lib/firebase';
import { useAuthStore } from '@marketplace/shared';
import apiClient from '@marketplace/shared/src/api/client';

type Step = 'phone' | 'code' | 'complete' | 'success';

export default function PhoneAuthScreen() {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const recaptchaVerifier = React.useRef(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const theme = useTheme();

  // Send verification code
  const handleSendCode = async () => {
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const id = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      setVerificationId(id);
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Sign in with Firebase
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const result = await signInWithCredential(auth, credential);
      const idToken = await result.user.getIdToken();

      // Verify with backend
      const response = await apiClient.post('/api/auth/phone/verify', {
        idToken,
        phoneNumber
      });

      const { access_token, user, is_new_user } = response.data;

      if (is_new_user) {
        setIsNewUser(true);
        setStep('complete');
        // Store token temporarily
        global.tempToken = access_token;
        global.tempUser = user;
      } else {
        setAuth(user, access_token);
        setStep('success');
        setTimeout(() => router.replace('/(tabs)'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Complete registration
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
        { headers: { Authorization: `Bearer ${global.tempToken}` } }
      );

      const { access_token, user } = response.data;
      delete global.tempToken;
      delete global.tempUser;

      setAuth(user, access_token);
      setStep('success');
      setTimeout(() => router.replace('/(tabs)'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
              {step === 'complete' ? 'Complete Your Profile' : 'Sign in with Phone'}
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {step === 'phone' && "We'll send you a verification code"}
              {step === 'code' && `Code sent to ${phoneNumber}`}
              {step === 'complete' && 'Just a few more details'}
              {step === 'success' && "You're all set!"}
            </Text>

            {/* Step 1: Phone Number */}
            {step === 'phone' && (
              <View>
                <TextInput
                  label="Phone Number"
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
                  Send Code
                </Button>
              </View>
            )}

            {/* Step 2: Verification Code */}
            {step === 'code' && (
              <View>
                <TextInput
                  label="Verification Code"
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
                  Verify Code
                </Button>

                <Button
                  mode="text"
                  onPress={() => setStep('phone')}
                  disabled={loading}
                  style={styles.backButton}
                >
                  Change Phone Number
                </Button>
              </View>
            )}

            {/* Step 3: Complete Profile (New Users) */}
            {step === 'complete' && (
              <View>
                <TextInput
                  label="Username"
                  value={username}
                  onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="john_doe"
                  disabled={loading}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />

                <TextInput
                  label="Email (Optional)"
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
                  Create Account
                </Button>
              </View>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <View style={styles.successContainer}>
                <Text variant="headlineMedium" style={{ color: theme.colors.primary, textAlign: 'center' }}>
                  ✓ Welcome!
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
                  Redirecting you to the app...
                </Text>
              </View>
            )}

            {/* Email Login Link */}
            {step === 'phone' && (
              <View style={styles.loginRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Have an email account?{' '}
                </Text>
                <Link href="/(auth)/login" asChild>
                  <Button mode="text" disabled={loading} compact>
                    Sign In
                  </Button>
                </Link>
              </View>
            )}
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
    marginBottom: 32,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    borderRadius: 12,
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 8,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  successContainer: {
    paddingVertical: 48,
  },
});
