import { useState } from 'react';
import { WEB_PACKAGES, ADD_ONS } from '../../constants/webPackages';
import AddOnCard from './components/AddOnCard';

export default function WebStudio() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const expandedPkg = WEB_PACKAGES.find(p => p.id === expanded);

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white">

      {/* ── FULLSCREEN IFRAME OVERLAY ── */}
      {expanded && expandedPkg && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0c0c0e] animate-in fade-in duration-300">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 h-12 bg-black/60 backdrop-blur border-b border-white/10 flex-shrink-0">
            <div className="flex gap-1.5">
              <button
                onClick={() => { setExpanded(null); setIframeLoaded(false); }}
                className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
              />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
              <span className="w-3.5 h-3.5 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 bg-white/10 rounded-md px-3 py-1 text-xs text-white/50 truncate">
              {expandedPkg.slides[0].url}
            </div>
            <a href={expandedPkg.slides[0].url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Atvērt
            </a>
            <button
              onClick={() => { setExpanded(null); setIframeLoaded(false); }}
              className="text-xs text-white/40 hover:text-white transition-colors ml-1"
            >
              ✕ Aizvērt
            </button>
          </div>
          {/* iframe */}
          <div className="relative flex-1">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0c0c0e] z-10">
                <div className="w-10 h-10 border-4 border-white/10 border-t-white/60 rounded-full animate-spin" />
              </div>
            )}
            <iframe
              src={expandedPkg.slides[0].url}
              title={expandedPkg.name}
              className="w-full h-full border-0"
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Kolab Web Studio
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
            Mājas lapa
            <span className="block bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              tavam uzņēmumam
            </span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10">
            Profesionālas vietnes jauniem uzņēmumiem.
            Skaidras cenas. Reali piemēri. Ātri rezultāti.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {['Bez slēptajiem maksājumiem', 'Mobilajām ierīcēm draudzīgs', 'Latviešu valodā', 'Piegāde 1–4 nedēļās'].map(tag => (
              <span key={tag} className="flex items-center gap-1.5 text-white/50">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">

          {/* Section label */}
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/30 uppercase tracking-widest">Izvēlies savu paketi</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WEB_PACKAGES.map((pkg, idx) => (
              <div
                key={pkg.id}
                className={`relative group rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  idx === 1
                    ? 'border-violet-500/50 bg-gradient-to-b from-violet-950/60 to-gray-950/80 shadow-lg shadow-violet-900/20'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
              >
                {/* Popular badge */}
                {idx === 1 && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px">
                    <span className="block bg-violet-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-b-lg uppercase tracking-widest">
                      Populārākais
                    </span>
                  </div>
                )}

                {/* Card top */}
                <div className="p-6 pt-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${pkg.labelColor}`}>
                        {pkg.name}
                      </span>
                      <p className="text-white text-xl font-bold mt-1">{pkg.price}</p>
                      <p className="text-white/30 text-xs mt-0.5">{pkg.priceNote}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${pkg.color} shadow-lg`}>
                      {pkg.icon}
                    </div>
                  </div>
                  <p className="text-white/50 text-sm mb-5">{pkg.tagline}</p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Live preview thumbnail */}
                <div className="mx-4 rounded-xl overflow-hidden border border-white/10 bg-black relative" style={{ height: '160px' }}>
                  <iframe
                    src={pkg.slides[0].url}
                    title={pkg.name}
                    className="absolute top-0 left-0 border-0 pointer-events-none"
                    style={{ width: '1280px', height: '800px', transform: 'scale(0.33)', transformOrigin: 'top left' }}
                    loading="lazy"
                    tabIndex={-1}
                    sandbox="allow-scripts allow-same-origin"
                  />
                  {/* Expand overlay */}
                  <button
                    onClick={() => { setExpanded(pkg.id); setIframeLoaded(false); }}
                    className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center group/btn"
                  >
                    <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity flex items-center gap-2 bg-white text-gray-900 font-semibold text-xs px-3 py-1.5 rounded-full shadow-xl">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      Pieredzi pilnekrānā
                    </span>
                  </button>
                </div>

                {/* CTA */}
                <div className="p-4 mt-auto">
                  <a
                    href={`mailto:info@kolab.lv?subject=Web Studio - ${pkg.name}`}
                    className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                      idx === 1
                        ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Sākt projektu →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADD-ONS ── */}
      <section className="px-4 pb-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto pt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Papildu pakalpojumi</h2>
            <p className="text-white/40 text-sm">Papildini savu paketi ar šiem digitālajiem produktiem</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADD_ONS.map(addon => <AddOnCard key={addon.title} addon={addon} />)}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <h3 className="text-2xl font-bold mb-2">Nav skaidrs, ko izvēlēties?</h3>
            <p className="text-white/40 text-sm mb-6">Sazinies ar mums un sapratīsim kopā, kas der tavam uzņēmumam</p>
            <a
              href="mailto:info@kolab.lv?subject=Web Studio - konsultācija"
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Jautā mums ✉️
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
