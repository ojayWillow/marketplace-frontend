import { useEffect, useState } from 'react';
import type { Slide } from '../../../constants/webPackages';

interface Props {
  slides: Slide[];
  packageName: string;
  accentClass: string;
  onClose: () => void;
}

export default function FullscreenPreview({ slides, packageName, accentClass, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const current = slides[activeIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      {/* Top control bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        {/* Traffic lights */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
            title="Aizvērt (Esc)"
          />
          <span className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
          <span className="w-3.5 h-3.5 rounded-full bg-green-500" />
        </div>

        {/* Package badge */}
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full text-white ${accentClass} flex-shrink-0`}>
          {packageName}
        </span>

        {/* URL bar */}
        <div className="flex-1 bg-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          <span className="text-xs text-gray-300 truncate">{current.url}</span>
        </div>

        {/* Open in new tab */}
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-gray-800"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Atvērt
        </a>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-gray-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Aizvērt
        </button>
      </div>

      {/* Site switcher tabs */}
      {slides.length > 1 && (
        <div className="flex gap-1 px-4 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0 overflow-x-auto">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => { setActiveIndex(i); setLoading(true); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                i === activeIndex
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${accentClass}`} />
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* iframe — fills all remaining space */}
      <div className="relative flex-1 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center gap-3 z-10">
            <div className="w-10 h-10 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Ielādā vietni...</p>
          </div>
        )}
        <iframe
          key={current.url}
          src={current.url}
          title={current.label}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>

      {/* Bottom info bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-t border-gray-800 flex-shrink-0">
        <p className="text-xs text-gray-500">{current.description}</p>
        <p className="text-xs text-gray-600">Nospied Esc lai aizvērtu</p>
      </div>
    </div>
  );
}
