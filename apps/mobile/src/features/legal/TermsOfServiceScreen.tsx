import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>

        <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
        </Text>

        <Text style={styles.sectionTitle}>2. Use License</Text>
        <Text style={styles.paragraph}>
          Permission is granted to temporarily download one copy of the materials (information or software) on our app for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </Text>
        <Text style={styles.bullet}>• Modify or copy the materials</Text>
        <Text style={styles.bullet}>• Use the materials for any commercial purpose or for any public display</Text>
        <Text style={styles.bullet}>• Attempt to decompile or reverse engineer the software</Text>
        <Text style={styles.bullet}>• Remove any copyright or other proprietary notations from the materials</Text>
        <Text style={styles.bullet}>• Transfer the materials to another person or "mirror" the materials on any other server</Text>

        <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          As a user of our platform, you are responsible for:
        </Text>
        <Text style={styles.bullet}>• Providing accurate and complete information during registration</Text>
        <Text style={styles.bullet}>• Maintaining the confidentiality of your account credentials</Text>
        <Text style={styles.bullet}>• All activity that occurs under your account</Text>
        <Text style={styles.bullet}>• Complying with all applicable laws and regulations</Text>
        <Text style={styles.bullet}>• Not engaging in fraudulent or illegal activities</Text>

        <Text style={styles.sectionTitle}>4. User Content</Text>
        <Text style={styles.paragraph}>
          You retain all rights to any content you submit, post, or display on or through the app. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content in connection with our services.
        </Text>
        <Text style={styles.paragraph}>
          You agree not to submit content that is illegal, defamatory, threatening, offensive, or violates any third-party rights.
        </Text>

        <Text style={styles.sectionTitle}>5. Payment Terms</Text>
        <Text style={styles.paragraph}>
          All payments made through our platform are final and non-refundable unless otherwise specified. We use secure payment processing, but you are responsible for protecting your payment information.
        </Text>

        <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          In no event shall our company be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with your use of the app or the materials contained therein.
        </Text>

        <Text style={styles.sectionTitle}>7. Dispute Resolution</Text>
        <Text style={styles.paragraph}>
          Any dispute arising out of or in connection with these terms and conditions shall be governed by and construed in accordance with the laws of Latvia, and you irrevocably submit to the exclusive jurisdiction of the courts located there.
        </Text>

        <Text style={styles.sectionTitle}>8. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason whatsoever, including if you breach the terms of this agreement.
        </Text>

        <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these terms at any time. Your continued use of the app following the posting of revised terms means that you accept and agree to the changes.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms of Service, please contact us at legal@marketplace.local or through the contact form in the app settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
