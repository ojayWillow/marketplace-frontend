import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { Task } from '@marketplace/shared';
import { SheetPosition } from '../types';
import MobileJobCard from './MobileJobCard';

interface VirtualizedJobListProps {
  tasks: Task[];
  userLocation: { lat: number; lng: number };
  selectedTaskId: number | null;
  onJobSelect: (task: Task) => void;
  sheetPosition: SheetPosition;
  onExpandSheet: () => void;
}

const CARD_HEIGHT_ESTIMATE = 88;
const BUFFER_BELOW = 8;

/**
 * Lightweight virtualized list for the mobile bottom sheet.
 *
 * Scroll behavior adapts to sheet position:
 * - collapsed: scrolling disabled, taps still work
 * - half: scrolling enabled, but swiping up at scrollTop=0 expands the sheet
 * - full: free scrolling
 */
const VirtualizedJobList = memo(function VirtualizedJobList({
  tasks,
  userLocation,
  selectedTaskId,
  onJobSelect,
  sheetPosition,
  onExpandSheet,
}: VirtualizedJobListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ y: number; scrollTop: number } | null>(null);

  const [renderEnd, setRenderEnd] = useState(() => Math.min(20, tasks.length));

  const computeRenderEnd = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const visibleBottom = scrollTop + containerHeight;

    const lastVisibleIndex = Math.ceil(visibleBottom / CARD_HEIGHT_ESTIMATE);
    const newEnd = Math.min(tasks.length, lastVisibleIndex + BUFFER_BELOW);

    setRenderEnd((prev) => Math.max(prev, newEnd));
  }, [tasks.length]);

  // Scroll handler — rAF throttled, passive
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        computeRenderEnd();
        rafRef.current = null;
      });
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [computeRenderEnd]);

  // Re-evaluate when container resizes (sheet position changes)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      computeRenderEnd();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [computeRenderEnd]);

  // Reset when tasks change
  useEffect(() => {
    setRenderEnd(Math.min(20, tasks.length));
    requestAnimationFrame(() => computeRenderEnd());
  }, [tasks, computeRenderEnd]);

  // Initial compute on mount
  useEffect(() => {
    computeRenderEnd();
  }, [computeRenderEnd]);

  // Touch handlers: intercept upward swipe at scrollTop=0 when sheet is not full
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    touchStartRef.current = {
      y: e.touches[0].clientY,
      scrollTop: container.scrollTop,
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (sheetPosition === 'full') return;
    if (!touchStartRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const deltaY = touchStartRef.current.y - e.touches[0].clientY; // positive = swiping up

    // If at the top of the list and swiping up, prevent scroll and expand sheet
    if (deltaY > 10 && touchStartRef.current.scrollTop <= 0 && container.scrollTop <= 0) {
      e.preventDefault();
      onExpandSheet();
      touchStartRef.current = null;
    }
  }, [sheetPosition, onExpandSheet]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  if (tasks.length === 0) return null;

  const placeholderCount = tasks.length - renderEnd;
  const placeholderHeight = placeholderCount > 0 ? placeholderCount * CARD_HEIGHT_ESTIMATE : 0;

  const isCollapsed = sheetPosition === 'collapsed';

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto overscroll-contain"
      style={{
        touchAction: isCollapsed ? 'none' : 'pan-y',
        overflowY: isCollapsed ? 'hidden' : 'auto',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {tasks.slice(0, renderEnd).map((task) => (
        <MobileJobCard
          key={task.id}
          task={task}
          userLocation={userLocation}
          onClick={() => onJobSelect(task)}
          isSelected={selectedTaskId === task.id}
        />
      ))}

      {placeholderHeight > 0 && (
        <div style={{ height: placeholderHeight }} />
      )}

      <div className="h-4" />
    </div>
  );
});

export default VirtualizedJobList;
