import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SparklesProps {
  particleCount?: number;
  particleColor?: string;
}

export function Sparkles({
  particleCount = 100,
  particleColor = '#FFFFFF',
}: SparklesProps) {
  // Generate random positions for particles
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.3,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              backgroundColor: particleColor,
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    borderRadius: 100,
  },
});
