import { View, StyleSheet, Image, Animated } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { useThemeStore } from '../src/stores/themeStore';
import { colors } from '../src/theme';
import { TextFlip } from '../src/components/TextFlip';
import { AnimatedGradient } from '../src/components/AnimatedGradient';
import React, { useEffect, useRef } from 'react';

export default function WelcomeScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  // Logo animation
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
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
      marginBottom: 32,
    },
    logo: {
      width: 140,
      height: 140,
      borderRadius: 70,
    },
    brandContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    brandTitle: {
      fontSize: 48,
      fontWeight: '900',
      letterSpacing: 4,
      color: '#ffffff',
      marginBottom: 12,
    },
    taglineContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 48,
    },
    taglinePrefix: {
      fontSize: 18,
      color: 'rgba(255, 255, 255, 0.7)',
      marginRight: 8,
    },
    taglineFlip: {
      fontSize: 18,
      fontWeight: '700',
      color: '#22c55e',
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: 56,
      color: 'rgba(255, 255, 255, 0.6)',
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

  const flipWords = [
    'Create jobs',
    'Find jobs', 
    'Create work',
    'Find work',
    'Make money',
  ];

  return (
    <View style={styles.container}>
      {/* Animated Gradient Background */}
      <AnimatedGradient />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* Logo with animation */}
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
              source={require('../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Brand Name */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandTitle}>KOLAB</Text>
            
            {/* Tagline with flip text */}
            <View style={styles.taglineContainer}>
              <Text style={styles.taglinePrefix}>Find services and tasks in your local community.</Text>
            </View>
            
            <View style={styles.taglineContainer}>
              <TextFlip
                words={flipWords}
                style={styles.taglineFlip}
                interval={2500}
              />
            </View>
          </View>

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
