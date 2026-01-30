import React, { useEffect, useState, useRef } from 'react';
import { Text, TextStyle, Animated } from 'react-native';

interface EncryptedTextProps {
  text: string;
  style?: TextStyle;
  encryptedColor?: string;
  revealedColor?: string;
  revealDelayMs?: number;
  charset?: string;
  flipDelayMs?: number;
}

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?';

export function EncryptedText({
  text,
  style,
  encryptedColor = '#666666',
  revealedColor = '#ffffff',
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
}: EncryptedTextProps) {
  const [displayChars, setDisplayChars] = useState<string[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const flipIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize with scrambled text
    const chars = text.split('');
    setDisplayChars(chars.map((char) => 
      char === ' ' ? ' ' : charset[Math.floor(Math.random() * charset.length)]
    ));

    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Start flipping unrevealed characters
    flipIntervalRef.current = setInterval(() => {
      setDisplayChars((prev) => {
        return prev.map((char, index) => {
          // Skip if this character is already revealed or is a space
          if (index < revealedCount || text[index] === ' ') {
            return text[index];
          }
          // Flip to a random character
          return charset[Math.floor(Math.random() * charset.length)];
        });
      });
    }, flipDelayMs);

    // Start revealing characters one by one
    let currentIndex = 0;
    const revealNext = () => {
      if (currentIndex < text.length) {
        setRevealedCount(currentIndex + 1);
        currentIndex++;
        revealTimeoutRef.current = setTimeout(revealNext, revealDelayMs);
      } else {
        // All revealed, stop flipping
        if (flipIntervalRef.current) {
          clearInterval(flipIntervalRef.current);
        }
        setDisplayChars(text.split(''));
      }
    };

    // Start revealing after a short delay
    revealTimeoutRef.current = setTimeout(revealNext, 500);

    return () => {
      if (flipIntervalRef.current) {
        clearInterval(flipIntervalRef.current);
      }
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, [text, revealDelayMs, charset, flipDelayMs]);

  return (
    <Animated.Text style={[style, { opacity }]}>
      {displayChars.map((char, index) => (
        <Text
          key={index}
          style={{
            color: index < revealedCount ? revealedColor : encryptedColor,
          }}
        >
          {char}
        </Text>
      ))}
    </Animated.Text>
  );
}
