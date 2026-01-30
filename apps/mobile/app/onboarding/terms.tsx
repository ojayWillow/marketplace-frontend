import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Checkbox } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function TermsScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const canContinue = termsAccepted && privacyAccepted;

  const handleContinue = () => {
    if (canContinue) {
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
      padding: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
      marginTop: 20,
    },
    icon: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: themeColors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: themeColors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    scrollContent: {
      flex: 1,
      backgroundColor: themeColors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 12,
      marginTop: 16,
    },
    paragraph: {
      fontSize: 14,
      color: themeColors.textSecondary,
      lineHeight: 22,
      marginBottom: 12,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 8,
    },
    checkboxLabel: {
      flex: 1,
      fontSize: 14,
      color: themeColors.text,
      marginLeft: 8,
      lineHeight: 20,
    },
    link: {
      color: themeColors.primaryAccent,
      fontWeight: '600',
    },
    buttonContainer: {
      paddingBottom: 16,
    },
    continueButton: {
      borderRadius: 12,
      backgroundColor: themeColors.primaryAccent,
    },
    continueButtonDisabled: {
      backgroundColor: themeColors.border,
    },
    buttonContent: {
      paddingVertical: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>📜</Text>
          <Text style={styles.title}>Terms & Privacy</Text>
          <Text style={styles.subtitle}>
            Please review and accept our terms to continue
          </Text>
        </View>

        {/* Scrollable Terms Content */}
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.sectionTitle}>Terms of Service</Text>
          <Text style={styles.paragraph}>
            By using Kolab, you agree to:
          </Text>
          <Text style={styles.paragraph}>
            • Provide accurate information about yourself and your services{"\n"}
            • Treat all users with respect and professionalism{"\n"}
            • Complete jobs as agreed or communicate changes promptly{"\n"}
            • Pay for services rendered as agreed{"\n"}
            • Report any issues or violations to our team{"\n"}
          </Text>

          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We take your privacy seriously:
          </Text>
          <Text style={styles.paragraph}>
            • Your personal data is encrypted and secure{"\n"}
            • We only share information necessary for transactions{"\n"}
            • You control your profile visibility{"\n"}
            • We never sell your data to third parties{"\n"}
            • You can delete your account anytime{"\n"}
          </Text>

          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            • Access and update your data anytime{"\n"}
            • Request data deletion{"\n"}
            • Opt out of non-essential communications{"\n"}
            • Report safety concerns confidentially{"\n"}
          </Text>
        </ScrollView>

        {/* Checkboxes */}
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={termsAccepted ? 'checked' : 'unchecked'}
            onPress={() => setTermsAccepted(!termsAccepted)}
            color={themeColors.primaryAccent}
          />
          <Text style={styles.checkboxLabel}>
            I accept the <Text style={styles.link}>Terms of Service</Text>
          </Text>
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            status={privacyAccepted ? 'checked' : 'unchecked'}
            onPress={() => setPrivacyAccepted(!privacyAccepted)}
            color={themeColors.primaryAccent}
          />
          <Text style={styles.checkboxLabel}>
            I accept the <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleContinue}
            disabled={!canContinue}
            style={[
              styles.continueButton,
              !canContinue && styles.continueButtonDisabled,
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
