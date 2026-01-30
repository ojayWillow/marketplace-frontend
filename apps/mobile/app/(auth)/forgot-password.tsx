import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';
import { haptic } from '../../utils/haptics';
import { authApi } from '@marketplace/shared';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetEmail = async () => {
    setError('');
    setSuccess(false);

    if (!email) {
      haptic.warning();
      setError(t.auth.forgotPassword.errorNoEmail);
      return;
    }

    if (!validateEmail(email)) {
      haptic.warning();
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    haptic.medium();

    try {
      await authApi.forgotPassword(email);
      haptic.success();
      setSuccess(true);
      setError('');
    } catch (err: any) {
      haptic.error();
      console.error('Password reset error:', err);
      const message = err.response?.data?.error || t.auth.forgotPassword.errorGeneric;
      setError(message);
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
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>
              🔑
            </Text>
            <Text variant="headlineMedium" style={styles.heading}>
              {t.auth.forgotPassword.title}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {success 
                ? t.auth.forgotPassword.successMessage
                : t.auth.forgotPassword.subtitle}
            </Text>
          </View>

          {success && (
            <Surface style={styles.successCard} elevation={0}>
              <Text style={styles.successIcon}>✅</Text>
              <Text variant="titleMedium" style={styles.successTitle}>
                {t.auth.forgotPassword.successMessage}
              </Text>
              <Text variant="bodyMedium" style={styles.successText}>
                {t.auth.forgotPassword.successMessage} <Text style={styles.emailBold}>{email}</Text>
              </Text>
              <Text variant="bodySmall" style={styles.successHint}>
                💡 {t.auth.forgotPassword.successMessage}
              </Text>
            </Surface>
          )}

          {!success && (
            <View style={styles.form}>
              <TextInput
                label={t.auth.forgotPassword.emailLabel}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
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
                {loading ? t.auth.forgotPassword.sending : t.auth.forgotPassword.sendResetLink}
              </Button>
            </View>
          )}

          <Button
            mode="text"
            onPress={handleBackToLogin}
            style={styles.backButton}
            icon="arrow-left"
          >
            {t.auth.forgotPassword.backToLogin}
          </Button>

          <View style={styles.helpSection}>
            <Text variant="bodySmall" style={styles.helpText}>
              Still having trouble?
            </Text>
            <Text variant="bodySmall" style={styles.helpLink}>
              Contact support@quickhelp.lv
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
