import { View, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function NotificationsScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const requestNotificationPermission = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        // Permission granted
        router.push('/onboarding/values');
      } else {
        // Permission denied - still continue
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
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
      fontSize: 28,
      fontWeight: 'bold',
      color: themeColors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: themeColors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 40,
    },
    benefitsContainer: {
      width: '100%',
      maxWidth: 360,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 20,
      paddingHorizontal: 16,
    },
    benefitIcon: {
      fontSize: 24,
      marginRight: 16,
      marginTop: 2,
    },
    benefitText: {
      flex: 1,
    },
    benefitTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 4,
    },
    benefitDescription: {
      fontSize: 14,
      color: themeColors.textSecondary,
      lineHeight: 20,
    },
    buttonContainer: {
      paddingBottom: 16,
    },
    enableButton: {
      borderRadius: 12,
      backgroundColor: themeColors.primaryAccent,
      marginBottom: 12,
    },
    skipButton: {
      borderRadius: 12,
      borderColor: themeColors.border,
    },
    buttonContent: {
      paddingVertical: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          {/* Header */}
          <Text style={styles.icon}>🔔</Text>
          <Text style={styles.title}>Stay Updated</Text>
          <Text style={styles.subtitle}>
            Get notified about important updates so you never miss an opportunity
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>📬</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>New Messages</Text>
                <Text style={styles.benefitDescription}>
                  Get instant alerts when someone contacts you
                </Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Job Applications</Text>
                <Text style={styles.benefitDescription}>
                  Know when someone applies to your job posting
                </Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
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

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={requestNotificationPermission}
            style={styles.enableButton}
            contentStyle={styles.buttonContent}
          >
            Enable Notifications
          </Button>
          <Button
            mode="outlined"
            onPress={handleSkip}
            style={styles.skipButton}
            contentStyle={styles.buttonContent}
            textColor={themeColors.textSecondary}
          >
            Skip for Now
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
