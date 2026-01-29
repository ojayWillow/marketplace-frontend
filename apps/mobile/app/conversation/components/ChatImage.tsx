import { useState } from 'react';
import { View, Pressable, StyleSheet, Image as RNImage } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';

interface ChatImageProps {
  uri: string;
  onPress: () => void;
  themeColors: any;
}

/**
 * Chat image component with loading state and error handling
 */
export function ChatImage({ uri, onPress, themeColors }: ChatImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <View style={[styles.image, styles.error, { backgroundColor: themeColors.backgroundSecondary }]}>
        <Text style={styles.errorIcon}>🖼️</Text>
        <Text style={[styles.errorText, { color: themeColors.textMuted }]}>
          Image unavailable
        </Text>
      </View>
    );
  }

  return (
    <Pressable onPress={onPress}>
      {isLoading && (
        <View style={[styles.image, styles.loading, { backgroundColor: themeColors.backgroundSecondary }]}>
          <ActivityIndicator size="small" color={themeColors.textMuted} />
        </View>
      )}
      <RNImage
        source={{ uri }}
        style={[styles.image, isLoading && styles.hidden]}
        resizeMode="cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 220,
    height: 165,
    borderRadius: 12,
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
  },
});
