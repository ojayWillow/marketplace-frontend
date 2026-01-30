import { View, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Checkbox } from 'react-native-paper';
import { router } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function TermsScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleContinue = () => {
    if (termsAccepted && privacyAccepted) {
      router.push('/onboarding/notifications');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 24,
      paddingBottom: 120,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: themeColors.textSecondary,
      lineHeight: 24,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 12,
    },
    bulletPoint: {
      fontSize: 15,
      color: themeColors.textSecondary,
      lineHeight: 24,
      marginBottom: 8,
      paddingLeft: 8,
    },
    checkboxContainer: {
      marginTop: 32,
      gap: 16,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.card,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: themeColors.border,
    },
    checkboxRowChecked: {
      borderColor: themeColors.primaryAccent,
      backgroundColor: activeTheme === 'dark'
        ? 'rgba(56, 189, 248, 0.1)'
        : 'rgba(14, 165, 233, 0.05)',
    },
    checkbox: {
      marginRight: 12,
    },
    checkboxLabel: {
      fontSize: 16,
      color: themeColors.text,
      fontWeight: '500',
      flex: 1,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: themeColors.background,
      padding: 24,
      paddingBottom: 32,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    continueButton: {
      borderRadius: 12,
      backgroundColor: themeColors.primaryAccent,
    },
    continueButtonDisabled: {
      backgroundColor: themeColors.border,
    },
    buttonContent: {
      paddingVertical: 10,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Terms & Privacy</Text>
            <Text style={styles.subtitle}>
              Please review and accept our terms to continue
            </Text>
          </View>

          {/* Terms of Service */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📜 Terms of Service</Text>
            <Text style={styles.bulletPoint}>• Treat all users with respect and professionalism</Text>
            <Text style={styles.bulletPoint}>• Complete jobs as agreed or communicate changes promptly</Text>
            <Text style={styles.bulletPoint}>• Pay for services rendered in a timely manner</Text>
            <Text style={styles.bulletPoint}>• Report any violations or safety concerns immediately</Text>
            <Text style={styles.bulletPoint}>• Do not engage in fraud, harassment, or illegal activities</Text>
          </View>

          {/* Privacy Policy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Privacy Policy</Text>
            <Text style={styles.bulletPoint}>• Your data is encrypted and stored securely</Text>
            <Text style={styles.bulletPoint}>• We never sell your personal information to third parties</Text>
            <Text style={styles.bulletPoint}>• You control your profile visibility and privacy settings</Text>
            <Text style={styles.bulletPoint}>• You can delete your account and data at any time</Text>
            <Text style={styles.bulletPoint}>• We use data to improve your experience and ensure safety</Text>
          </View>

          {/* Acceptance Checkboxes with Clear Borders */}
          <View style={styles.checkboxContainer}>
            <View style={[
              styles.checkboxRow,
              termsAccepted && styles.checkboxRowChecked
            ]}>
              <Checkbox
                status={termsAccepted ? 'checked' : 'unchecked'}
                onPress={() => setTermsAccepted(!termsAccepted)}
                color={themeColors.primaryAccent}
                uncheckedColor={themeColors.textSecondary}
              />
              <Text style={styles.checkboxLabel}>
                I accept the Terms of Service
              </Text>
            </View>

            <View style={[
              styles.checkboxRow,
              privacyAccepted && styles.checkboxRowChecked
            ]}>
              <Checkbox
                status={privacyAccepted ? 'checked' : 'unchecked'}
                onPress={() => setPrivacyAccepted(!privacyAccepted)}
                color={themeColors.primaryAccent}
                uncheckedColor={themeColors.textSecondary}
              />
              <Text style={styles.checkboxLabel}>
                I accept the Privacy Policy
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleContinue}
            disabled={!termsAccepted || !privacyAccepted}
            style={[
              styles.continueButton,
              (!termsAccepted || !privacyAccepted) && styles.continueButtonDisabled
            ]}
            contentStyle={styles.buttonContent}
          >
            Continue
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
