import React, { useEffect, useState, useRef } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface EncryptedTextProps {
  text: string;
  style?: TextStyle;
  encryptedColor?: string;
  revealedColor?: string;
  revealDelayMs?: number;
  revealDurationMs?: number;
  scrambleSpeed?: number;
}

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

const AnimatedText = Animated.createAnimatedComponent(Text);

export function EncryptedText({
  text,
  style,
  encryptedColor = '#666666',
  revealedColor = '#ffffff',
  revealDelayMs = 0,
  revealDurationMs = 2000,
  scrambleSpeed = 50,
}: EncryptedTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [revealedChars, setRevealedChars] = useState(0);
  const opacity = useSharedValue(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.ease,
    });

    // Start scrambling animation
    const scrambleInterval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < revealedChars) return char;
            return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
          })
          .join('')
      );
    }, scrambleSpeed);

    intervalRef.current = scrambleInterval;

    // Start revealing characters
    const revealTimeout = setTimeout(() => {
      const charsPerStep = Math.max(1, Math.floor(text.length / 20));
      const revealInterval = setInterval(() => {
        setRevealedChars((prev) => {
          const next = prev + charsPerStep;
          if (next >= text.length) {
            clearInterval(revealInterval);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setDisplayText(text);
            return text.length;
          }
          return next;
        });
      }, revealDurationMs / (text.length / charsPerStep));
    }, revealDelayMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(revealTimeout);
    };
  }, [text, revealDelayMs, revealDurationMs, scrambleSpeed]);

  return (
    <AnimatedText
      style={[
        style,
        animatedStyle,
        { color: revealedChars >= text.length ? revealedColor : encryptedColor },
      ]}
    >
      {displayText || text}
    </AnimatedText>
  );
}
