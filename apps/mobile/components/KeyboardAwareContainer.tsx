import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';

interface KeyboardAwareContainerProps {
  children: ReactNode;
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Additional styles for the scroll content */
  contentContainerStyle?: ViewStyle;
  /** Keyboard vertical offset (default: 0 for Android, 64 for iOS) */
  keyboardVerticalOffset?: number;
  /** Whether to enable scrolling (default: true) */
  enableScroll?: boolean;
  /** Additional ScrollView props */
  scrollViewProps?: Partial<ScrollViewProps>;
}

/**
 * KeyboardAwareContainer
 * 
 * A reusable wrapper component that automatically handles keyboard appearance
 * to prevent it from covering input fields. Works on both iOS and Android.
 * 
 * Usage:
 * ```tsx
 * <KeyboardAwareContainer>
 *   <TextInput ... />
 *   <TextInput ... />
 * </KeyboardAwareContainer>
 * ```
 * 
 * With custom offset:
 * ```tsx
 * <KeyboardAwareContainer keyboardVerticalOffset={100}>
 *   {content}
 * </KeyboardAwareContainer>
 * ```
 */
export const KeyboardAwareContainer: React.FC<KeyboardAwareContainerProps> = ({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset,
  enableScroll = true,
  scrollViewProps = {},
}) => {
  // Default offset: 0 for Android (better handled natively), 64 for iOS (to account for header)
  const defaultOffset = Platform.OS === 'ios' ? 64 : 0;
  const offset = keyboardVerticalOffset ?? defaultOffset;

  // iOS: 'padding' works best - shifts content up
  // Android: 'height' or undefined - Android handles it better natively
  const behavior = Platform.OS === 'ios' ? 'padding' : 'height';

  return (
    <KeyboardAvoidingView
      behavior={behavior}
      style={[styles.container, style]}
      keyboardVerticalOffset={offset}
    >
      {enableScroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled" // Allows taps on buttons while keyboard is open
          showsVerticalScrollIndicator={false}
          bounces={true}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default KeyboardAwareContainer;
