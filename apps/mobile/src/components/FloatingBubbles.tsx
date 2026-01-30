import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

interface Bubble {
  id: number;
  size: number;
  translateY: Animated.Value;
  translateX: Animated.Value;
  opacity: Animated.Value;
}

export function FloatingBubbles() {
  const bubblesRef = useRef<Bubble[]>([]);

  useEffect(() => {
    // Create 15 bubbles
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 15; i++) {
      const bubble: Bubble = {
        id: i,
        size: Math.random() * 60 + 40,
        translateY: new Animated.Value(height),
        translateX: new Animated.Value(Math.random() * 100 - 50),
        opacity: new Animated.Value(0.1 + Math.random() * 0.2),
      };
      bubbles.push(bubble);
    }
    bubblesRef.current = bubbles;

    // Animate each bubble
    bubbles.forEach((bubble, index) => {
      const animate = () => {
        bubble.translateY.setValue(height);
        bubble.translateX.setValue(Math.random() * 100 - 50);

        Animated.parallel([
          Animated.timing(bubble.translateY, {
            toValue: -100,
            duration: 10000 + Math.random() * 5000,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(bubble.translateX, {
                toValue: Math.random() * 100 - 50,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(bubble.translateX, {
                toValue: Math.random() * 100 - 50,
                duration: 2000,
                useNativeDriver: true,
              }),
            ])
          ),
        ]).start(() => animate());
      };

      setTimeout(() => animate(), index * 1000);
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
                { translateY: bubble.translateY },
                { translateX: bubble.translateX },
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
  bubble: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
