import { View, StyleSheet, Image, Animated, Text } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { useThemeStore } from '../src/stores/themeStore';
import { colors } from '../src/theme';
import React, { useEffect, useRef } from 'react';

// Animated gradient background component
function AnimatedGradient() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: '#1a1a2e',
          },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: '#16213e',
            opacity: 0.8,
          },
        ]}
      />
    </View>
  );
}

export default function WelcomeScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  // Logo animation
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Title entrance (after logo)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      zIndex: 10,
    },
    logoContainer: {
      marginBottom: 24,
    },
    logo: {
      width: 160,
      height: 160,
    },
    brandContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    brandTitle: {
      fontSize: 44,
      fontWeight: '700',
      letterSpacing: 8,
      color: '#ffffff',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.6)',
      textAlign: 'center',
      letterSpacing: 0.5,
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
      {/* Dark Background */}
      <AnimatedGradient />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* Logo with animation - using kolabbig.png */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image
              source={require('../assets/kolabbig.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Brand Name - Clean & Simple */}
          <Animated.View 
            style={[
              styles.brandContainer,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            <Text style={styles.brandTitle}>KOLAB</Text>
            <Text style={styles.subtitle}>
              Find services and tasks in your local community
            </Text>
          </Animated.View>

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
