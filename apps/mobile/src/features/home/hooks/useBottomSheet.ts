import { useRef, useCallback } from 'react';
import { Animated, PanResponder } from 'react-native';
import { haptic } from '../../../../utils/haptics';
import { SHEET_MIN_HEIGHT, SHEET_MID_HEIGHT, SHEET_MAX_HEIGHT } from '../constants';

export type SheetPosition = 'min' | 'mid' | 'max';

export interface UseBottomSheetReturn {
  sheetHeight: Animated.Value;
  panResponder: ReturnType<typeof PanResponder.create>;
  sheetPosition: SheetPosition;
  animateSheetTo: (height: number) => void;
}

export function useBottomSheet(
  initialPosition: SheetPosition = 'min',
  onPositionChange?: (position: SheetPosition) => void
): UseBottomSheetReturn {
  const sheetHeight = useRef(new Animated.Value(SHEET_MIN_HEIGHT)).current;
  const currentHeight = useRef(SHEET_MIN_HEIGHT);
  const sheetPosition = useRef<SheetPosition>(initialPosition);

  const animateSheetTo = useCallback((height: number) => {
    currentHeight.current = height;
    
    let newPosition: SheetPosition = 'min';
    if (height === SHEET_MIN_HEIGHT) newPosition = 'min';
    else if (height === SHEET_MID_HEIGHT) newPosition = 'mid';
    else newPosition = 'max';
    
    sheetPosition.current = newPosition;
    if (onPositionChange) {
      onPositionChange(newPosition);
    }
    
    // Use timing instead of spring for better performance
    Animated.timing(sheetHeight, {
      toValue: height,
      duration: 250,
      useNativeDriver: false, // Can't use native driver for height/layout animations
    }).start();
  }, [sheetHeight, onPositionChange]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gestureState) => {
        const newHeight = currentHeight.current - gestureState.dy;
        const clampedHeight = Math.min(
          Math.max(newHeight, SHEET_MIN_HEIGHT),
          SHEET_MAX_HEIGHT
        );
        sheetHeight.setValue(clampedHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const newHeight = currentHeight.current - gestureState.dy;
        let snapTo = SHEET_MIN_HEIGHT;
        
        if (gestureState.vy < -0.5) {
          // Fast upward swipe
          snapTo = newHeight > SHEET_MID_HEIGHT ? SHEET_MAX_HEIGHT : SHEET_MID_HEIGHT;
        } else if (gestureState.vy > 0.5) {
          // Fast downward swipe
          snapTo = SHEET_MIN_HEIGHT;
        } else {
          // Slow drag - snap to nearest position
          if (newHeight < SHEET_MID_HEIGHT * 0.5) {
            snapTo = SHEET_MIN_HEIGHT;
          } else if (newHeight < (SHEET_MID_HEIGHT + SHEET_MAX_HEIGHT) / 2) {
            snapTo = SHEET_MID_HEIGHT;
          } else {
            snapTo = SHEET_MAX_HEIGHT;
          }
        }
        
        animateSheetTo(snapTo);
        haptic.selection();
      },
    })
  ).current;

  return {
    sheetHeight,
    panResponder,
    sheetPosition: sheetPosition.current,
    animateSheetTo,
  };
}
