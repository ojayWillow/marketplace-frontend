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
  scale: Animated.Value;
  size: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function Sparkles({
  particleCount = 80,
  particleColor = '#FFFFFF',
  minSize = 2,
  maxSize = 4,
  speed = 4000,
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
        opacity: new Animated.Value(Math.random() * 0.6 + 0.4),
        scale: new Animated.Value(0.5 + Math.random() * 0.5),
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
        const duration = speed + Math.random() * 2000;

        Animated.parallel([
          // Move particle
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
          // Twinkle effect
          Animated.loop(
            Animated.sequence([
              Animated.timing(particle.opacity, {
                toValue: 0.2,
                duration: 1000 + Math.random() * 1000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.opacity, {
                toValue: 1,
                duration: 1000 + Math.random() * 1000,
                useNativeDriver: true,
              }),
            ])
          ),
          // Pulse scale
          Animated.loop(
            Animated.sequence([
              Animated.timing(particle.scale, {
                toValue: 1.2,
                duration: 1500 + Math.random() * 1000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.scale, {
                toValue: 0.8,
                duration: 1500 + Math.random() * 1000,
                useNativeDriver: true,
              }),
            ])
          ),
        ]).start(() => animateParticle());
      };

      // Stagger start times
      setTimeout(animateParticle, index * 30);
    });
  }, [particleCount, minSize, maxSize, speed]);

  return (
    <View style={styles.container} pointerEvents="none">
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
                { scale: particle.scale },
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
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});
