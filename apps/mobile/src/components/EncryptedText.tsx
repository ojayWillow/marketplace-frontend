import React, { useEffect, useState, useRef } from 'react';
import { Text, TextStyle, Animated } from 'react-native';

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
  const opacity = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

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
    <Animated.Text
      style={[
        style,
        { opacity },
        { color: revealedChars >= text.length ? revealedColor : encryptedColor },
      ]}
    >
      {displayText || text}
    </Animated.Text>
  );
}
