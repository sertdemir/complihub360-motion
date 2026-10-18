import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, clamp01, EASE, F, lerp, prog, sp, SPRING, TYPE} from '../../src/brand/brand';
import {EndCardClaim} from '../../src/c360/EndCardClaim';
import {Logo} from '../../src/c360/Logo';
import {Stage} from '../../src/c360/Stage';
import {KineticLine, SafeArea, SafeZones} from '../../src/c360/Text';
import {Grain} from '../../src/components/primitives';
import {Priority, PRIORITY_LABEL} from '../reel-01/copy';
import {COPY} from './copy';
import TL from './timeline.json';

// ─── Tap-Proof · Stufe 0 des Video-Lab-Tests ─────────────────────────────────
// 9:16 · 22 s · Profil calm (Risk Map). Frage des Tests: Liest sich die
// Tap-Sprache auf dem Handy, ohne Person im Bild und ohne generierte Bilder?
// Bühne, Licht und Staub sind Code (`Stage`), die Karten Compass-Optik.
//
// Signature Move "Tap-to-Reveal": ein Berührungspunkt nähert sich (unscharf →
// scharf), ein Ring pulst einmal, die Karte entfaltet sich aus genau diesem
// Punkt. Was weiterführt, entsteht aus dem, was schon da ist: Die Quelle
// wächst aus der EPR-Zeile, am Ende lösen sich alle Karten ins Licht auf.
//
// Raster (1080×1920): Bildmarke oben, Zeile darunter, Karten in der Kartenzone.

const X0 = 60;
const W = 900;
const MARK_H = 140;
const LINE_TOP = 450;
const CARD_TOP = 780;
const HOOK_LEAD = 1.1;

// Tipp-Punkte (absolut im Bild)
const TAP = {
  plan: {x: 820, y: 830},
  map: {x: 230, y: 900},
  source: {x: 760, y: 990},
};
const PLAN_H = 330;
const ROW_H = 112;
const SOURCE_TOP = 1060;

/** 0→1 rein, 1→0 raus. */
const win = (t: number, a: number, b: number, inDur = 0.5, outDur = 0.4) =>
  prog(t, a, a + inDur, EASE.enter) * (1 - prog(t, b, b + outDur, EASE.exit));

// ─── Berührung · Punkt nähert sich, Ring pulst einmal ────────────────────────
const Touch: React.FC<{t: number; x: number; y: number; touch: number; ring: number}> = ({t, x, y, touch, ring}) => {
  const near = prog(t, touch, ring, EASE.enter);
  const lift = prog(t, ring + 0.15, ring + 0.6, EASE.exit);
  const pulse = clamp01((t - ring) / 1.2);
  if (t < touch || t > ring + 1.3) return null;
  const dot = near * (1 - lift);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <defs>
        <filter id={`touch-${touch}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={lerp(14, 1.5, near)} />
        </filter>
      </defs>
      <circle
        cx={x}
        cy={y}
        r={lerp(34, 20, near)}
        fill={`rgba(${C.coneRgb},${0.85 * dot})`}
        filter={`url(#touch-${touch})`}
      />
      {pulse > 0 && pulse < 1 ? (
        <circle
          cx={x}
          cy={y}
          r={lerp(22, 120, EASE.enter(pulse))}
          fill="none"
          stroke={`rgba(${C.coneRgb},${0.75 * (1 - pulse)})`}
          strokeWidth={lerp(4, 1.5, pulse)}
        />
      ) : null}
    </svg>
  );
};

// ─── Karten ──────────────────────────────────────────────────────────────────
const glassCard: React.CSSProperties = {
  position: 'absolute',
  left: X0,
  width: W,
  padding: 48,
  borderRadius: 36,
  background: C.glass,
  border: `1.5px solid ${C.glassLine}`,
  boxShadow: '0 50px 90px -40px rgba(0,0,0,0.75)',
  boxSizing: 'border-box',
};

/** Entfaltung aus dem Tipp-Punkt: Ursprung liegt dort, wo getippt wurde. */
const unfold = (k: number, origin: {x: number; y: number}, top: number, left = X0): React.CSSProperties => ({
  transformOrigin: `${origin.x - left}px ${origin.y - top}px`,
  transform: `scale(${lerp(0.04, 1, k)})`,
  opacity: clamp01(k * 1.6),
  filter: k < 0.98 ? `blur(${((1 - k) * 10).toFixed(1)}px)` : undefined,
});

const Label: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.inkMuted}) => (
  <span style={{...TYPE.label, fontSize: 24, letterSpacing: '0.16em', color}}>{children}</span>
);

const PriorityPill: React.FC<{p: Priority}> = ({p}) => {
  const strong = p === 'immediate';
  return (
    <span
      style={{
        ...TYPE.label,
        fontSize: 24,
        letterSpacing: '0.12em',
        padding: '14px 20px',
        borderRadius: 999,
        color: strong ? C.onPetrol : C.petrol,
        background: strong ? C.petrol : C.paper,
        border: `2px solid ${strong ? C.petrol : 'rgba(0,77,64,0.2)'}`,
        whiteSpace: 'nowrap',
      }}
    >
      {PRIORITY_LABEL.de[p]}
    </span>
  );
};

const PlanCard: React.FC<{k: number; recede: number}> = ({k, recede}) => {
  const v = COPY.vorhaben;
  return (
    <div
      style={{
        ...glassCard,
        top: CARD_TOP,
        height: PLAN_H,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...unfold(k, TAP.plan, CARD_TOP),
        ...(recede > 0
          ? {
              transformOrigin: '50% 0%',
              transform: `translateY(${-60 * recede}px) scale(${lerp(1, 0.82, recede)})`,
              opacity: 1 - recede,
              filter: `blur(${(8 * recede).toFixed(1)}px)`,
            }
          : null),
      }}
    >
      <Label>{v.label}</Label>
      <div style={{...TYPE.title, fontSize: 60, color: C.ink}}>{v.route}</div>
      <div style={{display: 'flex', gap: 16}}>
        {v.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: F.sans,
              fontWeight: 600,
              fontSize: 34,
              color: C.petrol,
              background: C.mist,
              borderRadius: 999,
              padding: '14px 30px',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const RiskCard: React.FC<{frame: number; fps: number; k: number; focus: number; out: number}> = ({frame, fps, k, focus, out}) => {
  const r = COPY.risk;
  return (
    <div
      style={{
        ...glassCard,
        top: CARD_TOP,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        ...unfold(k, TAP.map, CARD_TOP),
        ...(out > 0 ? {opacity: 1 - out} : null),
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
        <Label>{r.label}</Label>
        <span style={{...TYPE.label, fontSize: 20, color: C.goldOnLight, border: `1.5px solid ${C.gold}`, borderRadius: 999, padding: '8px 14px'}}>
          {r.example}
        </span>
      </div>
      {r.rows.map((row, i) => {
        const rk = clamp01(sp(frame, fps, TL.s3.rows[i], SPRING.settle));
        // Fokus auf die EPR-Zeile: die anderen treten zurück, bleiben aber da.
        const dim = i === 0 ? 1 : lerp(1, 0.32, focus);
        return (
          <div
            key={row.text}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              minHeight: ROW_H,
              padding: '18px 28px',
              borderRadius: 24,
              background: C.mist,
              boxSizing: 'border-box',
              opacity: rk * dim,
              transform: `translateY(${(1 - rk) * 28}px)`,
              boxShadow: i === 0 ? `inset 0 0 0 ${2 * focus}px ${C.gold}` : undefined,
            }}
          >
            <span style={{fontFamily: F.sans, fontWeight: 500, fontSize: 37, lineHeight: 1.2, color: C.ink}}>{row.text}</span>
            <PriorityPill p={row.p} />
          </div>
        );
      })}
    </div>
  );
};

const SourceCard: React.FC<{t: number; k: number; out: number}> = ({t, k, out}) => {
  const q = COPY.quelle;
  // Mono tippt sich ein: ~0,035 s je Zeichen, Zeile für Zeile.
  const chars = Math.max(0, Math.floor((t - TL.s4.type) / 0.035));
  let left = chars;
  const typed = q.lines.map((line) => {
    const n = Math.min(line.length, Math.max(0, left));
    left -= line.length + 6; // kurze Pause am Zeilenende
    return line.slice(0, n);
  });
  const done = left > 0;
  const caretLine = typed.findIndex((s, i) => s.length < q.lines[i].length);
  const caretOn = Math.floor(t * 2.4) % 2 === 0;
  return (
    <div
      style={{
        ...glassCard,
        left: X0 + 60,
        width: W - 60,
        top: SOURCE_TOP,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        border: `2px solid ${C.gold}`,
        ...unfold(k, TAP.source, SOURCE_TOP, X0 + 60),
        ...(out > 0 ? {opacity: 1 - out} : null),
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Label color={C.goldOnLight}>{q.label}</Label>
        <span style={{...TYPE.label, fontSize: 20, letterSpacing: '0.12em', color: C.inkMuted, opacity: done ? 1 : 0}}>{q.stamp}</span>
      </div>
      {typed.map((s, i) => (
        <div
          key={i}
          style={{
            fontFamily: i === 1 ? F.display : F.mono,
            fontWeight: 500,
            fontSize: i === 1 ? 64 : 34,
            lineHeight: 1.2,
            color: i === 2 ? C.inkSoft : C.ink,
            minHeight: i === 1 ? 77 : 41,
          }}
        >
          {s}
          {i === caretLine && caretOn ? <span style={{color: C.gold}}>▍</span> : null}
        </div>
      ))}
    </div>
  );
};

/** Goldene Haarlinie von der EPR-Zeile zur Quelle (Orchestrator Line). */
const SourceLink: React.FC<{draw: number}> = ({draw}) => {
  const x = TAP.source.x;
  const y0 = TAP.source.y + 30;
  const y1 = SOURCE_TOP;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <line x1={x} y1={y0} x2={x} y2={lerp(y0, y1, draw)} stroke={C.gold} strokeWidth={2} opacity={draw > 0 ? 1 : 0} />
    </svg>
  );
};

const Line: React.FC<{text: string; inAt: number; outAt: number}> = ({text, inAt, outAt}) => (
  <div style={{position: 'absolute', top: LINE_TOP, left: X0, width: W}}>
    <KineticLine
      text={text}
      inAt={inAt}
      outAt={outAt}
      profile="calm"
      accent={C.goldOnPetrol}
      style={{...TYPE.display, fontSize: 84, color: C.onPetrol}}
    />
  </div>
);

export const TapProof: React.FC<{showSafe?: boolean}> = ({showSafe = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {s1, s2, s3, s4, s5, end} = TL;

  const planK = clamp01(sp(frame, fps, s2.card, SPRING.panel));
  const planRecede = prog(t, s3.touch, s3.card + 0.5, EASE.move);
  const mapK = clamp01(sp(frame, fps, s3.card, SPRING.panel));
  const focus = prog(t, s4.touch, s4.card + 0.4, EASE.move);
  const srcK = clamp01(sp(frame, fps, s4.card, SPRING.panel));
  const link = prog(t, s4.card, s4.card + 0.5, EASE.enter);
  // Auflösen ins Licht: Karten steigen leicht, werden hell und verschwinden.
  const dissolve = prog(t, s5.dissolve, s5.dissolve + 0.9, EASE.move);

  // Licht folgt der Geschichte: Ruhe im Hook, Klarheit wächst bis zur Quelle,
  // beim Auflösen nimmt der Kegel die Karten auf.
  const glow =
    0.3 +
    0.15 * prog(t, s2.card, s2.card + 0.8, EASE.move) +
    0.2 * prog(t, s3.rows[0], s3.rows[2] + 0.6, EASE.move) +
    0.2 * prog(t, s4.card, s4.type + 1, EASE.move) +
    0.25 * dissolve -
    0.3 * prog(t, s5.out, end.iris, EASE.move);

  // Bühne driftet minimal (Push-in), Text bleibt flach im Vordergrund.
  const push = 1 + 0.035 * prog(t, 0, end.iris, (x) => x);

  return (
    <AbsoluteFill style={{background: C.stageDeep}}>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <Stage t={t} glow={glow} />
      </AbsoluteFill>

      {/* Bildmarke ab Frame 0 bis zum Schluss */}
      <SafeArea format="reel" style={{alignItems: 'center'}}>
        <div style={{marginTop: 24, opacity: 1 - prog(t, s5.out - 0.3, s5.out, EASE.exit)}}>
          <Logo lockup="symbol" tone="on-petrol" height={MARK_H} />
        </div>
      </SafeArea>

      {/* s1 · Hook: steht ab Frame 0 (Thumbnail) */}
      <SafeArea format="reel" style={{justifyContent: 'center', padding: '80px 20px 0'}}>
        <KineticLine
          text={COPY.hook}
          inAt={s1.hook - HOOK_LEAD}
          outAt={s1.out}
          profile="calm"
          accent={C.goldOnPetrol}
          style={{...TYPE.hero, fontSize: 108, color: C.onPetrol}}
        />
      </SafeArea>

      {/* Karten */}
      <AbsoluteFill
        style={{
          transform: `translateY(${-90 * dissolve}px)`,
          filter: dissolve > 0 ? `blur(${(14 * dissolve).toFixed(1)}px) brightness(${1 + 0.8 * dissolve})` : undefined,
          opacity: 1 - prog(t, s5.dissolve + 0.2, s5.dissolve + 0.9, EASE.exit),
        }}
      >
        {t >= s2.card && planRecede < 1 ? <PlanCard k={planK} recede={planRecede} /> : null}
        {t >= s3.card ? <RiskCard frame={frame} fps={fps} k={mapK} focus={focus} out={0} /> : null}
        {t >= s4.card ? <SourceLink draw={link} /> : null}
        {t >= s4.card ? <SourceCard t={t} k={srcK} out={0} /> : null}
      </AbsoluteFill>

      <Touch t={t} {...TAP.plan} touch={s2.touch} ring={s2.ring} />
      <Touch t={t} {...TAP.map} touch={s3.touch} ring={s3.ring} />
      <Touch t={t} {...TAP.source} touch={s4.touch} ring={s4.ring} />

      {/* Zeilen bleiben flach im Vordergrund */}
      <Line text={COPY.plan} inAt={s2.line} outAt={s2.out} />
      <Line text={COPY.applies} inAt={s3.line} outAt={s3.out} />
      <Line text={COPY.source} inAt={s4.line} outAt={s4.out} />
      <div style={{position: 'absolute', top: 860, left: X0, width: W, opacity: win(t, s5.line, s5.out, 0.01, 0.01)}}>
        <KineticLine
          text={COPY.close}
          inAt={s5.line}
          outAt={s5.out}
          profile="calm"
          accent={C.goldOnPetrol}
          style={{...TYPE.display, fontSize: 92, color: C.onPetrol}}
        />
      </div>

      {/* Iris aus dem Ursprung des Lichts */}
      <EndCardClaim start={end.iris} origin={{x: 50, y: 8}} cta={COPY.cta} />

      <Grain frame={frame} opacity={0.05} />
      {showSafe ? <SafeZones format="reel" /> : null}
    </AbsoluteFill>
  );
};

export const tapProofDuration = TL.duration;
export const tapProofFps = TL.fps;
