import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeStore } from '../../stores/themeStore';
import { colors } from '../../theme';

export default function PrivacyPolicyScreen() {
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
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: themeColors.text,
      marginBottom: 16,
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
        <Appbar.Content title="Privacy Policy" titleStyle={{ color: themeColors.text }} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>We may collect information about you in a variety of ways. The information we may collect on the app includes:</Text>
        <Text style={styles.bullet}>• Account information (name, email, phone number)</Text>
        <Text style={styles.bullet}>• Location data (with your permission)</Text>
        <Text style={styles.bullet}>• Task and service listings you create</Text>
        <Text style={styles.bullet}>• Transaction history</Text>
        <Text style={styles.bullet}>• Device information and usage data</Text>

        <Text style={styles.sectionTitle}>3. Use of Your Information</Text>
        <Text style={styles.paragraph}>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the app to:</Text>
        <Text style={styles.bullet}>• Create and manage your account</Text>
        <Text style={styles.bullet}>• Process transactions</Text>
        <Text style={styles.bullet}>• Send administrative information and updates</Text>
        <Text style={styles.bullet}>• Improve and optimize our services</Text>
        <Text style={styles.bullet}>• Prevent fraudulent transactions</Text>
        <Text style={styles.bullet}>• Respond to your inquiries</Text>

        <Text style={styles.sectionTitle}>4. Disclosure of Your Information</Text>
        <Text style={styles.paragraph}>
          We may share your information with third parties only in the ways that are described in this privacy policy. We may disclose your personal information when required by law or when we believe in good faith that such disclosure is necessary to:
        </Text>
        <Text style={styles.bullet}>• Comply with the law</Text>
        <Text style={styles.bullet}>• Enforce our policies</Text>
        <Text style={styles.bullet}>• Protect our or others' rights, privacy, safety, or property</Text>

        <Text style={styles.sectionTitle}>5. Security of Your Information</Text>
        <Text style={styles.paragraph}>
          We use administrative, technical, and physical security measures to protect your personal information. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
        </Text>

        <Text style={styles.sectionTitle}>6. Location Services</Text>
        <Text style={styles.paragraph}>
          Our application may request access to your device's location services. This information is used to help you find nearby tasks and services. You can control location permissions through your device settings.
        </Text>

        <Text style={styles.sectionTitle}>7. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions or concerns about this Privacy Policy, please contact us at privacy@marketplace.local or through the contact form in the app settings.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify this privacy policy at any time. Changes and clarifications will take effect immediately upon posting to the app. We will notify users of any changes by updating the "Last Updated" date of this Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
