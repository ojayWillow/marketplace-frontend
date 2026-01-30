import { View, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, useTheme } from 'react-native-paper';
import { useThemeStore } from '../src/stores/themeStore';
import { colors } from '../src/theme';
import { EncryptedText } from '../src/components/EncryptedText';

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
      width: 100,
      height: 100,
      marginBottom: 24,
      borderRadius: 50,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 8,
      letterSpacing: 1,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 48,
      color: themeColors.textSecondary,
      fontSize: 14,
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
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title with Encrypted Text Animation */}
        <EncryptedText
          text="Marketplace"
          style={[styles.title, { color: themeColors.text }]}
          encryptedColor={themeColors.textMuted}
          revealedColor={themeColors.text}
          revealDelayMs={50}
          flipDelayMs={50}
        />
        
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
