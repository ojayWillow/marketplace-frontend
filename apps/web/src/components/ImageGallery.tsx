import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

/**
 * Read-only image gallery for detail pages (TaskDetail, OfferingDetail).
 * Shows horizontal scroll strip with tap-to-expand fullscreen lightbox.
 */
const ImageGallery = ({ images, alt = 'Image' }: ImageGalleryProps) => {
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    },
    [closeLightbox, goNext, goPrev]
  );

  if (!images || images.length === 0) return null;

  // Single image — simple display
  if (images.length === 1) {
    return (
      <>
        <div
          className="cursor-pointer"
          onClick={() => openLightbox(0)}
        >
          <img
            src={images[0]}
            alt={alt}
            className="w-full h-48 md:h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            loading="lazy"
          />
        </div>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            index={lightboxIndex}
            onClose={closeLightbox}
            onNext={goNext}
            onPrev={goPrev}
            onKeyDown={handleKeyDown}
          />
        )}
      </>
    );
  }

  // Multiple images — horizontal scroll strip
  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {images.map((url, i) => (
          <div
            key={i}
            className="flex-shrink-0 cursor-pointer relative"
            onClick={() => openLightbox(i)}
          >
            <img
              src={url}
              alt={`${alt} ${i + 1}`}
              className="h-32 md:h-44 w-auto min-w-[8rem] md:min-w-[10rem] object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              loading="lazy"
            />
            {/* Counter badge on first image */}
            {i === 0 && images.length > 1 && (
              <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-xs font-medium px-1.5 py-0.5 rounded-md">
                1/{images.length}
              </span>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
          onKeyDown={handleKeyDown}
        />
      )}
    </>
  );
};

/* ─── Fullscreen lightbox ─── */

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const Lightbox = ({ images, index, onClose, onNext, onPrev, onKeyDown }: LightboxProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onPrev();
      else onNext();
    }
    setTouchStart(null);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      ref={(el) => el?.focus()}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 text-white/80 text-sm font-medium">
        {index + 1} / {images.length}
      </div>

      {/* Previous button */}
      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-2 md:left-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Previous"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <img
        src={images[index]}
        alt={`Image ${index + 1}`}
        className="max-h-[85vh] max-w-[95vw] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        draggable={false}
      />

      {/* Next button */}
      {index < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-2 md:right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Next"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ImageGallery;
