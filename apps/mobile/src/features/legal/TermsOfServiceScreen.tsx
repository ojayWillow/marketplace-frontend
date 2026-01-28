import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeStore } from '../../stores/themeStore';
import { colors } from '../../theme';

export default function TermsOfServiceScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    lastUpdated: {
      fontSize: 12,
      color: themeColors.textSecondary,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text,
      marginTop: 20,
      marginBottom: 12,
    },
    paragraph: {
      fontSize: 14,
      lineHeight: 22,
      color: themeColors.textSecondary,
      marginBottom: 12,
    },
    bullet: {
      fontSize: 14,
      lineHeight: 22,
      color: themeColors.textSecondary,
      marginLeft: 16,
      marginBottom: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Appbar.Header style={{ backgroundColor: themeColors.card }}>
        <Appbar.BackAction onPress={() => router.back()} color={themeColors.text} />
        <Appbar.Content title="Terms of Service" titleStyle={{ color: themeColors.text }} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using this application, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use this application.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          Our marketplace application provides a platform that connects users who need tasks completed with users who can perform those tasks. We facilitate the connection but are not a party to any agreements between users.
        </Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>To use certain features of the app, you must register for an account. You agree to:</Text>
        <Text style={styles.bullet}>• Provide accurate and complete information</Text>
        <Text style={styles.bullet}>• Maintain the security of your account credentials</Text>
        <Text style={styles.bullet}>• Promptly update any changes to your information</Text>
        <Text style={styles.bullet}>• Accept responsibility for all activities under your account</Text>

        <Text style={styles.sectionTitle}>4. User Conduct</Text>
        <Text style={styles.paragraph}>When using our service, you agree not to:</Text>
        <Text style={styles.bullet}>• Violate any laws or regulations</Text>
        <Text style={styles.bullet}>• Infringe on the rights of others</Text>
        <Text style={styles.bullet}>• Post false, misleading, or fraudulent content</Text>
        <Text style={styles.bullet}>• Harass, abuse, or harm other users</Text>
        <Text style={styles.bullet}>• Attempt to gain unauthorized access to our systems</Text>

        <Text style={styles.sectionTitle}>5. Payments and Fees</Text>
        <Text style={styles.paragraph}>
          Users may agree to payments for tasks through the platform. We may charge service fees for facilitating transactions. All fees will be clearly disclosed before any transaction is completed.
        </Text>

        <Text style={styles.sectionTitle}>6. Dispute Resolution</Text>
        <Text style={styles.paragraph}>
          We provide tools to help resolve disputes between users. However, we are not responsible for resolving disputes and make no guarantees about the outcome of any dispute resolution process.
        </Text>

        <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
        </Text>

        <Text style={styles.sectionTitle}>8. Indemnification</Text>
        <Text style={styles.paragraph}>
          You agree to indemnify and hold harmless our company and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising from your use of the service or violation of these terms.
        </Text>

        <Text style={styles.sectionTitle}>9. Modifications to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page and updating the "Last Updated" date.
        </Text>

        <Text style={styles.sectionTitle}>10. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including breach of these Terms.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms of Service, please contact us at support@marketplace.local or through the contact form in the app settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
