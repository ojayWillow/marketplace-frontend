import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, useTheme } from 'react-native-paper';
import { useThemeStore } from '../src/stores/themeStore';
import { colors } from '../src/theme';

export default function WelcomeScreen() {
  const theme = useTheme();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    logo: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      backgroundColor: themeColors.primaryAccent,
    },
    logoText: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    title: {
      fontWeight: 'bold',
      marginBottom: 8,
      color: themeColors.text,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 48,
      color: themeColors.textSecondary,
    },
    buttonContainer: {
      width: '100%',
      gap: 16,
    },
    button: {
      borderRadius: 12,
    },
    buttonContent: {
      paddingVertical: 8,
    },
    guestButton: {
      marginTop: 24,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logo}>
          <Text variant="displayMedium" style={styles.logoText}>M</Text>
        </View>

        {/* Title */}
        <Text variant="headlineLarge" style={styles.title}>
          Marketplace
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Find services and tasks in your local community
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Link href="/(auth)/phone" asChild>
            <Button 
              mode="contained" 
              style={styles.button}
              contentStyle={styles.buttonContent}
              icon="phone"
              buttonColor={themeColors.primaryAccent}
              textColor="#ffffff"
            >
              Continue with Phone
            </Button>
          </Link>

          <Link href="/(auth)/login" asChild>
            <Button 
              mode="outlined" 
              style={styles.button}
              contentStyle={styles.buttonContent}
              icon="email"
              textColor={themeColors.primaryAccent}
            >
              Sign In with Email
            </Button>
          </Link>
        </View>

        {/* Browse as guest */}
        <Link href="/(tabs)" asChild>
          <Button mode="text" style={styles.guestButton} textColor={themeColors.textMuted}>
            Browse as Guest
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}
