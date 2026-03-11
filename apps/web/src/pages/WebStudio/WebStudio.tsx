import { useState } from 'react';
import { WEB_PACKAGES, ADD_ONS } from '../../constants/webPackages';

// ── Fullscreen overlay ──
function FullscreenPreview({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Floating exit button — always visible top-right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/20 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Atpakaļ
      </button>

      {/* Browser bar */}
      <div className="flex items-center gap-3 px-4 h-11 bg-[#1c1c1e] border-b border-white/10 flex-shrink-0">
        <div className="flex gap-1.5">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 bg-white/10 rounded-md px-3 py-1 text-xs text-white/40 truncate">{url}</div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-white transition-colors">
          Atvērt jaunā ciliņā ↗
        </a>
      </div>

      {/* iframe */}
      <div className="relative flex-1 overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-white/10 border-t-white/60 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/40 text-sm">Ielādā {name}...</p>
            </div>
          </div>
        )}
        <iframe
          src={url}
          title={name}
          className="w-full h-full border-0"
          onLoad={() => setLoaded(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}

// ── Package Section ──
function PackageSection({ pkg, index }: { pkg: typeof WEB_PACKAGES[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const isEven = index % 2 === 0;

  return (
    <>
      {open && <FullscreenPreview url={pkg.slides[0].url} name={pkg.name} onClose={() => setOpen(false)} />}

      <section className={`py-24 px-4 border-b border-white/5 ${
        isEven ? 'bg-transparent' : 'bg-white/[0.02]'
      }`}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Text side */}
            <div className={isEven ? 'order-1' : 'order-1 md:order-2'}>
              {/* Package label */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-3xl`}>{pkg.icon}</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Pakete</p>
                  <h2 className={`text-2xl font-bold ${pkg.labelColor}`}>{pkg.name}</h2>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-white text-3xl font-bold leading-tight mb-3">{pkg.tagline}</p>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">{pkg.description}</p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {pkg.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                    <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Price + CTA */}
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <span className="text-3xl font-bold text-white">{pkg.price}</span>
                  <span className="text-white/30 text-xs ml-2">{pkg.priceNote}</span>
                </div>
                <a
                  href={`mailto:info@kolab.lv?subject=Web Studio - ${pkg.name}`}
                  className={`px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all bg-gradient-to-r ${pkg.color} hover:opacity-90 shadow-lg`}
                >
                  Sākt projektu →
                </a>
              </div>
            </div>

            {/* Preview side */}
            <div className={isEven ? 'order-2' : 'order-2 md:order-1'}>
              {/* Browser device frame */}
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 bg-[#1c1c1e]">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#2c2c2e] border-b border-white/10">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 bg-white/10 rounded px-2 py-0.5 text-[11px] text-white/30 truncate">
                    {pkg.slides[0].url}
                  </div>
                </div>

                {/* Live thumbnail */}
                <div
                  className="relative overflow-hidden cursor-pointer group"
                  style={{ height: '280px' }}
                  onClick={() => setOpen(true)}
                >
                  <iframe
                    src={pkg.slides[0].url}
                    title={pkg.name}
                    className="absolute top-0 left-0 border-0 pointer-events-none"
                    style={{
                      width: '1280px',
                      height: '900px',
                      transform: 'scale(0.37)',
                      transformOrigin: 'top left',
                    }}
                    loading="lazy"
                    tabIndex={-1}
                    sandbox="allow-scripts allow-same-origin"
                  />

                  {/* Hover CTA overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-center">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-xl">
                        <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </div>
                      <p className="text-white font-bold text-sm">Pieredzi pilnekrānā</p>
                      <p className="text-white/60 text-xs mt-1">Nospied Esc lai dotos atpakaļ</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption below frame */}
              <p className="text-center text-white/20 text-xs mt-3">{pkg.slides[0].label}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Main page ──
export default function WebStudio() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white">

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-24 px-4 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Kolab Web Studio
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5 leading-none">
            Mājas lapa
            <span className="block bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent mt-1">
              tavam uzņēmumam
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto mb-8">
            Profesionālas vietnes jauniem uzņēmumiem.
            Skaidras cenas. Reāli piemēri.
          </p>
          <a href="#packages" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors">
            Apskatīt paketes ↓
          </a>
        </div>
      </section>

      {/* Package sections */}
      <div id="packages">
        {WEB_PACKAGES.map((pkg, i) => (
          <PackageSection key={pkg.id} pkg={pkg} index={i} />
        ))}
      </div>

      {/* Add-ons */}
      <section className="px-4 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Papildu pakalpojumi</h2>
            <p className="text-white/40 text-sm">Papildini savu paketi ar šiem digitālajiem produktiem</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADD_ONS.map(addon => (
              <div key={addon.title} className="flex items-start gap-4 bg-white/[0.03] rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all">
                <span className="text-2xl">{addon.icon}</span>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-white text-sm">{addon.title}</h3>
                    <span className="text-sm font-bold text-white/50">{addon.price}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{addon.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 pb-28">
        <div className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <h3 className="text-2xl font-bold mb-2">Nav skaidrs, ko izvēlēties?</h3>
          <p className="text-white/40 text-sm mb-6">Sazinies ar mums un sapratīsim kopā</p>
          <a
            href="mailto:info@kolab.lv?subject=Web Studio - konsultācija"
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Jautā mums ✉️
          </a>
        </div>
      </section>
    </div>
  );
}
