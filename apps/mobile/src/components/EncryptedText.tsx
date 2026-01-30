import React, { useEffect, useState, useRef } from 'react';
import { Text, TextStyle } from 'react-native';

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
  const [displayText, setDisplayText] = useState('');
  const [revealIndex, setRevealIndex] = useState(0);
  const flipInterval = useRef<NodeJS.Timeout | null>(null);
  const revealTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize with random characters
    setDisplayText(
      text
        .split('')
        .map((char) => (char === ' ' ? ' ' : charset[Math.floor(Math.random() * charset.length)]))
        .join('')
    );

    // Continuously flip unrevealed characters
    flipInterval.current = setInterval(() => {
      setDisplayText((prev) => {
        return prev
          .split('')
          .map((char, index) => {
            // If revealed or space, keep original
            if (index < revealIndex || text[index] === ' ') {
              return text[index];
            }
            // Otherwise, random character
            return charset[Math.floor(Math.random() * charset.length)];
          })
          .join('');
      });
    }, flipDelayMs);

    // Reveal characters one by one
    const revealNext = (currentIndex: number) => {
      if (currentIndex <= text.length) {
        setRevealIndex(currentIndex);
        revealTimeout.current = setTimeout(() => revealNext(currentIndex + 1), revealDelayMs);
      } else {
        // All revealed, stop flipping
        if (flipInterval.current) {
          clearInterval(flipInterval.current);
        }
        setDisplayText(text);
      }
    };

    // Start revealing after a short delay
    setTimeout(() => revealNext(0), 500);

    return () => {
      if (flipInterval.current) {
        clearInterval(flipInterval.current);
      }
      if (revealTimeout.current) {
        clearTimeout(revealTimeout.current);
      }
    };
  }, [text]);

  return (
    <Text style={style}>
      {displayText.split('').map((char, index) => (
        <Text
          key={index}
          style={{
            color: index < revealIndex ? revealedColor : encryptedColor,
          }}
        >
          {char}
        </Text>
      ))}
    </Text>
  );
}
