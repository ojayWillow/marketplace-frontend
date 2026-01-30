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
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const color1 = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#020617', '#0f172a', '#020617'],
  });

  const color2 = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#1e293b', '#334155', '#1e293b'],
  });

  const color3 = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#22c55e', '#0ea5e9', '#22c55e'],
  });

  return (
    <AnimatedLinearGradient
      colors={[color1 as any, color2 as any, color3 as any]}
      style={StyleSheet.absoluteFillObject}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
}
