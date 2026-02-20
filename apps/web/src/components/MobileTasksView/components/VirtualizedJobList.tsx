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
 * Used for initial placeholder sizing. Doesn't need to be exact —
 * IntersectionObserver handles the actual visibility detection.
 */
const CARD_HEIGHT_ESTIMATE = 88;

/**
 * How many cards above/below the viewport to keep rendered.
 * Higher = smoother scrolling (fewer pop-ins), more DOM nodes.
 * 5 is a good balance for mobile — ~440px buffer each direction.
 */
const BUFFER_COUNT = 5;

/**
 * Lightweight virtualized list for the mobile bottom sheet.
 *
 * Instead of rendering all 50+ MobileJobCard components at once,
 * this only renders cards that are near the visible scroll area.
 * Cards outside the viewport are replaced with empty divs of the
 * estimated height to maintain scroll position and scrollbar size.
 *
 * Uses IntersectionObserver (GPU-accelerated, no scroll listener)
 * to track which range of cards is visible.
 */
const VirtualizedJobList = memo(function VirtualizedJobList({
  tasks,
  userLocation,
  selectedTaskId,
  onJobSelect,
}: VirtualizedJobListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 15 });

  // Sentinel refs: we place invisible sentinels at intervals and observe them
  const sentinelRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const setSentinelRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      sentinelRefs.current.set(index, el);
    } else {
      sentinelRefs.current.delete(index);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the range of visible sentinels
        let minVisible = Infinity;
        let maxVisible = -Infinity;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute('data-sentinel-index') || '0', 10);
            minVisible = Math.min(minVisible, idx);
            maxVisible = Math.max(maxVisible, idx);
          }
        });

        if (minVisible !== Infinity) {
          setVisibleRange((prev) => {
            const newStart = Math.max(0, minVisible - BUFFER_COUNT);
            const newEnd = Math.min(tasks.length, maxVisible + BUFFER_COUNT + 1);
            // Only update if range actually changed (avoids re-renders)
            if (prev.start === newStart && prev.end === newEnd) return prev;
            return { start: newStart, end: newEnd };
          });
        }
      },
      {
        root: container,
        rootMargin: `${BUFFER_COUNT * CARD_HEIGHT_ESTIMATE}px 0px`,
        threshold: 0,
      }
    );

    // Observe all current sentinels
    sentinelRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [tasks.length]);

  // Reset visible range when tasks change (e.g. new filter)
  useEffect(() => {
    setVisibleRange({ start: 0, end: Math.min(15, tasks.length) });
  }, [tasks]);

  if (tasks.length === 0) return null;

  return (
    <div ref={containerRef} className="h-full overflow-y-auto overscroll-contain" style={{ touchAction: 'pan-y' }}>
      {tasks.map((task, index) => {
        const isInRange = index >= visibleRange.start && index < visibleRange.end;

        return (
          <div key={task.id}>
            {/* Sentinel div — always rendered, near-zero cost */}
            <div
              ref={(el) => setSentinelRef(index, el)}
              data-sentinel-index={index}
              style={{ height: 0, overflow: 'hidden' }}
            />
            {isInRange ? (
              <MobileJobCard
                task={task}
                userLocation={userLocation}
                onClick={() => onJobSelect(task)}
                isSelected={selectedTaskId === task.id}
              />
            ) : (
              // Placeholder — preserves scroll height
              <div style={{ height: CARD_HEIGHT_ESTIMATE }} />
            )}
          </div>
        );
      })}
      <div className="h-4" />
    </div>
  );
});

export default VirtualizedJobList;
