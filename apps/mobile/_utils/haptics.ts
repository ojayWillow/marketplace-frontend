import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utility for tactile responses
 * Works on iOS and Android
 */

/**
 * Light tap feedback - for UI interactions
 * Use for: button taps, toggle switches, selections
 */
export const hapticLight = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

/**
 * Medium tap feedback - for important actions
 * Use for: form submissions, confirmations, adding items
 */
export const hapticMedium = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

/**
 * Heavy tap feedback - for critical actions
 * Use for: deletions, major confirmations, errors
 */
export const hapticHeavy = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

/**
 * Success feedback - for successful operations
 * Use for: form submitted, task created, payment successful
 */
export const hapticSuccess = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

/**
 * Warning feedback - for warnings or important notices
 * Use for: validation errors, warnings, cautions
 */
export const hapticWarning = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
};

/**
 * Error feedback - for errors
 * Use for: form errors, failed operations, invalid inputs
 */
export const hapticError = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};

/**
 * Selection feedback - for picker/selection changes
 * Use for: scrolling through pickers, changing tabs, slider movement
 */
export const hapticSelection = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await Haptics.selectionAsync();
  }
};

/**
 * Soft tap feedback - subtle feedback
 * Use for: pull-to-refresh, subtle interactions
 */
export const hapticSoft = async () => {
  if (Platform.OS === 'ios') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  } else if (Platform.OS === 'android') {
    // Android doesn't have soft, use light
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

/**
 * Rigid tap feedback - sharp, pronounced feedback
 * Use for: important toggles, critical switches
 */
export const hapticRigid = async () => {
  if (Platform.OS === 'ios') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  } else if (Platform.OS === 'android') {
    // Android doesn't have rigid, use heavy
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

/**
 * Helper to trigger haptic only if condition is true
 */
export const conditionalHaptic = async (
  condition: boolean,
  hapticFn: () => Promise<void>
) => {
  if (condition) {
    await hapticFn();
  }
};

// Export all haptic types for convenience
export const haptic = {
  light: hapticLight,
  medium: hapticMedium,
  heavy: hapticHeavy,
  soft: hapticSoft,
  rigid: hapticRigid,
  success: hapticSuccess,
  warning: hapticWarning,
  error: hapticError,
  selection: hapticSelection,
  conditional: conditionalHaptic,
};

export default haptic;
