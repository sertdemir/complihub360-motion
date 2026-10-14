import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, clamp01, EASE, F, lerp, PROFILE, prog, sp, SPRING, TYPE} from '../../src/brand/brand';
import {CLAIM_LINE} from '../../src/c360/EndCardClaim';
import {DotGlobe, GlobeMarket} from '../../src/c360/DotGlobe';
import {Logo} from '../../src/c360/Logo';
import {KineticLine} from '../../src/c360/Text';
import {Grain, Roll} from '../../src/components/primitives';
import {COPY, PRIORITY_LABEL, Priority} from '../reel-01/copy';
import TL from './timeline.json';

// ─── Probe "Produkt-Reel" im MakerMap-Stil (2026-10-12) ──────────────────────
// Referenz-Synthese (Moodboard Motion-Referenzen): Das Produkt ist die
// Hauptfigur, und EINE Form trägt die ganze Geschichte — sie wird Pill,
// Button, Wizard, Häkchen, Gold-Punkt, Risk Map, Matching und wieder Pill.
// Kein harter Schnitt. Ein Satz pro Takt, der Satzpunkt in Gold.
// Copy und Daten 1:1 aus Reel 01 (abgenommen), Risk Map und Fachleute als
// Beispiel gekennzeichnet, keine Namen.
// Runde 2 (2026-10-14): Punktglobus aus der MakerMap-Referenz — der Gold-Punkt
// wächst zum Globus, der dreht nach Europa, die Märkte DE → UK + NL leuchten
// auf. Zwei Formate aus einer Quelle: 9:16 (reel) und 16:9 (wide).

export const probeDuration = TL.duration;
export const probeFps = TL.fps;
const D = COPY.de;

// ─── Formate ─────────────────────────────────────────────────────────────────
// reel: Satz oben, Form darunter. wide: Satz links, Form rechts. Alle Formmaße
// sind gleich; nur der Anker (Mitte der Form) und der Satzblock wandern.
export type ProbeFormat = 'reel' | 'wide';
const LAYOUT = {
  reel: {cx: 540, cy: 1050, head: {top: 290, left: 60, width: 900, size: 96}, claim: 96, cta: 110, globe: 680},
  wide: {cx: 1330, cy: 545, head: {top: 330, left: 120, width: 720, size: 88}, claim: 70, cta: 100, globe: 700},
} as const;

// ─── Die eine Form ───────────────────────────────────────────────────────────
// dy: Versatz der Formmitte zum Anker des Formats.
type Shape = {dy: number; w: number; h: number; r: number; bg: string; shadow: number};
const PILL_DY = -40;
const S: Record<string, Shape> = {
  pill: {dy: PILL_DY, w: 560, h: 128, r: 64, bg: C.petrolDeep, shadow: 1},
  button: {dy: PILL_DY, w: 600, h: 128, r: 64, bg: C.petrol, shadow: 1},
  wizard: {dy: 0, w: 900, h: 780, r: 44, bg: '#f8fafa', shadow: 1},
  spinner: {dy: 0, w: 200, h: 200, r: 100, bg: C.petrolDeep, shadow: 1},
  dot: {dy: 0, w: 72, h: 72, r: 36, bg: '#c5913b', shadow: 0},
  risk: {dy: 10, w: 900, h: 820, r: 44, bg: '#f8fafa', shadow: 1},
  match: {dy: 0, w: 900, h: 700, r: 44, bg: C.petrolDeep, shadow: 1},
};
const globeShape = (d: number): Shape => ({dy: -20, w: d, h: d, r: d / 2, bg: '#f8fafa', shadow: 0.7});
const steps = (globe: number): [number, number, Shape][] => [
  [0, 0, S.pill],
  [TL.button, 0.5, S.button],
  [TL.wizard, 0.75, S.wizard],
  [TL.spinner, 0.6, S.spinner],
  [TL.dot, 0.45, S.dot],
  [TL.globe, 0.8, globeShape(globe)],
  [TL.risk, 0.8, S.risk],
  [TL.match, 0.8, S.match],
  [TL.end, 0.8, S.pill],
];
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const [x, y] = [hex(a), hex(b)];
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(',')})`;
};
const shapeAt = (t: number, globe: number): Shape => {
  const all = steps(globe);
  let cur = all[0][2];
  for (const [t0, dur, to] of all.slice(1)) {
    if (t < t0) break;
    const k = prog(t, t0, t0 + dur, EASE.move);
    cur = {
      dy: lerp(cur.dy, to.dy, k),
      w: lerp(cur.w, to.w, k),
      h: lerp(cur.h, to.h, k),
      r: lerp(cur.r, to.r, k),
      bg: k >= 1 ? to.bg : mix(cur.bg.startsWith('#') ? cur.bg : '#f8fafa', to.bg, k),
      shadow: lerp(cur.shadow, to.shadow, k),
    };
    if (k >= 1) cur = to;
  }
  return cur;
};

/** Sichtbarkeit einer Inhaltsschicht in der Form: ein, halten, aus. */
const win = (t: number, a: number, b: number, fin = 0.35, fout = 0.25) =>
  prog(t, a, a + fin, EASE.enter) * (1 - prog(t, b - fout, b, EASE.exit));

// ─── Headline: Satz aus der Maske, der Punkt setzt sich in Gold ──────────────
type Head = {top: number; left: number; width: number; size: number};
const Headline: React.FC<{text: string; inAt: number; outAt?: number; head: Head}> = ({text, inAt, outAt = 99, head}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const body = text.replace(/\.$/, '');
  const words = body.split(' ').length;
  const dotAt = inAt + words * PROFILE.calm.stagger + 0.35;
  const dot = clamp01(sp(frame, fps, dotAt, SPRING.pop)) * (1 - prog(t, outAt + 0.1, outAt + 0.4, EASE.exit));
  return (
    <div style={{position: 'absolute', top: head.top, left: head.left, width: head.width}}>
      <KineticLine
        text={body}
        inAt={inAt}
        outAt={outAt === 99 ? undefined : outAt}
        profile="calm"
        style={{...TYPE.display, fontSize: head.size, color: C.petrol}}
        suffix={<span style={{display: 'inline-block', color: C.gold, transform: `scale(${dot})`, transformOrigin: '50% 85%', opacity: dot}}>.</span>}
      />
    </div>
  );
};

// ─── Inhalte der Form ────────────────────────────────────────────────────────
const PillContent: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
    <Logo lockup="symbol" tone="on-petrol" height={64} />
    <span style={{fontFamily: F.sans, fontWeight: 600, fontSize: 46, color: C.onPetrol, letterSpacing: '-0.01em'}}>CompliHub360</span>
  </div>
);

const Chip: React.FC<{label: string; on: number}> = ({label, on}) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', gap: 14, height: 112, padding: '0 28px', borderRadius: 24,
      background: mix('#ebf1f0', '#004d40', on), color: on > 0.5 ? C.onPetrol : C.ink,
      fontFamily: F.sans, fontWeight: 500, fontSize: 33, transform: `scale(${1 - 0.04 * Math.sin(on * Math.PI)})`,
    }}
  >
    <span style={{width: 34, height: 34, borderRadius: 10, border: `2.5px solid ${on > 0.5 ? C.goldOnPetrol : 'rgba(0,77,64,0.35)'}`, display: 'grid', placeItems: 'center', flex: 'none'}}>
      <svg width="20" height="20" viewBox="0 0 20 20" style={{opacity: on}}>
        <path d="M4 10.5 L8.5 15 L16 5.5" fill="none" stroke={C.goldOnPetrol} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={20} strokeDashoffset={20 * (1 - on)} />
      </svg>
    </span>
    {label}
  </div>
);

const WizardContent: React.FC<{t: number}> = ({t}) => {
  const w = D.wizard;
  const on = (i: number) => {
    const k = (w.picks as readonly number[]).indexOf(i);
    return k < 0 ? 0 : prog(t, TL.picks[k], TL.picks[k] + 0.3, EASE.enter);
  };
  const count = prog(t, TL.picks[1], TL.picks[1] + 0.4, EASE.move);
  const press = prog(t, TL.next, TL.next + 0.1, EASE.enter) * (1 - prog(t, TL.next + 0.1, TL.next + 0.35, EASE.move));
  return (
    <div style={{position: 'absolute', inset: 0, padding: 56, display: 'flex', flexDirection: 'column', gap: 26}}>
      <span style={{...TYPE.label, fontSize: 24, color: C.inkMuted}}>{w.step}</span>
      <span style={{fontFamily: F.sans, fontWeight: 600, fontSize: 50, lineHeight: 1.15, color: C.ink, letterSpacing: '-0.01em'}}>{w.title}</span>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 8}}>
        {w.domains.map((d, i) => <Chip key={d} label={d} on={on(i)} />)}
      </div>
      <div style={{marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{fontFamily: F.sans, fontSize: 30, color: C.inkSoft}}>
          <Roll a={w.countBefore} b={w.countAfter} k={count} />
        </span>
        <span style={{fontFamily: F.sans, fontWeight: 600, fontSize: 34, color: C.onPetrol, background: C.petrol, borderRadius: 999, padding: '24px 48px', transform: `scale(${1 - 0.06 * press})`}}>{w.cta}</span>
      </div>
    </div>
  );
};

const SpinnerContent: React.FC<{t: number}> = ({t}) => {
  const spin = (t - TL.spinner) * 420;
  const arc = 1 - prog(t, TL.check - 0.15, TL.check + 0.1, EASE.exit);
  const check = prog(t, TL.check, TL.check + 0.4, EASE.enter);
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="40" fill="none" stroke={C.onPetrol} strokeWidth={8} strokeLinecap="round" strokeDasharray="70 300" transform={`rotate(${spin} 60 60)`} opacity={arc} />
      <path d="M36 62 L53 78 L85 44" fill="none" stroke={C.onPetrol} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={80} strokeDashoffset={80 * (1 - check)} />
    </svg>
  );
};

const PriorityPill: React.FC<{p: Priority}> = ({p}) => {
  const strong = p === 'immediate';
  return (
    <span style={{...TYPE.label, fontSize: 22, letterSpacing: '0.12em', padding: '12px 18px', borderRadius: 999, whiteSpace: 'nowrap',
      color: strong ? C.onPetrol : C.petrol, background: strong ? C.petrol : C.paper, border: `2px solid ${strong ? C.petrol : 'rgba(0,77,64,0.2)'}`}}>
      {PRIORITY_LABEL.de[p]}
    </span>
  );
};

const RiskContent: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const r = D.risk;
  return (
    <div style={{position: 'absolute', inset: 0, padding: 52, display: 'flex', flexDirection: 'column', gap: 20}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
        <span style={{...TYPE.label, fontSize: 24, color: C.inkMuted, letterSpacing: '0.14em'}}>{r.label}</span>
        <span style={{...TYPE.label, fontSize: 20, color: C.goldOnLight, border: `1.5px solid ${C.gold}`, borderRadius: 999, padding: '8px 14px'}}>{r.example}</span>
      </div>
      {r.rows.map((row, i) => {
        const k = clamp01(sp(frame, fps, TL.rows[i], SPRING.settle));
        return (
          <div key={row.text} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, minHeight: 124, padding: '16px 28px', borderRadius: 24, background: C.mist, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>
            <span style={{fontFamily: F.sans, fontWeight: 500, fontSize: 35, lineHeight: 1.2, color: C.ink}}>{row.text}</span>
            <PriorityPill p={row.p} />
          </div>
        );
      })}
    </div>
  );
};

const MatchContent: React.FC<{t: number; frame: number; fps: number}> = ({t, frame, fps}) => (
  <div style={{position: 'absolute', inset: 0, padding: 52, display: 'flex', flexDirection: 'column', gap: 24}}>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <span style={{fontFamily: F.sans, fontWeight: 600, fontSize: 42, color: C.onPetrol}}>2 Fachleute passen</span>
      <span style={{...TYPE.label, fontSize: 20, color: C.goldOnPetrol, border: `1.5px solid ${C.goldOnPetrol}`, borderRadius: 999, padding: '8px 14px'}}>{D.risk.example}</span>
    </div>
    {D.providers.map((p, i) => {
      const k = clamp01(sp(frame, fps, TL.cards[i], SPRING.settle));
      const pct = Math.round(p.match * prog(t, TL.cards[i], TL.cards[i] + 0.9, EASE.enter));
      return (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '26px 30px', borderRadius: 28, background: 'rgba(255,255,255,0.07)', border: `1.5px solid ${C.lineOnPetrol}`, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>
          <span style={{width: 76, height: 76, borderRadius: 38, flex: 'none', border: `3px solid ${C.goldOnPetrol}`, display: 'grid', placeItems: 'center', fontFamily: F.sans, fontWeight: 600, fontSize: 30, color: C.goldOnPetrol}}>{String.fromCharCode(65 + i)}</span>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, flex: 1}}>
            <span style={{fontFamily: F.sans, fontWeight: 500, fontSize: 32, color: C.onPetrol}}>Anbieter {String.fromCharCode(65 + i)}</span>
            <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
              {p.fits.map((f) => (
                <span key={f} style={{fontFamily: F.sans, fontSize: 24, color: C.onPetrol, background: 'rgba(4,122,82,0.55)', borderRadius: 999, padding: '8px 16px'}}>✓ {f}</span>
              ))}
            </div>
          </div>
          <span style={{fontFamily: F.mono, fontWeight: 500, fontSize: 40, color: C.goldOnPetrol, fontVariantNumeric: 'tabular-nums'}}>{pct} %</span>
        </div>
      );
    })}
    <span style={{marginTop: 'auto', fontFamily: F.sans, fontSize: 26, color: C.onPetrolSoft}}>{D.reveal}</span>
  </div>
);

// ─── Cursor ──────────────────────────────────────────────────────────────────
// Wegpunkte relativ zum Anker der Form (Mitte des Wizards).
const CURSOR: [number, number, number][] = [
  [1.6, 640, 650],
  [2.65, 60, -10],
  [4.25, 220, -47],
  [5.05, -210, 89],
  [6.1, 305, 300],
  [6.9, 660, 450],
];
const cursorAt = (t: number, ax: number, ay: number) => {
  let [x, y] = [ax + CURSOR[0][1], ay + CURSOR[0][2]];
  for (let i = 1; i < CURSOR.length; i++) {
    const [t1, x1, y1] = CURSOR[i];
    const k = prog(t, CURSOR[i - 1][0], t1, EASE.move);
    x = lerp(x, ax + x1, k);
    y = lerp(y, ay + y1, k);
  }
  return {x, y};
};
const Cursor: React.FC<{t: number; ax: number; ay: number}> = ({t, ax, ay}) => {
  const {x, y} = cursorAt(t, ax, ay);
  const clicks = [TL.click, ...TL.picks, TL.next];
  const press = Math.max(...clicks.map((c) => prog(t, c - 0.08, c, EASE.enter) * (1 - prog(t, c, c + 0.2, EASE.move))));
  const vis = prog(t, 1.6, 2.0, EASE.enter) * (1 - prog(t, 6.6, 7.0, EASE.exit));
  return (
    <svg width="60" height="60" viewBox="0 0 24 24" style={{position: 'absolute', left: x, top: y, opacity: vis, transform: `scale(${1 - 0.15 * press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 6px 10px rgba(0,35,29,0.3))'}}>
      <path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.3 L17.5 13 Z" fill={C.ink} stroke="#ffffff" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
};

// ─── Globus ──────────────────────────────────────────────────────────────────
// Märkte aus der Risk Map (DE → UK + NL), Hauptstädte als Näherung.
const MARKETS: GlobeMarket[] = [
  {code: 'DE', lon: 13.4, lat: 52.5, at: TL.markets[0]},
  {code: 'UK', lon: -0.1, lat: 51.5, at: TL.markets[1]},
  {code: 'NL', lon: 4.9, lat: 52.4, at: TL.markets[2]},
];
const GlobeContent: React.FC<{t: number; size: number}> = ({t, size}) => {
  // Start in der Ruhelage der Bildmarke (30° West, Atlantik), dann nach Europa.
  const k = prog(t, TL.turn[0], TL.turn[1], EASE.move);
  // Danach näher heran: DE, UK und NL liegen sonst als ein Klumpen beieinander.
  const z = prog(t, TL.turn[1] - 1.2, TL.turn[1] + 0.6, EASE.move);
  const drift = Math.max(0, t - TL.turn[1]) * 0.6;
  return <DotGlobe size={size} t={t} lon0={lerp(-30, 6, k) + drift} lat0={lerp(12, 50, k)} zoom={lerp(1, 2.6, z)} markets={MARKETS} />;
};

// ─── Komposition ─────────────────────────────────────────────────────────────
export const ProductProbe: React.FC<{format: ProbeFormat}> = ({format}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const L = LAYOUT[format];
  const s = shapeAt(t, L.globe);
  const left = L.cx - s.w / 2;
  const cy = L.cy + s.dy;
  const top = cy - s.h / 2;
  const pulse = TL.dot <= t && t < TL.globe ? ((t - TL.dot) % 0.9) / 0.9 : 0;
  const dotLabel = win(t, TL.dot + 0.25, TL.globe + 0.1);
  const marketsK = win(t, TL.markets[2] + 0.3, TL.risk + 0.1);
  const claimK = prog(t, TL.cta, TL.cta + 0.6, EASE.enter);
  const inner = (w: number, h: number): React.CSSProperties => ({position: 'absolute', width: w, height: h, left: (s.w - w) / 2, top: (s.h - h) / 2});
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 55% at ${(L.cx / (format === 'reel' ? 1080 : 1920)) * 100}% ${(L.cy / (format === 'reel' ? 1920 : 1080)) * 100}%, #ffffff 0%, ${C.stage} 60%, #e6ecea 100%)`}}>
      <Headline head={L.head} text="Viele Regeln. Nicht alle gelten für Sie." inAt={TL.h1.in} outAt={TL.h1.out} />
      <Headline head={L.head} text="Wir fragen nur, was zählt." inAt={TL.h2.in} outAt={TL.h2.out} />
      <Headline head={L.head} text="Sehen, was wirklich gilt." inAt={TL.h3.in} outAt={TL.h3.out} />
      <Headline head={L.head} text="Und die Fachleute, die passen." inAt={TL.h4.in} outAt={TL.h4.out} />

      {/* Puls um den Gold-Punkt */}
      {pulse > 0 ? (
        <div style={{position: 'absolute', left: L.cx - 36 - pulse * 60, top: L.cy - 36 - pulse * 60, width: 72 + pulse * 120, height: 72 + pulse * 120, borderRadius: '50%', border: `2px solid ${C.gold}`, opacity: (1 - pulse) * 0.6}} />
      ) : null}

      <div
        style={{
          position: 'absolute', left, top, width: s.w, height: s.h, borderRadius: s.r, background: s.bg, overflow: 'hidden',
          display: 'grid', gridTemplateColumns: '100%', gridTemplateRows: '100%', placeItems: 'center',
          boxShadow: `0 ${40 * s.shadow}px ${90 * s.shadow}px -${36 * s.shadow}px rgba(0,35,29,${0.45 * s.shadow}), 0 0 0 1.5px rgba(0,77,64,${0.06 * s.shadow})`,
        }}
      >
        <div style={{gridArea: '1 / 1', opacity: win(t, -1, TL.button + 0.2) + win(t, TL.end + 0.5, 99)}}><PillContent /></div>
        <div style={{gridArea: '1 / 1', opacity: win(t, TL.button + 0.25, TL.wizard + 0.15), fontFamily: F.sans, fontWeight: 600, fontSize: 46, color: C.onPetrol}}>Bedarf prüfen</div>
        <div style={{...inner(S.wizard.w, S.wizard.h), opacity: win(t, TL.wizard + 0.5, TL.spinner + 0.15)}}><WizardContent t={t} /></div>
        <div style={{gridArea: '1 / 1', opacity: win(t, TL.spinner + 0.35, TL.dot + 0.15, 0.2)}}><SpinnerContent t={t} /></div>
        <div style={{...inner(L.globe, L.globe), opacity: win(t, TL.globe + 0.2, TL.risk + 0.25, 0.6)}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #f3f6f5 45%, #dfe7e4 100%)'}} />
          <div style={{position: 'absolute', inset: 0}}><GlobeContent t={t} size={L.globe} /></div>
        </div>
        <div style={{...inner(S.risk.w, S.risk.h), opacity: win(t, TL.risk + 0.55, TL.match + 0.2)}}><RiskContent frame={frame} fps={fps} /></div>
        <div style={{...inner(S.match.w, S.match.h), opacity: win(t, TL.match + 0.55, TL.end + 0.2)}}><MatchContent t={t} frame={frame} fps={fps} /></div>
      </div>

      <div style={{position: 'absolute', top: L.cy + 80, left: L.cx - 400, width: 800, textAlign: 'center', opacity: dotLabel, fontFamily: F.sans, fontWeight: 500, fontSize: 40, color: C.inkSoft}}>
        Ihre Risk Map ist fertig.
      </div>
      {/* Markt-Pill unter dem Globus, wie der Zähler bei MakerMap */}
      <div style={{position: 'absolute', top: L.cy - 20 + L.globe / 2 - 34, left: L.cx - 300, width: 600, display: 'flex', justifyContent: 'center', opacity: marketsK, transform: `translateY(${(1 - marketsK) * 12}px)`}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 14, background: C.petrolDeep, color: C.onPetrol, borderRadius: 999, padding: '18px 30px', fontFamily: F.sans, fontWeight: 600, fontSize: 30, boxShadow: '0 16px 30px -16px rgba(0,35,29,0.6)'}}>
          <span style={{width: 14, height: 14, borderRadius: 7, background: C.gold}} />
          3 Märkte · DE → UK + NL
        </span>
      </div>

      {/* Ende: Claim im Satzblock, CTA unter der Pill */}
      <div style={{position: 'absolute', top: L.head.top, left: L.head.left, width: L.head.width, textAlign: format === 'reel' ? 'center' : 'left'}}>
        <KineticLine text={CLAIM_LINE} inAt={TL.claim} profile="calm" style={{...TYPE.display, fontSize: L.claim, color: C.petrol, whiteSpace: 'nowrap'}} />
      </div>
      <div style={{position: 'absolute', top: L.cy + PILL_DY + L.cta, left: L.cx - 300, width: 600, textAlign: 'center', opacity: claimK, transform: `translateY(${(1 - claimK) * 14}px)`, ...TYPE.label, fontSize: 30, color: C.inkMuted}}>
        Link in der Bio
      </div>

      <Cursor t={t} ax={L.cx} ay={L.cy} />
      <Grain frame={frame} opacity={0.02} />
    </AbsoluteFill>
  );
};
