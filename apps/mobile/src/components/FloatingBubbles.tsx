import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Bubble {
  id: number;
  size: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
}

export function FloatingBubbles() {
  const bubblesRef = useRef<Bubble[]>([]);

  useEffect(() => {
    const bubbles: Bubble[] = [];

    for (let i = 0; i < 18; i++) {
      const size = 40 + Math.random() * 60;
      const startX = Math.random() * width;
      const startY = height + Math.random() * 200; // start below screen

      const bubble: Bubble = {
        id: i,
        size,
        x: new Animated.Value(startX),
        y: new Animated.Value(startY),
        opacity: new Animated.Value(0.15 + Math.random() * 0.2),
      };

      bubbles.push(bubble);
    }

    bubblesRef.current = bubbles;

    bubbles.forEach((bubble, index) => {
      const animate = () => {
        const toX = Math.random() * width;
        const toY = -200; // move above top
        const duration = 12000 + Math.random() * 4000;

        bubble.x.setValue(Math.random() * width);
        bubble.y.setValue(height + Math.random() * 200);

        Animated.timing(bubble.y, {
          toValue: toY,
          duration,
          useNativeDriver: true,
        }).start(() => animate());

        Animated.loop(
          Animated.sequence([
            Animated.timing(bubble.x, {
              toValue: toX + 40,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(bubble.x, {
              toValue: toX - 40,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      setTimeout(animate, index * 600);
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
    zIndex: 1,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
});
