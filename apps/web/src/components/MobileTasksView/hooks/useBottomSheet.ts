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

// Collapsed peek height: drag handle + arrow + title row.
const COLLAPSED_PEEK_HEIGHT = 88;

// Snap threshold in pixels — how far you need to drag before it snaps
const SNAP_THRESHOLD = 50;

/**
 * Compute the Y offset (from the "full" position) for each sheet position.
 * The sheet is rendered at full height and shifted down via translateY.
 */
const getTranslateY = (
  position: SheetPosition,
  navHeight: number
): number => {
  if (typeof window === 'undefined') return 0;
  const vh = window.innerHeight;
  const fullH = Math.round(vh * 0.85);
  const halfH = Math.round(vh * 0.5);
  const collapsedH = COLLAPSED_PEEK_HEIGHT + navHeight;

  switch (position) {
    case 'full':
      return 0;
    case 'half':
      return fullH - halfH;
    case 'collapsed':
      return fullH - collapsedH;
    default:
      return fullH - halfH;
  }
};

/**
 * Hook managing bottom sheet drag interaction and position state.
 *
 * Uses transform: translateY() instead of height for GPU-accelerated
 * 60 fps animations. The sheet follows your finger in real-time.
 */
export const useBottomSheet = () => {
  const storePosition = useMobileMapStore((s) => s.sheetPosition);
  const setStorePosition = useMobileMapStore((s) => s.setSheetPosition);

  const [sheetPosition, setSheetPosition] = useState<SheetPosition>(storePosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); // live pixel offset while dragging
  const [navHeight, setNavHeight] = useState(56);
  const startYRef = useRef(0);
  const baseTranslateRef = useRef(0); // translateY at drag start

  // Sync local state → store
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

  // The full sheet height (maximum)
  const getFullHeight = useCallback(() => {
    return Math.round(window.innerHeight * 0.85);
  }, []);

  // The resting translateY for the current position
  const restingTranslateY = getTranslateY(sheetPosition, navHeight);

  // The actual translateY (resting + live drag offset)
  const currentTranslateY = isDragging
    ? Math.max(0, baseTranslateRef.current + dragOffset)
    : restingTranslateY;

  // Visible sheet height for external consumers (e.g. recenter button positioning)
  const sheetHeight = getFullHeight() - currentTranslateY + navHeight;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      startYRef.current = e.touches[0].clientY;
      baseTranslateRef.current = getTranslateY(sheetPosition, navHeight);
      setDragOffset(0);
    },
    [sheetPosition, navHeight]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const currentY = e.touches[0].clientY;
      // Positive delta = finger moved down = sheet goes down
      const delta = currentY - startYRef.current;
      setDragOffset(delta);
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      setDragOffset(0);

      const endY = e.changedTouches[0].clientY;
      const deltaY = startYRef.current - endY; // positive = swiped up

      if (deltaY > SNAP_THRESHOLD) {
        // Swiped up → expand
        if (sheetPosition === 'collapsed') setSheetPosition('half');
        else if (sheetPosition === 'half') setSheetPosition('full');
      } else if (deltaY < -SNAP_THRESHOLD) {
        // Swiped down → collapse
        if (sheetPosition === 'full') setSheetPosition('half');
        else if (sheetPosition === 'half') setSheetPosition('collapsed');
      }
      // else: didn't pass threshold, snaps back to current position
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
    currentTranslateY,
    getFullHeight,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetToCollapsed,
  };
};
