import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { haptic } from '../../utils/haptics';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetEmail = async () => {
    // Clear previous messages
    setError('');
    setSuccess(false);

    // Validation
    if (!email) {
      haptic.warning();
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      haptic.warning();
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    haptic.medium(); // Haptic on submit

    try {
      // Send password reset email via Firebase
      await sendPasswordResetEmail(auth, email);
      
      haptic.success(); // Success haptic
      setSuccess(true);
      setError('');
    } catch (err: any) {
      haptic.error(); // Error haptic
      console.error('Password reset error:', err);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later');
      } else {
        setError('Failed to send reset email. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    haptic.light();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>
              🔑
            </Text>
            <Text variant="headlineMedium" style={styles.heading}>
              Forgot Password?
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {success 
                ? "We've sent you a password reset link!" 
                : "No worries! Enter your email and we'll send you a reset link."}
            </Text>
          </View>

          {/* Success Message */}
          {success && (
            <Surface style={styles.successCard} elevation={0}>
              <Text style={styles.successIcon}>✅</Text>
              <Text variant="titleMedium" style={styles.successTitle}>
                Email Sent Successfully!
              </Text>
              <Text variant="bodyMedium" style={styles.successText}>
                Check your email <Text style={styles.emailBold}>{email}</Text> for a password reset link.
              </Text>
              <Text variant="bodySmall" style={styles.successHint}>
                💡 Don't forget to check your spam folder if you don't see it.
              </Text>
            </Surface>
          )}

          {/* Form */}
          {!success && (
            <View style={styles.form}>
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(''); // Clear error on input
                }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                left={<TextInput.Icon icon="email" />}
                error={!!error}
                disabled={loading}
                style={styles.input}
              />

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              <Button
                mode="contained"
                onPress={handleSendResetEmail}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                contentStyle={styles.buttonContent}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </View>
          )}

          {/* Back to Login */}
          <Button
            mode="text"
            onPress={handleBackToLogin}
            style={styles.backButton}
            icon="arrow-left"
          >
            Back to Login
          </Button>

          {/* Additional Help */}
          <View style={styles.helpSection}>
            <Text variant="bodySmall" style={styles.helpText}>
              Still having trouble?
            </Text>
            <Text variant="bodySmall" style={styles.helpLink}>
              Contact support@quick-help.lv
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 64,
    marginBottom: 16,
  },
  heading: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: '#0ea5e9',
  },
  buttonContent: {
    height: 48,
  },
  successCard: {
    backgroundColor: '#d1fae5',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    color: '#065f46',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    color: '#047857',
    textAlign: 'center',
    marginBottom: 12,
  },
  emailBold: {
    fontWeight: 'bold',
    color: '#065f46',
  },
  successHint: {
    color: '#059669',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  backButton: {
    marginTop: 8,
  },
  helpSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  helpText: {
    color: '#9ca3af',
    marginBottom: 4,
  },
  helpLink: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
});
