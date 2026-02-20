import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { Task } from '@marketplace/shared';
import MobileJobCard from './MobileJobCard';

interface VirtualizedJobListProps {
  tasks: Task[];
  userLocation: { lat: number; lng: number };
  selectedTaskId: number | null;
  onJobSelect: (task: Task) => void;
}

/**
 * Estimated height of a single MobileJobCard in pixels.
 */
const CARD_HEIGHT_ESTIMATE = 88;

/**
 * How many cards below the visible area to keep rendered.
 * Cards ABOVE scroll position are always rendered (never culled from top)
 * to avoid the empty-gap bug when the bottom sheet resizes.
 */
const BUFFER_BELOW = 8;

/**
 * Lightweight virtualized list for the mobile bottom sheet.
 *
 * Key design decisions:
 * - NEVER cull cards from the top. The bottom sheet changes height
 *   via translateY, which means the scroll container's full height
 *   doesn't match what's visible. Culling from the top creates
 *   empty placeholder gaps that push real cards down.
 * - Only virtualize cards BELOW the visible window + buffer.
 *   This is where the actual perf win is (50+ off-screen cards).
 * - Use scroll events (passive, rAF-throttled) instead of
 *   IntersectionObserver to avoid stale root bounds after resize.
 * - Re-evaluate on container resize (ResizeObserver) to handle
 *   sheet position changes (collapsed → half → full).
 */
const VirtualizedJobList = memo(function VirtualizedJobList({
  tasks,
  userLocation,
  selectedTaskId,
  onJobSelect,
}: VirtualizedJobListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // renderEnd: index up to which we render real cards.
  // Cards from 0..renderEnd-1 are real, renderEnd..tasks.length are placeholders.
  const [renderEnd, setRenderEnd] = useState(() => Math.min(20, tasks.length));

  const computeRenderEnd = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const visibleBottom = scrollTop + containerHeight;

    // How many cards fit below current scroll position + buffer
    const lastVisibleIndex = Math.ceil(visibleBottom / CARD_HEIGHT_ESTIMATE);
    const newEnd = Math.min(tasks.length, lastVisibleIndex + BUFFER_BELOW);

    setRenderEnd((prev) => {
      // Only grow, never shrink — avoids flickering when scrolling up.
      // Cards already rendered stay rendered (cheap, already in DOM).
      return Math.max(prev, newEnd);
    });
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

  // Reset when tasks change (e.g. new filter)
  useEffect(() => {
    setRenderEnd(Math.min(20, tasks.length));
    // Recompute after a tick so container measurements are fresh
    requestAnimationFrame(() => computeRenderEnd());
  }, [tasks, computeRenderEnd]);

  // Initial compute on mount
  useEffect(() => {
    computeRenderEnd();
  }, [computeRenderEnd]);

  if (tasks.length === 0) return null;

  // Total height of placeholder area below rendered cards
  const placeholderCount = tasks.length - renderEnd;
  const placeholderHeight = placeholderCount > 0 ? placeholderCount * CARD_HEIGHT_ESTIMATE : 0;

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto overscroll-contain"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Always render cards 0..renderEnd — never cull from top */}
      {tasks.slice(0, renderEnd).map((task) => (
        <MobileJobCard
          key={task.id}
          task={task}
          userLocation={userLocation}
          onClick={() => onJobSelect(task)}
          isSelected={selectedTaskId === task.id}
        />
      ))}

      {/* Single placeholder block for all remaining cards */}
      {placeholderHeight > 0 && (
        <div style={{ height: placeholderHeight }} />
      )}

      <div className="h-4" />
    </div>
  );
});

export default VirtualizedJobList;
