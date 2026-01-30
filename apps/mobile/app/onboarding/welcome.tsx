import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function WelcomeScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate to next screen after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/onboarding/terms');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.primaryAccent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    animatedContent: {
      alignItems: 'center',
    },
    logo: {
      fontSize: 72,
      marginBottom: 24,
    },
    title: {
      fontSize: 42,
      fontWeight: 'bold',
      color: '#fff',
      letterSpacing: 2,
    },
    subtitle: {
      fontSize: 18,
      color: 'rgba(255, 255, 255, 0.9)',
      marginTop: 12,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.animatedContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logo}>🤝</Text>
        <Text style={styles.title}>Kolab</Text>
        <Text style={styles.subtitle}>Work Together, Safely</Text>
      </Animated.View>
    </View>
  );
}
