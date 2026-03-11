import { WEB_PACKAGES, ADD_ONS } from '../../constants/webPackages';

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="9" fill="rgba(52,211,153,0.12)" />
      <path d="M5 9l3 3 5-6" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15,3 21,3 21,9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12,5 19,12 12,19" />
    </svg>
  );
}

function PackageSection({ pkg, index }: { pkg: typeof WEB_PACKAGES[0]; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <section style={{
      padding: '100px 32px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: isEven ? 'transparent' : 'rgba(255,255,255,0.015)',
    }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          gap: 56,
          alignItems: 'start',
        }} className="ws-grid">

          {/* TEXT COLUMN — fixed width, left */}
          <div style={{ order: isEven ? 0 : 1 }}>
            {/* Package label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 30 }}>{pkg.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Pakete</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: pkg.accentColor }}>{pkg.name}</p>
              </div>
            </div>

            {/* Tagline */}
            <h2 style={{ margin: '0 0 16px', fontSize: 32, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#fff' }}>
              {pkg.tagline}
            </h2>

            {/* Description */}
            <p style={{ margin: '0 0 32px', fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>
              {pkg.description}
            </p>

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {pkg.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                  <CheckIcon />{f}
                </li>
              ))}
            </ul>

            {/* Price */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 38, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>{pkg.price}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>{pkg.priceNote}</span>
            </div>

            {/* CTA */}
            <a
              href={`mailto:info@kolab.lv?subject=Web Studio - ${pkg.name}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 24px', borderRadius: 12,
                background: `linear-gradient(135deg, ${pkg.gradientFrom}, ${pkg.gradientTo})`,
                boxShadow: `0 8px 28px ${pkg.shadowColor}`,
                color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
            >
              Sākt projektu <ArrowIcon />
            </a>
          </div>

          {/* PREVIEW COLUMN — flexible, takes remaining space */}
          <div style={{ order: isEven ? 1 : 0 }}>
            {/* Browser device frame */}
            <div style={{
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
              background: '#181818',
            }}>
              {/* Browser chrome */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: '#242424',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', display: 'block' }} />
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28ca41', display: 'block' }} />
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pkg.slides[0].url}
                </div>
                {/* Open in new tab button — clear, always visible */}
                <a
                  href={pkg.slides[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, padding: '4px 10px',
                    color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600,
                    textDecoration: 'none', transition: 'background 0.15s',
                  }}
                >
                  <ExternalIcon /> Atvērt
                </a>
              </div>

              {/* Live scaled iframe — tall and wide */}
              <div style={{ position: 'relative', overflow: 'hidden', height: 500 }}>
                <iframe
                  src={pkg.slides[0].url}
                  title={pkg.name}
                  style={{
                    position: 'absolute', top: 0, left: 0, border: 'none',
                    width: 1440, height: 1100,
                    transform: 'scale(0.62)',
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                  }}
                  loading="lazy"
                  tabIndex={-1}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>

            {/* Caption */}
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 10 }}>
              {pkg.slides[0].label} — piemērs
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ws-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .ws-grid > div { order: unset !important; }
        }
      `}</style>
    </section>
  );
}

export default function WebStudio() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0c0c0e',
      color: '#fff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 32px 96px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '6px 16px', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
            Kolab Web Studio
          </div>
          <h1 style={{ fontSize: 'clamp(42px, 6vw, 78px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, margin: '0 0 18px' }}>
            Mājas lapa
            <span style={{ display: 'block', background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              tavam uzņēmumam
            </span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: '0 auto 36px', maxWidth: 460 }}>
            Profesionālas vietnes jauniem uzņēmumiem. Skaidras cenas. Reāli piemēri.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginBottom: 44 }}>
            {['Bez slēptajiem maksājumiem', 'Mobilais pirmajā vietā', 'Latviešu valodā', '1–4 nedēļās gatavas'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                <CheckIcon />{t}
              </span>
            ))}
          </div>
          <a href="#packages" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0c0c0e', fontWeight: 700, fontSize: 15, padding: '13px 28px', borderRadius: 12, textDecoration: 'none' }}>
            Apskatīt paketes
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </a>
        </div>
      </section>

      {/* PACKAGES */}
      <div id="packages">
        {WEB_PACKAGES.map((pkg, i) => <PackageSection key={pkg.id} pkg={pkg} index={i} />)}
      </div>

      {/* ADD-ONS */}
      <section style={{ padding: '80px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px' }}>Papildu pakalpojumi</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, margin: 0 }}>Papildini savu paketi ar šiem digitālajiem produktiem</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {ADD_ONS.map(a => (
              <div key={a.title} style={{ display: 'flex', gap: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px' }}>
                <span style={{ fontSize: 22 }}>{a.icon}</span>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#fff' }}>{a.title}</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{a.price}</p>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section style={{ padding: '0 32px 100px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '52px 40px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 10px' }}>Nav skaidrs, ko izvēlēties?</h3>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, margin: '0 0 26px', lineHeight: 1.6 }}>Sazinies ar mums un sapratīsim kopā, kas der tavam uzņēmumam</p>
          <a href="mailto:info@kolab.lv?subject=Web Studio" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#0c0c0e', fontWeight: 700, fontSize: 15, padding: '13px 28px', borderRadius: 12, textDecoration: 'none' }}>
            Jautā mums
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
