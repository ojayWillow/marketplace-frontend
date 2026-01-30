import { View, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
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

export default function NotificationsScreen() {
  const requestNotificationPermission = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        router.push('/onboarding/values');
      } else {
        Alert.alert(
          'No worries',
          'You can enable notifications later in Settings.',
          [
            { text: 'OK', onPress: () => router.push('/onboarding/values') }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      router.push('/onboarding/values');
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/values');
  };

  return (
    <View style={styles.container}>
      <AnimatedGradient />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ProgressDots currentStep={2} totalSteps={4} />

        <View style={styles.content}>
          <View style={styles.topSection}>
            <Text style={styles.icon}>🔔</Text>
            <Text style={styles.title}>Stay Updated</Text>
            <Text style={styles.subtitle}>
              Get notified about important updates so you never miss an opportunity
            </Text>

            <View style={styles.benefitsContainer}>
              <View style={styles.benefitCard}>
                <Text style={styles.benefitIcon}>📬</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>New Messages</Text>
                  <Text style={styles.benefitDescription}>
                    Get instant alerts when someone contacts you
                  </Text>
                </View>
              </View>

              <View style={styles.benefitCard}>
                <Text style={styles.benefitIcon}>✅</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Job Applications</Text>
                  <Text style={styles.benefitDescription}>
                    Know when someone applies to your job posting
                  </Text>
                </View>
              </View>

              <View style={styles.benefitCard}>
                <Text style={styles.benefitIcon}>🎉</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Job Completions</Text>
                  <Text style={styles.benefitDescription}>
                    Celebrate when work is done and payment is ready
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={requestNotificationPermission}
              style={styles.enableButton}
              contentStyle={styles.buttonContent}
              buttonColor="#22c55e"
              textColor="#ffffff"
            >
              Enable Notifications
            </Button>
            <Button
              mode="outlined"
              onPress={handleSkip}
              style={styles.skipButton}
              contentStyle={styles.buttonContent}
              textColor="rgba(255, 255, 255, 0.7)"
            >
              Skip for Now
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
    padding: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 96,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  benefitsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingBottom: 16,
  },
  enableButton: {
    borderRadius: 12,
    marginBottom: 12,
  },
  skipButton: {
    borderRadius: 12,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonContent: {
    paddingVertical: 10,
  },
});
