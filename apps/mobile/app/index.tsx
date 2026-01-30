import { View, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { useThemeStore } from '../src/stores/themeStore';
import { colors } from '../src/theme';
import { EncryptedText } from '../src/components/EncryptedText';
import { FloatingBubbles } from '../src/components/FloatingBubbles';

export default function WelcomeScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      zIndex: 10,
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 24,
      borderRadius: 50,
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: 8,
      letterSpacing: 1,
      color: '#ffffff',
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 48,
      color: 'rgba(255, 255, 255, 0.7)',
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
    primaryButton: {
      backgroundColor: themeColors.primaryAccent,
    },
    outlinedButton: {
      borderColor: 'rgba(255, 255, 255, 0.5)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    guestButton: {
      marginTop: 24,
    },
  });

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <FloatingBubbles />

      <SafeAreaView style={{ flex: 1 }}>
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
            style={styles.title}
            encryptedColor="rgba(255, 255, 255, 0.3)"
            revealedColor="#ffffff"
            revealDelayMs={80}
            flipDelayMs={50}
          />
          
          <Text style={styles.subtitle}>
            Find services and tasks in your local community
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Link href="/(auth)/phone" asChild>
              <Button 
                mode="contained" 
                style={[styles.button, styles.primaryButton]}
                contentStyle={styles.buttonContent}
                icon="phone"
                textColor="#ffffff"
              >
                Continue with Phone
              </Button>
            </Link>

            <Link href="/(auth)/login" asChild>
              <Button 
                mode="outlined" 
                style={[styles.button, styles.outlinedButton]}
                contentStyle={styles.buttonContent}
                icon="email"
                textColor="#ffffff"
              >
                Sign In with Email
              </Button>
            </Link>
          </View>

          {/* Browse as guest */}
          <Link href="/(tabs)" asChild>
            <Button 
              mode="text" 
              style={styles.guestButton} 
              textColor="rgba(255, 255, 255, 0.5)"
            >
              Browse as Guest
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    </View>
  );
}
