import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

interface SparklesProps {
  particleCount?: number;
  particleColor?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
}

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  size: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function Sparkles({
  particleCount = 50,
  particleColor = '#FFFFFF',
  minSize = 1,
  maxSize = 3,
  speed = 2000,
}: SparklesProps) {
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const size = minSize + Math.random() * (maxSize - minSize);
      const particle: Particle = {
        x: new Animated.Value(Math.random() * screenWidth),
        y: new Animated.Value(Math.random() * screenHeight),
        opacity: new Animated.Value(Math.random() * 0.8 + 0.2),
        size,
      };
      particles.push(particle);
    }
    particlesRef.current = particles;

    // Animate particles
    particles.forEach((particle, index) => {
      const animateParticle = () => {
        // Random movement
        const newX = Math.random() * screenWidth;
        const newY = Math.random() * screenHeight;
        const duration = speed + Math.random() * speed;

        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: newX,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: newY,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => animateParticle());
      };

      // Stagger start times
      setTimeout(animateParticle, index * 50);
    });
  }, [particleCount, minSize, maxSize, speed]);

  return (
    <View style={styles.container}>
      {particlesRef.current.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              backgroundColor: particleColor,
              opacity: particle.opacity,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
              ],
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
  },
  particle: {
    position: 'absolute',
    borderRadius: 100,
  },
});
