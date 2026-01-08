import { useState, useRef, useEffect, ReactNode } from 'react';

interface BottomSheetProps {
  children: ReactNode;
  /** Height when collapsed (just showing the handle) */
  minHeight?: number;
  /** Height when partially expanded (showing preview) */
  midHeight?: number;
  /** Maximum height (percentage of viewport) */
  maxHeightPercent?: number;
  /** Current snap position */
  snapPosition?: 'min' | 'mid' | 'max';
  /** Callback when snap position changes */
  onSnapChange?: (position: 'min' | 'mid' | 'max') => void;
  /** Header content (always visible) */
  header?: ReactNode;
}

export const BottomSheet = ({
  children,
  minHeight = 70,
  midHeight = 320,
  maxHeightPercent = 80,
  snapPosition = 'mid',
  onSnapChange,
  header,
}: BottomSheetProps) => {
  const [currentHeight, setCurrentHeight] = useState(midHeight);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const velocityRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Calculate max height in pixels
  const maxHeight = typeof window !== 'undefined' 
    ? (window.innerHeight * maxHeightPercent) / 100 
    : 600;

  // Snap to position when prop changes
  useEffect(() => {
    if (!isDragging) {
      switch (snapPosition) {
        case 'min':
          setCurrentHeight(minHeight);
          break;
        case 'mid':
          setCurrentHeight(midHeight);
          break;
        case 'max':
          setCurrentHeight(maxHeight);
          break;
      }
    }
  }, [snapPosition, isDragging, minHeight, midHeight, maxHeight]);

  // Determine snap point based on current height and velocity
  const getSnapPosition = (height: number, velocity: number): 'min' | 'mid' | 'max' => {
    // If dragging fast, snap in direction of drag
    if (Math.abs(velocity) > 0.5) {
      if (velocity > 0) {
        // Dragging up (increasing height)
        if (height > minHeight + 50) return height > (midHeight + maxHeight) / 2 ? 'max' : 'mid';
        return 'mid';
      } else {
        // Dragging down (decreasing height)
        if (height < maxHeight - 50) return height < (minHeight + midHeight) / 2 ? 'min' : 'mid';
        return 'mid';
      }
    }
    
    // Otherwise snap to nearest
    const midPoint1 = (minHeight + midHeight) / 2;
    const midPoint2 = (midHeight + maxHeight) / 2;
    
    if (height < midPoint1) return 'min';
    if (height < midPoint2) return 'mid';
    return 'max';
  };

  // Handle touch/mouse start - ONLY on the drag handle
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    startYRef.current = clientY;
    startHeightRef.current = currentHeight;
    lastYRef.current = clientY;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
  };

  // Handle touch/mouse move
  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    
    // Calculate velocity
    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current = (lastYRef.current - clientY) / dt * 10;
    }
    lastYRef.current = clientY;
    lastTimeRef.current = now;
    
    const deltaY = startYRef.current - clientY;
    const newHeight = Math.min(
      Math.max(startHeightRef.current + deltaY, minHeight),
      maxHeight
    );
    setCurrentHeight(newHeight);
  };

  // Handle touch/mouse end
  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Snap to nearest position considering velocity
    const newSnapPosition = getSnapPosition(currentHeight, velocityRef.current);
    onSnapChange?.(newSnapPosition);
    
    // Animate to snap position
    switch (newSnapPosition) {
      case 'min':
        setCurrentHeight(minHeight);
        break;
      case 'mid':
        setCurrentHeight(midHeight);
        break;
      case 'max':
        setCurrentHeight(maxHeight);
        break;
    }
  };

  // Touch event handlers - Only for the handle area
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start drag from the handle
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault(); // Prevent scroll while dragging
      handleDragMove(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse event handlers (for testing on desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleDragMove(e.clientY);
      }
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50"
      style={{
        height: `${currentHeight}px`,
        transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        touchAction: 'none', // Prevent browser handling on the sheet itself
      }}
    >
      {/* Drag Handle - This is the only area that triggers drag */}
      <div
        ref={handleRef}
        className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{ touchAction: 'none' }}
      >
        {/* Visual handle bar */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mb-1" />
        
        {/* Hint text when collapsed */}
        {currentHeight <= minHeight + 30 && (
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <span>↑</span> Swipe up for jobs
          </div>
        )}
      </div>

      {/* Header (always visible, also draggable) */}
      {header && (
        <div 
          className="px-4 pb-2 border-b border-gray-100"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{ touchAction: 'none', cursor: 'grab' }}
        >
          {header}
        </div>
      )}

      {/* Content - Scrollable, does NOT trigger sheet drag */}
      <div
        className="overflow-hidden"
        style={{
          height: `calc(100% - ${header ? '90px' : '50px'})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
