import { useState, useRef, useCallback } from 'react';
import { SheetPosition } from '../types';

/**
 * Hook managing bottom sheet drag interaction and position state.
 */
export const useBottomSheet = () => {
  const [sheetPosition, setSheetPosition] = useState<SheetPosition>('collapsed');
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  const getSheetHeight = useCallback(() => {
    const vh = window.innerHeight;
    switch (sheetPosition) {
      case 'collapsed':
        return 120;
      case 'half':
        return Math.round(vh * 0.5);
      case 'full':
        return Math.round(vh * 0.85);
      default:
        return Math.round(vh * 0.5);
    }
  }, [sheetPosition]);

  const sheetHeight = getSheetHeight();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(() => {}, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      setIsDragging(false);

      const endY = e.changedTouches[0].clientY;
      const deltaY = startYRef.current - endY;
      const threshold = 50;

      if (deltaY > threshold) {
        if (sheetPosition === 'collapsed') setSheetPosition('half');
        else if (sheetPosition === 'half') setSheetPosition('full');
      } else if (deltaY < -threshold) {
        if (sheetPosition === 'full') setSheetPosition('half');
        else if (sheetPosition === 'half') setSheetPosition('collapsed');
      }
    },
    [isDragging, sheetPosition]
  );

  const resetToCollapsed = useCallback(() => {
    setSheetPosition('collapsed');
  }, []);

  return {
    sheetPosition,
    sheetHeight,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetToCollapsed,
  };
};
