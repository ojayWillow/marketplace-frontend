import { useState, useRef, useCallback, useEffect } from 'react';
import { SheetPosition } from '../types';

/**
 * Returns the total bottom nav height (nav bar + safe area inset).
 * Reads the CSS custom property --nav-total-height at runtime so the
 * bottom sheet positions itself above the nav on all devices / PWA modes.
 */
const getNavTotalHeight = (): number => {
  if (typeof window === 'undefined') return 56;
  // Read computed value of the CSS custom property
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--nav-total-height')
    .trim();
  // Fallback: if the browser doesn't resolve it, use 56 + rough safe area
  if (!raw) return 56;
  // Create a temporary element to measure calc() value
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.height = raw;
  document.body.appendChild(el);
  const measured = el.getBoundingClientRect().height;
  document.body.removeChild(el);
  return measured || 56;
};

/**
 * Hook managing bottom sheet drag interaction and position state.
 */
export const useBottomSheet = () => {
  const [sheetPosition, setSheetPosition] = useState<SheetPosition>('collapsed');
  const [isDragging, setIsDragging] = useState(false);
  const [navHeight, setNavHeight] = useState(56);
  const startYRef = useRef(0);

  // Measure the actual nav height (including safe area) on mount and on resize
  useEffect(() => {
    const measure = () => setNavHeight(getNavTotalHeight());
    measure();
    window.addEventListener('resize', measure);
    // Also re-measure on orientation change for PWA
    window.addEventListener('orientationchange', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  const getSheetHeight = useCallback(() => {
    const vh = window.innerHeight;
    switch (sheetPosition) {
      case 'collapsed':
        // Peek height: enough for the drag handle + title row, above the nav
        return 120 + navHeight;
      case 'half':
        return Math.round(vh * 0.5);
      case 'full':
        return Math.round(vh * 0.85);
      default:
        return Math.round(vh * 0.5);
    }
  }, [sheetPosition, navHeight]);

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
    navHeight,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetToCollapsed,
  };
};
