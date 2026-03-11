import { useState } from 'react';
import type { WebPackage } from '../../../constants/webPackages';

interface Props {
  slides: WebPackage['slides'];
}

export default function PackageSlideshow({ slides }: Props) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

  const slide = slides[current];

  return (
    <div className="relative rounded-xl overflow-hidden select-none">
      {/* Slide */}
      <div
        className={`bg-gradient-to-br ${slide.bg} h-48 flex flex-col items-center justify-center text-white p-6 transition-all duration-300`}
      >
        <span className="text-5xl mb-3">{slide.icon}</span>
        <p className="font-semibold text-lg text-center">{slide.label}</p>
        <p className="text-sm text-white/80 text-center mt-1">{slide.description}</p>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
        aria-label="Iepriekšējais"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
        aria-label="Nākamais"
      >
        ›
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-white scale-125' : 'bg-white/40'
            }`}
            aria-label={`Slaids ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
