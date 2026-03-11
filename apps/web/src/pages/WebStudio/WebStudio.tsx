import { useState } from 'react';
import { WEB_PACKAGES, ADD_ONS } from '../../constants/webPackages';

function FullscreenPreview({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col" style={{ background: '#000' }}>
      {/* Sticky top bar — always above iframe */}
      <div
        className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{ height: 48, background: '#111', borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 10 }}
      >
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <button onClick={onClose} style={{ width: 13, height: 13, borderRadius: '50%', background: '#ff5f57', border: 'none', cursor: 'pointer' }} title="Aizvērt" />
          <span style={{ width: 13, height: 13, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
          <span style={{ width: 13, height: 13, borderRadius: '50%', background: '#28ca41', display: 'inline-block' }} />
        </div>
        {/* URL bar */}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 12px', fontSize: 12, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {url}
        </div>
        {/* Open in new tab */}
        <a href={url} target="_blank" rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Atvērt
        </a>
        {/* Back button */}
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', fontSize: 13, fontWeight: 600, padding: '5px 14px',
            borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap'
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Atpakaļ
        </button>
      </div>

      {/* iframe area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
            <div className="w-10 h-10 rounded-full border-4 border-white/10 border-t-white/50 animate-spin mb-3" />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Ielādā {name}...</p>
          </div>
        )}
        <iframe
          src={url}
          title={name}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          onLoad={() => setLoaded(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="rgba(52,211,153,0.15)" />
      <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PackageSection({ pkg, index }: { pkg: typeof WEB_PACKAGES[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const isEven = index % 2 === 0;

  const previewScale = 0.44;
  const previewHeight = 380;
  const iframeW = 1280;
  const iframeH = Math.round(previewHeight / previewScale);

  return (
    <>
      {open && <FullscreenPreview url={pkg.slides[0].url} name={pkg.name} onClose={() => setOpen(false)} />}

      <section style={{ padding: '80px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: isEven ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            alignItems: 'center',
          }}
          className="ws-grid"
          >
            {/* TEXT SIDE */}
            <div style={{ order: isEven ? 0 : 1 }}>
              {/* Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 28 }}>{pkg.icon}</span>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Pakete</p>
                  <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }} className={pkg.labelColor}>{pkg.name}</p>
                </div>
              </div>

              {/* Tagline */}
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em', color: '#fff' }}>
                {pkg.tagline}
              </h2>

              {/* Description */}
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
                {pkg.description}
              </p>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pkg.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Price + CTA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>{pkg.price}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>{pkg.priceNote}</span>
                </div>
                <a
                  href={`mailto:info@kolab.lv?subject=Web Studio - ${pkg.name}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 22px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                    color: '#fff', textDecoration: 'none',
                    background: `linear-gradient(135deg, ${pkg.gradientFrom}, ${pkg.gradientTo})`,
                    boxShadow: `0 8px 24px ${pkg.shadowColor}`,
                  }}
                >
                  Sākt projektu <ArrowRight />
                </a>
              </div>
            </div>

            {/* PREVIEW SIDE */}
            <div style={{ order: isEven ? 1 : 0 }}>
              {/* Browser device frame */}
              <div style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                background: '#1a1a1a',
              }}>
                {/* Chrome bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#242424', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', display: 'block' }} />
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28ca41', display: 'block' }} />
                  </div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'rgba(255,255,255,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pkg.slides[0].url}
                  </div>
                </div>

                {/* Live scaled iframe thumbnail */}
                <div
                  style={{ position: 'relative', overflow: 'hidden', height: previewHeight, cursor: 'pointer' }}
                  onClick={() => setOpen(true)}
                  role="button"
                  aria-label="Atvērt pilnekrāna priekšskatu"
                >
                  <iframe
                    src={pkg.slides[0].url}
                    title={pkg.name}
                    style={{
                      position: 'absolute', top: 0, left: 0, border: 'none',
                      width: iframeW, height: iframeH,
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top left',
                      pointerEvents: 'none',
                    }}
                    loading="lazy"
                    tabIndex={-1}
                    sandbox="allow-scripts allow-same-origin"
                  />

                  {/* Hover overlay */}
                  <div
                    className="ws-hover-overlay"
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.25s',
                    }}
                  >
                    <div className="ws-hover-btn" style={{
                      opacity: 0,
                      transform: 'translateY(8px)',
                      transition: 'opacity 0.25s, transform 0.25s',
                      textAlign: 'center',
                    }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 10px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        color: '#111',
                      }}>
                        <ExpandIcon />
                      </div>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>Pieredzi pilnekrānā</p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '4px 0 0' }}>Nospied Esc lai dotos atpakaļ</p>
                    </div>
                  </div>
                </div>
              </div>

              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 12 }}>
                {pkg.slides[0].label}
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .ws-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .ws-grid > div { order: unset !important; }
        }
        .ws-hover-overlay:hover { background: rgba(0,0,0,0.55) !important; }
        .ws-hover-overlay:hover .ws-hover-btn { opacity: 1 !important; transform: translateY(0) !important; }
      `}</style>
    </>
  );
}

export default function WebStudio() {
  return (
    <div style={{ minHeight: '100vh', background: '#0c0c0e', color: '#fff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 100px', textAlign: 'center' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          {/* Pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '6px 16px', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} className="animate-pulse" />
            Kolab Web Studio
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(44px, 7vw, 80px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, margin: '0 0 20px' }}>
            Mājas lapa
            <span style={{ display: 'block', background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              tavam uzņēmumam
            </span>
          </h1>

          {/* Subline */}
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 40px' }}>
            Profesionālas vietnes jauniem uzņēmumiem.
            Skaidras cenas. Reāli piemēri. Ātri rezultāti.
          </p>

          {/* Trust badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, marginBottom: 44 }}>
            {['Bez slēptajiem maksājumiem', 'Mobilais pirmajā vietā', 'Latviešu valodā', '1–4 nedēļās gatavas'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                <CheckIcon />{t}
              </span>
            ))}
          </div>

          <a href="#packages" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0c0c0e', fontWeight: 700, fontSize: 15, padding: '13px 28px', borderRadius: 12, textDecoration: 'none' }}>
            Apskatīt paketes
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* PACKAGE SECTIONS */}
      <div id="packages">
        {WEB_PACKAGES.map((pkg, i) => <PackageSection key={pkg.id} pkg={pkg} index={i} />)}
      </div>

      {/* ADD-ONS */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px' }}>Papildu pakalpojumi</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15 }}>Papildini savu paketi ar šiem digitālajiem produktiem</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {ADD_ONS.map(a => (
              <div key={a.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{a.icon}</span>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#fff', margin: 0 }}>{a.title}</p>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0, whiteSpace: 'nowrap' }}>{a.price}</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0', lineHeight: 1.5 }}>{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '56px 40px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 10px' }}>Nav skaidrs, ko izvēlēties?</h3>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, margin: '0 0 28px' }}>Sazinies ar mums un sapratīsim kopā, kas der tavam uzņēmumam</p>
          <a href="mailto:info@kolab.lv?subject=Web Studio - konsultācija"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0c0c0e', fontWeight: 700, fontSize: 15, padding: '13px 28px', borderRadius: 12, textDecoration: 'none' }}
          >
            Jautā mums
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
