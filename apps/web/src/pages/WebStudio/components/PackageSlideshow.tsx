import { useState } from 'react';

export interface Slide {
  label: string;
  url: string;
  description: string;
}

interface Props {
  slides: Slide[];
}

export default function PackageSlideshow({ slides }: Props) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

  const slide = slides[current];

  return (
    <div className="flex flex-col">
      {/* Browser mockup frame */}
      <div className="rounded-t-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        {/* Browser chrome bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <div className="flex-1 mx-3 bg-white dark:bg-gray-600 rounded-md px-3 py-0.5 text-xs text-gray-400 dark:text-gray-300 truncate">
            {slide.url}
          </div>
        </div>

        {/* iframe preview — scaled down to fit */}
        <div className="relative w-full overflow-hidden" style={{ height: '220px' }}>
          <iframe
            key={slide.url}
            src={slide.url}
            title={slide.label}
            className="absolute top-0 left-0 border-0"
            style={{
              width: '1280px',
              height: '900px',
              transform: 'scale(0.38)',
              transformOrigin: 'top left',
              pointerEvents: 'none',
            }}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

      {/* Slide label + description */}
      <div className="bg-gray-50 dark:bg-gray-800/60 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-xl px-4 py-2.5 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{slide.label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-400">{slide.description}</p>
        </div>

        {/* Arrows + dots */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={prev}
            className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm transition-colors"
            aria-label="Iepriekšējais"
          >
            ‹
          </button>
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === current
                    ? 'bg-gray-700 dark:bg-white scale-125'
                    : 'bg-gray-300 dark:bg-gray-500'
                }`}
                aria-label={`Slaids ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm transition-colors"
            aria-label="Nākamais"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
