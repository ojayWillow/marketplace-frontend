import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function AnimatedGradient() {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const color1 = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#0F172A', '#1E293B', '#0F172A'],
  });

  const color2 = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#1E293B', '#334155', '#1E293B'],
  });

  return (
    <AnimatedLinearGradient
      colors={[color1, color2] as any}
      style={StyleSheet.absoluteFillObject}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
}
