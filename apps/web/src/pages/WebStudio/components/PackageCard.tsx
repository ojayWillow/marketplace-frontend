import { useState } from 'react';
import FullscreenPreview from './FullscreenPreview';
import type { WebPackage } from '../../../constants/webPackages';

interface Props {
  pkg: WebPackage;
}

export default function PackageCard({ pkg }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div className={`rounded-2xl border-2 ${pkg.borderColor} bg-white dark:bg-gray-900 shadow-lg overflow-hidden`}>
        {/* Gradient header */}
        <div className={`bg-gradient-to-r ${pkg.color} px-6 py-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Pakete</span>
              <h2 className="text-white text-3xl font-bold mt-0.5">{pkg.name}</h2>
              <p className="text-white/80 text-sm mt-1 max-w-xs">{pkg.tagline}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white text-3xl font-bold">{pkg.price}</p>
              <p className="text-white/60 text-xs mt-0.5">{pkg.priceNote}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: preview thumbnails */}
          <div className="p-6 border-r border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Piemēru vietnes
            </p>
            <div className="flex flex-col gap-3">
              {pkg.slides.map((slide, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewOpen(true)}
                  className="group relative rounded-xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all hover:shadow-md text-left"
                >
                  {/* Scaled live preview thumbnail */}
                  <div className="relative w-full overflow-hidden bg-gray-50 dark:bg-gray-800" style={{ height: '160px' }}>
                    <iframe
                      src={slide.url}
                      title={slide.label}
                      className="absolute top-0 left-0 border-0 pointer-events-none"
                      style={{
                        width: '1280px',
                        height: '800px',
                        transform: 'scale(0.33)',
                        transformOrigin: 'top left',
                      }}
                      loading="lazy"
                      tabIndex={-1}
                      sandbox="allow-scripts allow-same-origin"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 font-semibold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Pieredzi pilnekrānā
                      </span>
                    </div>
                  </div>
                  {/* Label */}
                  <div className="px-3 py-2 bg-white dark:bg-gray-900">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{slide.label}</p>
                    <p className="text-xs text-gray-400">{slide.description}</p>
                  </div>
                </button>
              ))}

              {/* Big CTA to open fullscreen */}
              <button
                onClick={() => setPreviewOpen(true)}
                className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all ${pkg.buttonColor} hover:scale-[1.02] active:scale-100 shadow-sm flex items-center justify-center gap-2`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Atvērt pilnekrāna priekšskatu
              </button>
            </div>
          </div>

          {/* Right: features + CTA */}
          <div className="p-6 flex flex-col">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Iekļauts cenā
            </p>
            <ul className="space-y-2.5 flex-1">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <a
                href={`mailto:info@kolab.lv?subject=Web Studio - pakete: ${pkg.name}`}
                className="w-full block text-center py-3.5 px-4 rounded-xl border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold text-sm transition-all hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900"
              >
                Sākt projektu →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {previewOpen && (
        <FullscreenPreview
          slides={pkg.slides}
          packageName={pkg.name}
          accentClass={pkg.dotColor}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}
