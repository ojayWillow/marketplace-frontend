import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function ValuesScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const handleContinue = () => {
    router.push('/onboarding/tutorial');
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
      paddingBottom: 100,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
      marginTop: 20,
    },
    icon: {
      fontSize: 72,
      marginBottom: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: themeColors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 18,
      color: themeColors.textSecondary,
      textAlign: 'center',
      lineHeight: 26,
      paddingHorizontal: 16,
    },
    valuesContainer: {
      marginTop: 20,
    },
    valueCard: {
      backgroundColor: themeColors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    valueHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    valueIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    valueTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: themeColors.text,
      flex: 1,
    },
    valueDescription: {
      fontSize: 15,
      color: themeColors.textSecondary,
      lineHeight: 22,
    },
    commitmentBox: {
      backgroundColor: activeTheme === 'dark' 
        ? 'rgba(56, 189, 248, 0.1)' 
        : 'rgba(14, 165, 233, 0.08)',
      borderRadius: 12,
      padding: 20,
      marginTop: 24,
      borderWidth: 2,
      borderColor: activeTheme === 'dark'
        ? 'rgba(56, 189, 248, 0.3)'
        : 'rgba(14, 165, 233, 0.2)',
    },
    commitmentTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: themeColors.primaryAccent,
      marginBottom: 12,
      textAlign: 'center',
    },
    commitmentText: {
      fontSize: 14,
      color: themeColors.text,
      lineHeight: 22,
      textAlign: 'center',
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
            <Text style={styles.icon}>🤝</Text>
            <Text style={styles.title}>Welcome to Kolab</Text>
            <Text style={styles.subtitle}>
              We're building a safe, respectful community where everyone can work together with confidence
            </Text>
          </View>

          {/* Core Values */}
          <View style={styles.valuesContainer}>
            <View style={styles.valueCard}>
              <View style={styles.valueHeader}>
                <Text style={styles.valueIcon}>🛡️</Text>
                <Text style={styles.valueTitle}>Safety First</Text>
              </View>
              <Text style={styles.valueDescription}>
                Your safety is our top priority. We verify users, secure payments, and provide tools to report any concerns. You're protected every step of the way.
              </Text>
            </View>

            <View style={styles.valueCard}>
              <View style={styles.valueHeader}>
                <Text style={styles.valueIcon}>❤️</Text>
                <Text style={styles.valueTitle}>Respect Everyone</Text>
              </View>
              <Text style={styles.valueDescription}>
                Every person deserves dignity and respect. Treat others as you'd like to be treated. Harassment, discrimination, and disrespect have no place here.
              </Text>
            </View>

            <View style={styles.valueCard}>
              <View style={styles.valueHeader}>
                <Text style={styles.valueIcon}>🔒</Text>
                <Text style={styles.valueTitle}>Trust & Transparency</Text>
              </View>
              <Text style={styles.valueDescription}>
                Build trust through honest communication, fair pricing, and reliable work. Be transparent about expectations and deliver on your promises.
              </Text>
            </View>

            <View style={styles.valueCard}>
              <View style={styles.valueHeader}>
                <Text style={styles.valueIcon}>🚀</Text>
                <Text style={styles.valueTitle}>Grow Together</Text>
              </View>
              <Text style={styles.valueDescription}>
                Help each other succeed. Leave honest reviews, share helpful feedback, and support fellow community members. When one person grows, we all benefit.
              </Text>
            </View>
          </View>

          {/* Our Commitment */}
          <View style={styles.commitmentBox}>
            <Text style={styles.commitmentTitle}>✨ Our Commitment to You</Text>
            <Text style={styles.commitmentText}>
              We're here 24/7 to support you. If anything feels wrong or unsafe, report it immediately. We take every concern seriously and act swiftly to protect our community.
            </Text>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            contentStyle={styles.buttonContent}
          >
            Let's Get Started 🎉
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
