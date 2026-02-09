import { useState, useRef, useCallback, useEffect } from 'react';
import { SheetPosition } from '../types';
import { useMobileMapStore } from '../stores';

/**
 * Returns the total bottom nav height (nav bar + safe area inset).
 */
const getNavTotalHeight = (): number => {
  if (typeof window === 'undefined') return 56;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--nav-total-height')
    .trim();
  if (!raw) return 56;
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.height = raw;
  document.body.appendChild(el);
  const measured = el.getBoundingClientRect().height;
  document.body.removeChild(el);
  return measured || 56;
};

// Collapsed peek height: drag handle + title row only.
// Keep minimal so the map stays maximally visible.
const COLLAPSED_PEEK_HEIGHT = 64;

/**
 * Hook managing bottom sheet drag interaction and position state.
 * 
 * Reads/writes sheetPosition from Zustand store so the position
 * survives tab switches (Home → Work → Home).
 */
export const useBottomSheet = () => {
  // Read persisted position from Zustand store
  const storePosition = useMobileMapStore((s) => s.sheetPosition);
  const setStorePosition = useMobileMapStore((s) => s.setSheetPosition);

  const [sheetPosition, setSheetPosition] = useState<SheetPosition>(storePosition);
  const [isDragging, setIsDragging] = useState(false);
  const [navHeight, setNavHeight] = useState(56);
  const startYRef = useRef(0);

  // Sync local state → store whenever it changes
  useEffect(() => {
    setStorePosition(sheetPosition);
  }, [sheetPosition, setStorePosition]);

  // Measure nav height on mount and resize
  useEffect(() => {
    const measure = () => setNavHeight(getNavTotalHeight());
    measure();
    window.addEventListener('resize', measure);
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
        return COLLAPSED_PEEK_HEIGHT + navHeight;
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
