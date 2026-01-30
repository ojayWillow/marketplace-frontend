import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Bubble {
  id: number;
  size: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

export function FloatingBubbles() {
  const bubblesRef = useRef<Bubble[]>([]);

  useEffect(() => {
    const bubbles: Bubble[] = [];

    // Create 20 bubbles with higher visibility
    for (let i = 0; i < 20; i++) {
      const size = 60 + Math.random() * 80; // Larger bubbles (60-140px)
      const startX = Math.random() * (width - size);
      
      const bubble: Bubble = {
        id: i,
        size,
        x: new Animated.Value(startX),
        y: new Animated.Value(height + 100), // Start below screen
        opacity: new Animated.Value(0.4 + Math.random() * 0.4), // More visible (0.4-0.8)
        scale: new Animated.Value(0.8 + Math.random() * 0.4),
      };

      bubbles.push(bubble);
    }

    bubblesRef.current = bubbles;

    // Start all animations immediately
    bubbles.forEach((bubble, index) => {
      const animate = () => {
        // Reset position to bottom
        const startX = Math.random() * (width - bubble.size);
        bubble.x.setValue(startX);
        bubble.y.setValue(height + bubble.size);

        const duration = 8000 + Math.random() * 6000; // 8-14 seconds

        // Move up
        Animated.timing(bubble.y, {
          toValue: -bubble.size - 100,
          duration,
          useNativeDriver: true,
        }).start(() => {
          // When done, restart
          animate();
        });

        // Gentle side-to-side movement
        const sideMovement = 30 + Math.random() * 50;
        Animated.loop(
          Animated.sequence([
            Animated.timing(bubble.x, {
              toValue: startX + sideMovement,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.timing(bubble.x, {
              toValue: startX - sideMovement,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();

        // Pulse scale
        Animated.loop(
          Animated.sequence([
            Animated.timing(bubble.scale, {
              toValue: 1.1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(bubble.scale, {
              toValue: 0.9,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      // Start immediately with slight delay between each
      setTimeout(animate, index * 300);
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {bubblesRef.current.map((bubble) => (
        <Animated.View
          key={bubble.id}
          style={[
            styles.bubble,
            {
              width: bubble.size,
              height: bubble.size,
              opacity: bubble.opacity,
              transform: [
                { translateX: bubble.x },
                { translateY: bubble.y },
                { scale: bubble.scale },
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
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(100, 180, 255, 0.25)', // Blue-ish, more visible
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#64B4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});
