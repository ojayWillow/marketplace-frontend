import React, { useState, useEffect, useRef } from 'react';
import { Text, TextStyle, Animated } from 'react-native';

interface TextFlipProps {
  words: string[];
  style?: TextStyle;
  interval?: number;
  duration?: number;
}

export function TextFlip({
  words,
  style,
  interval = 2500,
  duration = 400,
}: TextFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(words[0]);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Animate out
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change text
        setCurrentIndex((prev) => {
          const nextIndex = (prev + 1) % words.length;
          setDisplayText(words[nextIndex]);
          return nextIndex;
        });

        // Reset position
        translateY.setValue(20);

        // Animate in
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, interval);

    return () => clearInterval(intervalId);
  }, [words, interval, duration, opacity, translateY]);

  return (
    <Animated.Text
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {displayText}
    </Animated.Text>
  );
}
