import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { Text } from 'react-native-paper';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function WelcomeScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const handshakeRotate = useRef(new Animated.Value(0)).current;
  const handshakeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo fade in and scale up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Handshake animation - shake effect
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(handshakeRotate, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(handshakeScale, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(handshakeRotate, {
            toValue: -1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(handshakeScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(handshakeRotate, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(handshakeScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(800), // Pause between shakes
      ])
    ).start();

    // Auto-advance after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/onboarding/terms');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const rotate = handshakeRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
    },
    iconContainer: {
      marginBottom: 24,
    },
    handshake: {
      fontSize: 120,
    },
    title: {
      fontSize: 48,
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: 8,
      letterSpacing: 2,
    },
    tagline: {
      fontSize: 18,
      color: themeColors.primaryAccent,
      fontWeight: '600',
      letterSpacing: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated Handshake Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { rotate },
                { scale: handshakeScale },
              ],
            },
          ]}
        >
          <Text style={styles.handshake}>🤝</Text>
        </Animated.View>

        {/* Brand Name */}
        <Text style={styles.title}>Kolab</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>Work Together, Safely</Text>
      </Animated.View>
    </View>
  );
}
