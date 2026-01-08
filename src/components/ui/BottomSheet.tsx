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
  minHeight = 60,
  midHeight = 300,
  maxHeightPercent = 85,
  snapPosition = 'mid',
  onSnapChange,
  header,
}: BottomSheetProps) => {
  const [currentHeight, setCurrentHeight] = useState(midHeight);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  // Calculate max height in pixels
  const maxHeight = typeof window !== 'undefined' 
    ? (window.innerHeight * maxHeightPercent) / 100 
    : 600;

  // Snap to position
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

  // Determine snap point based on current height
  const getSnapPosition = (height: number): 'min' | 'mid' | 'max' => {
    const midPoint1 = (minHeight + midHeight) / 2;
    const midPoint2 = (midHeight + maxHeight) / 2;
    
    if (height < midPoint1) return 'min';
    if (height < midPoint2) return 'mid';
    return 'max';
  };

  // Handle touch/mouse start
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    startYRef.current = clientY;
    startHeightRef.current = currentHeight;
  };

  // Handle touch/mouse move
  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    
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
    
    // Snap to nearest position
    const newSnapPosition = getSnapPosition(currentHeight);
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

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
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
      handleDragMove(e.clientY);
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

  // Quick action buttons
  const handleExpandClick = () => {
    const positions: ('min' | 'mid' | 'max')[] = ['min', 'mid', 'max'];
    const currentIndex = positions.indexOf(getSnapPosition(currentHeight));
    const nextIndex = Math.min(currentIndex + 1, positions.length - 1);
    const newPosition = positions[nextIndex];
    onSnapChange?.(newPosition);
  };

  const handleCollapseClick = () => {
    onSnapChange?.('min');
  };

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50"
      style={{
        height: `${currentHeight}px`,
        transition: isDragging ? 'none' : 'height 0.3s ease-out',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Drag Handle */}
      <div
        className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2" />
        {currentHeight <= minHeight + 20 && (
          <button
            onClick={handleExpandClick}
            className="text-xs text-blue-600 font-medium flex items-center gap-1"
          >
            <span>☰</span> Swipe up for jobs
          </button>
        )}
      </div>

      {/* Header (always visible) */}
      {header && (
        <div className="px-4 pb-2 border-b border-gray-100">
          {header}
        </div>
      )}

      {/* Content */}
      <div
        className="overflow-y-auto overscroll-contain"
        style={{
          height: `calc(100% - ${header ? '100px' : '50px'})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
