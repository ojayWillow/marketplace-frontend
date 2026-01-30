import { View, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { useThemeStore } from '../src/stores/themeStore';
import { colors } from '../src/theme';

export default function WelcomeScreen() {
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
      width: 120,
      height: 120,
      resizeMode: 'contain',
      marginBottom: 32,
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
        <Image 
          source={require('../assets/kolabbig.png')} 
          style={styles.logo}
        />

        {/* Title */}
        <Text variant="headlineLarge" style={styles.title}>
          KOLAB
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
