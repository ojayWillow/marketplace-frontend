import { useState } from 'react';
import type { Slide } from '../../../constants/webPackages';

interface Props {
  slides: Slide[];
  accentColor: string;
}

export default function PackagePreview({ slides, accentColor }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  const isOpen = (i: number) => activeIndex === i;

  return (
    <div className="flex flex-col gap-2">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm"
        >
          {/* Accordion header — click to expand */}
          <button
            onClick={() => setActiveIndex(isOpen(i) ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              {/* Live indicator dot */}
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${accentColor}`} />
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{slide.label}</p>
                <p className="text-xs text-gray-400">{slide.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-400 hidden group-hover:inline">
                {isOpen(i) ? 'Aizvērt' : 'Apskatīt'}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  isOpen(i) ? 'rotate-180' : ''
                }`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Expandable iframe panel */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isOpen(i) ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {/* Browser chrome */}
            <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 dark:text-gray-300 truncate">
                {slide.url}
              </div>
              <a
                href={slide.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Atvērt
              </a>
            </div>

            {/* Loading skeleton */}
            {isOpen(i) && !loaded[i] && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}

            {/* The actual iframe — only renders when opened */}
            {isOpen(i) && (
              <div className="relative" style={{ height: '620px' }}>
                <iframe
                  src={slide.url}
                  title={slide.label}
                  className="w-full h-full border-0"
                  loading="lazy"
                  onLoad={() => setLoaded((prev) => ({ ...prev, [i]: true }))}
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
