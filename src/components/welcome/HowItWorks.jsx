import React, { useEffect, useRef, useState } from 'react';
import { createPageUrl } from '@/utils';
import CrossdLogo from '@/components/common/CrossdLogo';

/* ─── Inline SVG icons ─── */
const IconPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8186d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8186d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconHeart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8186d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8186d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8186d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

/* ─── Star canvas ─── */
function StarCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      base: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.008 + 0.003,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const alpha = s.base + (s.base * 0.7) * Math.sin(t * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ─── Scroll-fade card wrapper ─── */
function FadeCard({ children, style }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(28px)', transition: 'opacity 0.55s ease, transform 0.55s ease', ...style }}>
      {children}
    </div>
  );
}

/* ─── Glass card ─── */
function GlassCard({ icon, label, heading, body, small }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'rgba(18,10,16,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: `1px solid ${hover ? 'rgba(232,24,109,0.5)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 20,
        padding: small ? '24px' : '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hover ? '0 0 40px rgba(232,24,109,0.18)' : 'none',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
    >
      {/* shimmer top edge */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(232,24,109,0.6), transparent)', opacity: hover ? 1 : 0, transition: 'opacity 0.25s' }} />
      {/* radial blob top-right */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'rgba(232,24,109,0.12)', borderRadius: '50%', filter: 'blur(30px)', opacity: hover ? 1 : 0, transition: 'opacity 0.25s', pointerEvents: 'none' }} />

      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,24,109,0.08)', border: '1px solid rgba(232,24,109,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{label}</span>
      </div>

      <h2 style={{ fontFamily: '"Instrument Serif", serif', fontSize: small ? 21 : 26, fontWeight: 400, color: '#fff', marginBottom: 12, lineHeight: 1.25 }}>{heading}</h2>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: small ? 14 : 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>{body}</p>
    </div>
  );
}

/* ─── Main export ─── */
export default function HowItWorks({ onBack }) {
  const steps = [
    { icon: <IconPin />, label: 'STEP ONE', heading: 'Log Your Moments', body: "The person at your usual coffee shop. Someone at the gym you keep seeing. That face on your commute you've never spoken to. Check in to the places you go and start building a trail — because the connection you almost made might already be waiting." },
    { icon: <IconStar />, label: 'STEP TWO', heading: 'Your Vibe Finds Its Match', body: "Our engine reads your patterns — the places you go, the energy you bring — and quietly surfaces people who move through the world the same way you do. No swiping required." },
    { icon: <IconHeart />, label: 'STEP THREE', heading: 'Like. Match. Actually Talk.', body: "Browse people who've shared your world. When the interest is mutual, the conversation opens. No guessing, no ghosting limbo — just a real chance at something real." },
  ];

  const numerals = ['1', '2', '3'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600;700&display=swap');

        .hiw-page { min-height: 100vh; background: #080509; position: relative; overflow-x: hidden; }

        .hiw-orb-tl { position: fixed; top: -80px; left: -80px; width: 360px; height: 360px; background: rgba(232,24,109,0.09); border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; }
        .hiw-orb-br { position: fixed; bottom: -80px; right: -80px; width: 300px; height: 300px; background: rgba(232,24,109,0.07); border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; }

        .hiw-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 50; background: rgba(8,5,9,0.7); backdrop-filter: blur(12px); WebkitBackdropFilter: blur(12px); border-bottom: 0.5px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: 60px; }

        .hiw-back-btn { font-family: Manrope, sans-serif; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.6); background: none; border: none; cursor: pointer; padding: 8px 0; transition: color 0.2s; }
        .hiw-back-btn:hover { color: #fff; }

        .hiw-content { position: relative; z-index: 10; max-width: 760px; margin: 0 auto; padding: 130px 28px 100px; }

        .hiw-badge { display: inline-block; font-family: Manrope, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #e8186d; background: rgba(232,24,109,0.08); border: 1px solid rgba(232,24,109,0.35); border-radius: 100px; padding: 6px 16px; margin-bottom: 28px; }

        .hiw-h1 { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: clamp(38px, 6vw, 58px); font-weight: 700; line-height: 1.1; color: #fff; margin: 0 0 20px; }
        .hiw-h1 em { font-style: italic; font-weight: 700; color: #e8186d; }

        .hiw-subtitle { font-family: Manrope, sans-serif; font-size: 16px; color: rgba(255,255,255,0.5); max-width: 440px; margin: 0 auto 80px; line-height: 1.6; }

        /* Thread + steps */
        .hiw-steps-wrap { position: relative; }
        .hiw-thread { position: absolute; left: 31px; top: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, transparent, rgba(232,24,109,0.35) 15%, rgba(232,24,109,0.35) 85%, transparent); }

        .hiw-step-row { display: grid; grid-template-columns: 64px 1fr; gap: 24px; margin-bottom: 24px; align-items: start; }

        .hiw-bubble { width: 64px; height: 64px; border-radius: 50%; background: rgba(232,24,109,0.08); border: 1px solid rgba(232,24,109,0.35); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: "Instrument Serif", serif; font-size: 22px; color: #e8186d; }

        /* Safety cards pair */
        .hiw-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; }

        /* CTA */
        .hiw-cta { text-align: center; padding-top: 72px; }
        .hiw-cta-btn { font-family: Manrope, sans-serif; font-size: 16px; font-weight: 600; color: #fff; background: #e8186d; border: none; border-radius: 100px; padding: 17px 46px; cursor: pointer; box-shadow: 0 0 40px rgba(232,24,109,0.45); transition: transform 0.2s, box-shadow 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .hiw-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 50px rgba(232,24,109,0.6); }
        .hiw-cta-sub { font-family: Manrope, sans-serif; font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 14px; }

        @media (max-width: 580px) {
          .hiw-thread { display: none; }
          .hiw-step-row { grid-template-columns: 1fr; }
          .hiw-bubble { display: none; }
          .hiw-pair { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="hiw-page">
        <StarCanvas />
        <div className="hiw-orb-tl" />
        <div className="hiw-orb-br" />

        {/* Nav */}
        <nav className="hiw-nav">
          <CrossdLogo size="sm" />
          <button className="hiw-back-btn" onClick={onBack}>← Back</button>
        </nav>

        <div className="hiw-content">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div className="hiw-badge">HOW IT WORKS</div>
            <h1 className="hiw-h1">
              You've already met them.<br />
              <em>You just don't know it yet.</em>
            </h1>
            <p className="hiw-subtitle">
              Crossd finds the connection that was always there — hidden in the places you both call yours.
            </p>
          </div>

          {/* Steps */}
          <div className="hiw-steps-wrap">
            <div className="hiw-thread" />
            {steps.map((s, i) => (
              <FadeCard key={i} style={{ marginBottom: 24 }}>
                <div className="hiw-step-row">
                  <div className="hiw-bubble">{numerals[i]}</div>
                  <GlassCard icon={s.icon} label={s.label} heading={s.heading} body={s.body} />
                </div>
              </FadeCard>
            ))}
          </div>

          {/* Safety pair */}
          <FadeCard>
            <div className="hiw-pair">
              <GlassCard icon={<IconShield />} label="PRIVACY" heading="Safe Until You're Ready" body="Once you match, chat securely inside Crossd. Your number, your socials, your business — all yours until you choose to share them." small />
              <GlassCard icon={<IconSun />} label="LOCATION" heading="Your Location Stays Yours" body="We never share where you are. Crossd works on approximate areas and only connects the dots when both sides are interested." small />
            </div>
          </FadeCard>

          {/* CTA */}
          <FadeCard>
            <div className="hiw-cta">
              <button className="hiw-cta-btn" onClick={() => window.location.href = createPageUrl('Onboarding')}>
                Start Crossing Paths
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <p className="hiw-cta-sub">Free to join · No credit card needed</p>
            </div>
          </FadeCard>
        </div>
      </div>
    </>
  );
}