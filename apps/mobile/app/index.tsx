import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, useTheme } from 'react-native-paper';

export default function WelcomeScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
          <Text variant="displayMedium" style={styles.logoText}>M</Text>
        </View>

        {/* Title */}
        <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          Marketplace
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
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
            >
              Sign In with Email
            </Button>
          </Link>
        </View>

        {/* Browse as guest */}
        <Link href="/(tabs)" asChild>
          <Button mode="text" style={styles.guestButton}>
            Browse as Guest
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 48,
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
