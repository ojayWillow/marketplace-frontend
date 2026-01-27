import React, { memo } from 'react';
import { Image, ImageProps } from 'expo-image';
import { StyleSheet } from 'react-native';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  blurhash?: string;
}

/**
 * Optimized image component with caching
 * Uses expo-image for native performance and automatic caching
 */
const CachedImage: React.FC<CachedImageProps> = ({ 
  uri, 
  blurhash,
  style,
  ...props 
}) => {
  return (
    <Image
      source={{ uri }}
      placeholder={blurhash}
      placeholderContentFit="cover"
      style={[styles.image, style]}
      transition={200}
      cachePolicy="memory-disk" // Cache in memory first, then disk
      contentFit="cover"
      {...props}
    />
  );
};

// Memoize to prevent re-renders when parent updates
export default memo(CachedImage, (prevProps, nextProps) => {
  return (
    prevProps.uri === nextProps.uri &&
    prevProps.blurhash === nextProps.blurhash
  );
});

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#f3f4f6',
  },
});
