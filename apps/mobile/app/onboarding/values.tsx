import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
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

export default function ValuesScreen() {
  const handleContinue = () => {
    router.push('/onboarding/tutorial');
  };

  return (
    <View style={styles.container}>
      <AnimatedGradient />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ProgressDots currentStep={3} totalSteps={4} />

        <View style={styles.content}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.icon}>🤝</Text>
              <Text style={styles.title}>Welcome to KOLAB</Text>
              <Text style={styles.subtitle}>
                We're building a safe, respectful community where everyone can work together with confidence
              </Text>
            </View>

            <View style={styles.valuesContainer}>
              <View style={styles.valueCard}>
                <Text style={styles.valueIcon}>🛡️</Text>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>Safety First</Text>
                  <Text style={styles.valueDescription}>
                    Your safety is our top priority. We verify users, secure payments, and provide tools to report any concerns.
                  </Text>
                </View>
              </View>

              <View style={styles.valueCard}>
                <Text style={styles.valueIcon}>❤️</Text>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>Respect Everyone</Text>
                  <Text style={styles.valueDescription}>
                    Every person deserves dignity and respect. Treat others as you'd like to be treated.
                  </Text>
                </View>
              </View>

              <View style={styles.valueCard}>
                <Text style={styles.valueIcon}>🔒</Text>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>Trust & Transparency</Text>
                  <Text style={styles.valueDescription}>
                    Build trust through honest communication, fair pricing, and reliable work.
                  </Text>
                </View>
              </View>

              <View style={styles.valueCard}>
                <Text style={styles.valueIcon}>🚀</Text>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>Grow Together</Text>
                  <Text style={styles.valueDescription}>
                    Help each other succeed. Leave honest reviews and support fellow community members.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.commitmentBox}>
              <Text style={styles.commitmentIcon}>✨</Text>
              <Text style={styles.commitmentTitle}>Our Commitment to You</Text>
              <Text style={styles.commitmentText}>
                We're here 24/7 to support you. If anything feels wrong or unsafe, report it immediately. We take every concern seriously.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleContinue}
              style={styles.continueButton}
              contentStyle={styles.buttonContent}
              buttonColor="#22c55e"
              textColor="#ffffff"
            >
              Let's Get Started 🎉
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
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 72,
    marginBottom: 16,
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
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  valuesContainer: {
    marginTop: 8,
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  valueIcon: {
    fontSize: 32,
    marginRight: 16,
    marginTop: 2,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  valueDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
  },
  commitmentBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    alignItems: 'center',
  },
  commitmentIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  commitmentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  commitmentText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    textAlign: 'center',
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
  buttonContent: {
    paddingVertical: 10,
  },
});
