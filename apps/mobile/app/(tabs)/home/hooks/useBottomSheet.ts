import { useRef, useState, useCallback } from 'react';
import { Animated, PanResponder, PanResponderInstance } from 'react-native';
import { haptic } from '../../../../utils/haptics';
import { SHEET_MIN_HEIGHT, SHEET_MID_HEIGHT, SHEET_MAX_HEIGHT } from '../constants';

type SheetPosition = 'min' | 'mid' | 'max';

interface UseBottomSheetResult {
  sheetHeight: Animated.Value;
  sheetPosition: SheetPosition;
  panResponder: PanResponderInstance;
  animateSheetTo: (height: number) => void;
  expandToMid: () => void;
  collapse: () => void;
}

export const useBottomSheet = (): UseBottomSheetResult => {
  const sheetHeight = useRef(new Animated.Value(SHEET_MIN_HEIGHT)).current;
  const currentHeight = useRef(SHEET_MIN_HEIGHT);
  const [sheetPosition, setSheetPosition] = useState<SheetPosition>('min');

  const animateSheetTo = useCallback((height: number) => {
    currentHeight.current = height;
    if (height === SHEET_MIN_HEIGHT) setSheetPosition('min');
    else if (height === SHEET_MID_HEIGHT) setSheetPosition('mid');
    else setSheetPosition('max');
    
    Animated.spring(sheetHeight, {
      toValue: height,
      useNativeDriver: false,
      bounciness: 4,
      speed: 12,
    }).start();
  }, []);

  const expandToMid = useCallback(() => {
    animateSheetTo(SHEET_MID_HEIGHT);
  }, [animateSheetTo]);

  const collapse = useCallback(() => {
    animateSheetTo(SHEET_MIN_HEIGHT);
  }, [animateSheetTo]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = currentHeight.current - gestureState.dy;
        const clampedHeight = Math.min(Math.max(newHeight, SHEET_MIN_HEIGHT), SHEET_MAX_HEIGHT);
        sheetHeight.setValue(clampedHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const newHeight = currentHeight.current - gestureState.dy;
        let snapTo = SHEET_MIN_HEIGHT;
        
        if (gestureState.vy < -0.5) {
          snapTo = newHeight > SHEET_MID_HEIGHT ? SHEET_MAX_HEIGHT : SHEET_MID_HEIGHT;
        } else if (gestureState.vy > 0.5) {
          snapTo = SHEET_MIN_HEIGHT;
        } else {
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
    sheetPosition,
    panResponder,
    animateSheetTo,
    expandToMid,
    collapse,
  };
};
