import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface BubbleProps {
  index: number;
  totalBubbles: number;
}

function Bubble({ index, totalBubbles }: BubbleProps) {
  // Random initial values for this bubble
  const size = 50 + Math.random() * 70; // 50-120px
  const startX = Math.random() * (width - size);
  const duration = 10000 + Math.random() * 5000; // 10-15s
  const delay = (index * 400) % 6000; // Stagger starts

  // Shared values for animation
  const progress = useSharedValue(0);

  // Start animation on mount
  React.useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.linear,
        }),
        -1, // Infinite repeat
        false // Don't reverse
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const y = interpolate(
      progress.value,
      [0, 1],
      [height + size, -size - 100]
    );

    const x = interpolate(
      progress.value,
      [0, 0.25, 0.5, 0.75, 1],
      [startX, startX + 30, startX - 20, startX + 40, startX]
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.1, 0.9, 1],
      [0, 0.5, 0.5, 0]
    );

    const scale = 0.8 + Math.random() * 0.4;

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
      ],
      opacity,
      width: size,
      height: size,
    };
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        animatedStyle,
      ]}
    />
  );
}

export function FloatingBubbles() {
  const bubbleCount = 15;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: bubbleCount }).map((_, index) => (
        <Bubble key={index} index={index} totalBubbles={bubbleCount} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(100, 180, 255, 0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});
