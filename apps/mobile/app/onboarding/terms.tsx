import { View, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Checkbox } from 'react-native-paper';
import { router } from 'expo-router';
import { AnimatedGradient } from '../../src/components/AnimatedGradient';

const ProgressDots = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <View style={styles.progressContainer}>
    {Array.from({ length: totalSteps }).map((_, index) => (
      <View
        key={index}
        style={[
          styles.progressDot,
          index === currentStep && styles.progressDotActive,
        ]}
      />
    ))}
  </View>
);

export default function TermsScreen() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleContinue = () => {
    if (termsAccepted && privacyAccepted) {
      router.push('/onboarding/notifications');
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedGradient />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ProgressDots currentStep={1} totalSteps={4} />

        <View style={styles.content}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Terms & Privacy</Text>
              <Text style={styles.subtitle}>
                Please review and accept to continue
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📜</Text>
                <Text style={styles.sectionTitle}>Terms of Service</Text>
              </View>
              <Text style={styles.bulletPoint}>• Treat all users with respect and professionalism</Text>
              <Text style={styles.bulletPoint}>• Complete jobs as agreed or communicate changes promptly</Text>
              <Text style={styles.bulletPoint}>• Pay for services rendered in a timely manner</Text>
              <Text style={styles.bulletPoint}>• Report any violations or safety concerns immediately</Text>
              <Text style={styles.bulletPoint}>• Do not engage in fraud, harassment, or illegal activities</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🔒</Text>
                <Text style={styles.sectionTitle}>Privacy Policy</Text>
              </View>
              <Text style={styles.bulletPoint}>• Your data is encrypted and stored securely</Text>
              <Text style={styles.bulletPoint}>• We never sell your personal information to third parties</Text>
              <Text style={styles.bulletPoint}>• You control your profile visibility and privacy settings</Text>
              <Text style={styles.bulletPoint}>• You can delete your account and data at any time</Text>
              <Text style={styles.bulletPoint}>• We use data to improve your experience and ensure safety</Text>
            </View>

            <View style={styles.checkboxSection}>
              <Text style={styles.checkboxSectionTitle}>Please accept both to continue:</Text>
              
              <View 
                style={[
                  styles.checkboxBox,
                  termsAccepted && styles.checkboxBoxChecked
                ]}
                onTouchEnd={() => setTermsAccepted(!termsAccepted)}
              >
                <Checkbox
                  status={termsAccepted ? 'checked' : 'unchecked'}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  color="#22c55e"
                  uncheckedColor="rgba(255, 255, 255, 0.6)"
                />
                <Text style={styles.checkboxLabel}>
                  I accept the Terms of Service
                </Text>
              </View>

              <View 
                style={[
                  styles.checkboxBox,
                  privacyAccepted && styles.checkboxBoxChecked
                ]}
                onTouchEnd={() => setPrivacyAccepted(!privacyAccepted)}
              >
                <Checkbox
                  status={privacyAccepted ? 'checked' : 'unchecked'}
                  onPress={() => setPrivacyAccepted(!privacyAccepted)}
                  color="#22c55e"
                  uncheckedColor="rgba(255, 255, 255, 0.6)"
                />
                <Text style={styles.checkboxLabel}>
                  I accept the Privacy Policy
                </Text>
              </View>
            </View>
          </ScrollView>

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
              buttonColor="#22c55e"
              textColor="#ffffff"
            >
              Continue
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#ffffff',
    width: 24,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  bulletPoint: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 8,
  },
  checkboxSection: {
    marginTop: 24,
  },
  checkboxSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  checkboxBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  checkboxBoxChecked: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButton: {
    borderRadius: 12,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    paddingVertical: 10,
  },
});
