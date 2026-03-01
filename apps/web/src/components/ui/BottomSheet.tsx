import { useState, useRef, useEffect, ReactNode } from 'react';

interface BottomSheetProps {
  children: ReactNode;
  minHeight?: number;
  midHeight?: number;
  maxHeightPercent?: number;
  snapPosition?: 'min' | 'mid' | 'max';
  onSnapChange?: (position: 'min' | 'mid' | 'max') => void;
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

  const maxHeight = typeof window !== 'undefined' 
    ? (window.innerHeight * maxHeightPercent) / 100 
    : 600;

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

  const getSnapPosition = (height: number, velocity: number): 'min' | 'mid' | 'max' => {
    if (Math.abs(velocity) > 0.5) {
      if (velocity > 0) {
        if (height > minHeight + 50) return height > (midHeight + maxHeight) / 2 ? 'max' : 'mid';
        return 'mid';
      } else {
        if (height < maxHeight - 50) return height < (minHeight + midHeight) / 2 ? 'min' : 'mid';
        return 'mid';
      }
    }
    const midPoint1 = (minHeight + midHeight) / 2;
    const midPoint2 = (midHeight + maxHeight) / 2;
    if (height < midPoint1) return 'min';
    if (height < midPoint2) return 'mid';
    return 'max';
  };

  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    startYRef.current = clientY;
    startHeightRef.current = currentHeight;
    lastYRef.current = clientY;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
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

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const newSnapPosition = getSnapPosition(currentHeight, velocityRef.current);
    onSnapChange?.(newSnapPosition);
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

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      handleDragMove(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

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
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl dark:shadow-gray-950/50 z-50"
      style={{
        height: `${currentHeight}px`,
        transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        touchAction: 'none',
      }}
    >
      <div
        ref={handleRef}
        className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{ touchAction: 'none' }}
      >
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mb-1" />
        {currentHeight <= minHeight + 30 && (
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
            <span>↑</span> Swipe up for jobs
          </div>
        )}
      </div>

      {header && (
        <div 
          className="px-4 pb-2 border-b border-gray-100 dark:border-gray-800"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{ touchAction: 'none', cursor: 'grab' }}
        >
          {header}
        </div>
      )}

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
