import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, clamp01, EASE, F, lerp, prog, sp, SPRING, TYPE} from '../../src/brand/brand';
import {Backdrop} from '../../src/c360/Backdrop';
import {EndCardClaim} from '../../src/c360/EndCardClaim';
import {Logo} from '../../src/c360/Logo';
import {KineticLine, SafeArea, SafeZones} from '../../src/c360/Text';
import {Grain} from '../../src/components/primitives';
import {COPY, Lang, Priority, PRIORITY_LABEL} from './copy';
import TL from './timeline.json';

// ─── Reel 01 · "Vom offenen Vorhaben zur klaren Risk Map" ───────────────────
// 9:16 · 25 s · Profil lift, Szene 4 (Risk Map) calm. Storyboard abgenommen
// 2026-10-11 (Kern A, Szenen 1–6 A), Runde 2: Tiefe "Raum", Klang "Atem",
// Endcard "Gestapelt" mit CTA, Bildmarke 160 px. Fassungen DE und EN.
//
// Raum: Regel-Chips, Wizard, Risk Map und Fachleute liegen als Ebenen
// hintereinander. Die Kamera fährt Szene für Szene durch sie hindurch; was
// hinter dem Fokus liegt, ist unscharf zu ahnen, was passiert ist, fliegt am
// Betrachter vorbei. Die Textzeilen bleiben flach im Vordergrund — gelesen
// wird nie im Raum.
//
// Raster (1080×1920): Bildmarke oben, Text darunter, Objekte in der Kartenzone.

const X0 = 60;
const W = 900;
const MARK_H = 160;
const LINE_TOP = 480;
const CARD_TOP = 800;
const CARD_H = 740;
const CENTER = {x: X0 + W / 2, y: CARD_TOP + CARD_H / 2};
const HOOK_LEAD = 1.1;

// Kamera
const DEPTH = 1100; // Abstand der Ebenen in px
const PERSPECTIVE = 1700;
const AHEAD = 1.15; // wie weit voraus eine Ebene sichtbar ist (in Ebenen)

/** 0→1 rein, 1→0 raus — für Elemente mit Ein- und Ausstieg. */
const win = (t: number, a: number, b: number, inDur = 0.5, outDur = 0.35) =>
  prog(t, a, a + inDur, EASE.enter) * (1 - prog(t, b, b + outDur, EASE.exit));

const Line: React.FC<{text: string; inAt: number; outAt: number; calm?: boolean}> = ({text, inAt, outAt, calm}) => (
  <div style={{position: 'absolute', top: LINE_TOP, left: X0, width: W}}>
    <KineticLine
      text={text}
      inAt={inAt}
      outAt={outAt}
      profile={calm ? 'calm' : 'lift'}
      style={{...TYPE.display, fontSize: 88, color: C.petrol}}
    />
  </div>
);

const Pill: React.FC<{children: React.ReactNode; on?: number; style?: React.CSSProperties}> = ({
  children,
  on = 0,
  style,
}) => (
  <span
    style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      padding: '20px 34px',
      borderRadius: 999,
      fontFamily: F.sans,
      fontWeight: 600,
      fontSize: 36,
      color: on > 0.5 ? C.onPetrol : C.petrol,
      background: on > 0 ? `rgba(0,77,64,${on})` : 'rgba(255,255,255,0.75)',
      border: `2px solid ${on > 0 ? C.petrol : 'rgba(0,77,64,0.24)'}`,
      transform: `scale(${1 + 0.06 * Math.sin(Math.PI * clamp01(on))})`,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);


// ─── Szene 2 · Regel-Chips (Ebene 0) ─────────────────────────────────────────
// Koordinaten relativ zur Ebene (Kartenzone, W × CARD_H).
const CHIP_FROM = [
  {x: 110, y: 80, a: 0.0},
  {x: 660, y: 40, a: 1.3},
  {x: 270, y: 280, a: 2.1},
  {x: 740, y: 400, a: 3.4},
  {x: 150, y: 540, a: 4.2},
  {x: 540, y: 610, a: 5.0},
];
const chipGrid = (i: number) => ({x: 150 + (i % 3) * 300, y: 260 + Math.floor(i / 3) * 190});

const RuleChips: React.FC<{lang: Lang; t: number; frame: number; fps: number}> = ({lang, t, frame, fps}) => {
  const {s2} = TL;
  const show = prog(t, s2.chips, s2.chips + 0.5, EASE.enter);
  const snap = Math.min(1, sp(frame, fps, s2.snap, SPRING.panel));
  const fade = prog(t, s2.fade, s2.fade + 0.6, EASE.move);
  return (
    <>
      {COPY[lang].chips.map((c, i) => {
        const f = CHIP_FROM[i];
        const g = chipGrid(i);
        const x = lerp(f.x + 26 * Math.sin(t * 0.9 + f.a), g.x, snap);
        const y = lerp(f.y + 18 * Math.cos(t * 0.7 + f.a), g.y, snap);
        const dim = c.applies ? 1 : lerp(1, 0.16, fade);
        return (
          <div
            key={c.label}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%,-50%) scale(${lerp(0.9, 1, show)}) rotate(${(1 - snap) * (i % 2 ? 4 : -4)}deg)`,
              opacity: show * dim,
            }}
          >
            <Pill on={c.applies ? 0.12 * fade : 0} style={{fontSize: 44, padding: '26px 44px', boxShadow: '0 16px 32px -22px rgba(0,35,29,0.55)'}}>
              {c.label}
            </Pill>
          </div>
        );
      })}
    </>
  );
};

// ─── Szene 3 · Wizard (Ebene 1) und Szene 4 · Risk Map (Ebene 2) ─────────────
const Wizard: React.FC<{lang: Lang; t: number; frame: number; fps: number}> = ({lang, t, frame, fps}) => {
  const w = COPY[lang].wizard;
  const {s3} = TL;
  const picked = (i: number) => {
    const k = w.picks.indexOf(i as 1 | 2);
    return k < 0 ? 0 : clamp01(sp(frame, fps, s3.picks[k], SPRING.pop));
  };
  const allPicked = t >= s3.picks[s3.picks.length - 1];
  const press = prog(t, s3.press, s3.press + 0.12, EASE.enter) * (1 - prog(t, s3.press + 0.12, s3.press + 0.4, EASE.move));
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 28, height: '100%'}}>
      <span style={{...TYPE.label, color: C.inkMuted}}>{w.step}</span>
      <div style={{...TYPE.title, fontSize: 60, color: C.ink}}>{w.title}</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 18}}>
        {w.domains.map((d, i) => (
          <Pill key={d} on={picked(i)}>
            {d}
          </Pill>
        ))}
      </div>
      <div style={{flex: 1}} />
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{fontFamily: F.sans, fontSize: 30, color: C.inkMuted, fontVariantNumeric: 'tabular-nums'}}>
          {allPicked ? w.countAfter : w.countBefore}
        </span>
        <span
          style={{
            fontFamily: F.sans,
            fontWeight: 600,
            fontSize: 34,
            color: C.onPetrol,
            background: C.petrol,
            borderRadius: 999,
            padding: '22px 44px',
            transform: `scale(${1 - 0.05 * press})`,
            opacity: allPicked ? 1 : 0.45,
          }}
        >
          {w.cta}
        </span>
      </div>
    </div>
  );
};

const PriorityPill: React.FC<{p: Priority; lang: Lang}> = ({p, lang}) => {
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
      {PRIORITY_LABEL[lang][p]}
    </span>
  );
};

const RiskMap: React.FC<{lang: Lang; frame: number; fps: number}> = ({lang, frame, fps}) => {
  const r = COPY[lang].risk;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
        <span style={{...TYPE.label, fontSize: 26, color: C.inkMuted, letterSpacing: '0.14em'}}>{r.label}</span>
        <span style={{...TYPE.label, fontSize: 20, color: C.goldOnLight, border: `1.5px solid ${C.gold}`, borderRadius: 999, padding: '8px 14px'}}>
          {r.example}
        </span>
      </div>
      {r.rows.map((row, i) => {
        const k = clamp01(sp(frame, fps, TL.s4.rows[i], SPRING.settle));
        return (
          <div
            key={row.text}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              minHeight: 112,
              padding: '18px 28px',
              borderRadius: 24,
              background: C.mist,
              opacity: k,
              transform: `translateY(${(1 - k) * 28}px)`,
            }}
          >
            <span style={{fontFamily: F.sans, fontWeight: 500, fontSize: 37, lineHeight: 1.2, color: C.ink}}>{row.text}</span>
            <PriorityPill p={row.p} lang={lang} />
          </div>
        );
      })}
    </div>
  );
};


const cardStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  padding: 52,
  borderRadius: 40,
  background: 'rgba(255,255,255,0.9)',
  border: `1.5px solid ${C.line}`,
  boxShadow: '0 40px 80px -40px rgba(0,35,29,0.5)',
};

// ─── Szene 5 · Fachleute, anonym (Ebene 3) ───────────────────────────────────
const Providers: React.FC<{lang: Lang; t: number; frame: number; fps: number}> = ({lang, t, frame, fps}) => {
  const {s5, end} = TL;
  const c = COPY[lang];
  const merge = prog(t, s5.merge, end.iris, EASE.move);
  const gone = prog(t, s5.merge + 0.15, end.iris - 0.05, EASE.exit);
  const CARD = 260;
  const GAP = 36;
  const top = 60;
  return (
    <>
      {c.providers.map((p, i) => {
        const k = clamp01(sp(frame, fps, s5.cards[i], SPRING.pop));
        if (gone >= 1) return null;
        const y = top + i * (CARD + GAP);
        const toCenter = CARD_H / 2 - (y + CARD / 2);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: y,
              width: W,
              height: CARD,
              padding: '36px 44px',
              borderRadius: 32,
              background: 'rgba(255,255,255,0.9)',
              border: `1.5px solid ${C.line}`,
              boxShadow: '0 30px 60px -36px rgba(0,35,29,0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: lerp(0.5, 1, k) * (1 - gone),
              transform: `translateY(${(1 - k) * 60 + toCenter * merge}px) scale(${lerp(1, 0.2, merge)})`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              {/* Name bewusst unlesbar: Passung vor Marke. */}
              <span style={{width: 340, height: 38, borderRadius: 12, background: 'rgba(15,23,42,0.14)', filter: 'blur(5px)'}} />
              <span
                style={{
                  fontFamily: F.mono,
                  fontWeight: 500,
                  fontSize: 30,
                  fontVariantNumeric: 'tabular-nums',
                  color: i === 0 ? C.onPetrol : C.petrol,
                  background: i === 0 ? C.petrol : C.mist,
                  borderRadius: 999,
                  padding: '12px 22px',
                }}
              >
                {p.match} %
              </span>
            </div>
            <div style={{fontFamily: F.sans, fontSize: 36, lineHeight: 1.35, display: 'flex', flexWrap: 'wrap', gap: '6px 22px'}}>
              {p.fits.map((f) => (
                <span key={f} style={{color: C.fit, fontWeight: 600}}>
                  ✓ <span style={{color: C.ink, fontWeight: 500}}>{f}</span>
                </span>
              ))}
              <span style={{color: C.inkMuted}}>– {p.gap}</span>
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: top + 2 * CARD + GAP + 40,
          textAlign: 'center',
          ...TYPE.label,
          fontSize: 22,
          color: C.inkMuted,
          opacity: win(t, s5.cards[1] + 0.4, s5.merge, 0.5, 0.3),
        }}
      >
        {c.reveal}
      </div>
    </>
  );
};

// ─── Raum · Kamera und Ebenen ────────────────────────────────────────────────
/** Kamera-Position in Ebenen: 0 = Chips, 1 = Wizard, 2 = Risk Map, 3 = Fachleute. */
const cameraAt = (t: number) => {
  const {s3, s4, s5} = TL;
  const hop = (t0: number) => prog(t, t0 - 0.35, t0 + 0.65, EASE.move);
  return hop(s3.card) + hop(s4.card) + hop(s5.cards[0]);
};

/** Ab wann eine Ebene vorab (unscharf) im Raum zu ahnen sein darf. */
const LAYER_FROM = () => {
  const {s2, s3, s4, s5} = TL;
  return [s2.chips, s3.card - 1.0, s4.card - 1.0, s5.cards[0] - 1.0];
};

const Layer: React.FC<{i: number; cam: number; t: number; children: React.ReactNode}> = ({i, cam, t, children}) => {
  const rel = i - cam; // > 0: liegt voraus, < 0: schon passiert
  const from = LAYER_FROM()[i];
  const appear = prog(t, from, from + 0.6, EASE.enter);
  if (rel > AHEAD || rel < -0.6 || appear <= 0) return null;
  // Voraus: gedämpft und unscharf, wird beim Heranfahren klar. Passiert: blendet aus, bevor sie die Kamera erreicht.
  const vis =
    rel <= 0
      ? 1 - clamp01(-rel / 0.45)
      : lerp(1, 0.3, clamp01(rel / 0.5)) * (1 - clamp01((rel - 0.8) / (AHEAD - 0.8)));
  const blur = Math.min(10, Math.abs(rel) * 9);
  return (
    <div
      style={{
        position: 'absolute',
        left: X0,
        top: CARD_TOP,
        width: W,
        height: CARD_H,
        transform: `translateZ(${-rel * DEPTH}px)`,
        opacity: appear * vis,
        filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

export const Reel01: React.FC<{lang: Lang; showSafe?: boolean}> = ({lang, showSafe = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {s1, s2, s3, s4, s5, end} = TL;
  const c = COPY[lang];
  const cam = cameraAt(t);

  // Glow folgt der Geschichte: Ruhe im Hook, Klarheit wächst bis zur Risk Map.
  const glow =
    0.3 +
    0.15 * prog(t, s2.snap, s2.snap + 0.8, EASE.move) +
    0.35 * prog(t, s4.rows[0], s4.line + 0.6, EASE.move) -
    0.2 * prog(t, s4.out, s5.cards[0], EASE.move);
  const merge = prog(t, s5.merge, end.iris, EASE.move);
  // Langsame Kamera-Drift: der Raum atmet, ohne dass Text schwimmt.
  const rx = 7 + 2.5 * Math.sin(t * 0.22);
  const ry = 5 * Math.sin(t * 0.16 + 0.8);
  const settle = 1 - merge; // beim Verdichten richtet sich die Kamera gerade aus

  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Backdrop t={t} glow={glow} glowY={58} />

      {/* Raum */}
      <AbsoluteFill style={{perspective: PERSPECTIVE, perspectiveOrigin: `${CENTER.x}px ${CENTER.y - 120}px`}}>
        <AbsoluteFill
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
            transform: `rotateX(${rx * settle}deg) rotateY(${ry * settle}deg)`,
          }}
        >
          <Layer i={0} cam={cam} t={t}>
            <RuleChips lang={lang} t={t} frame={frame} fps={fps} />
          </Layer>
          <Layer i={1} cam={cam} t={t}>
            <div style={cardStyle}>
              <Wizard lang={lang} t={t} frame={frame} fps={fps} />
            </div>
          </Layer>
          <Layer i={2} cam={cam} t={t}>
            <div style={cardStyle}>
              <RiskMap lang={lang} frame={frame} fps={fps} />
            </div>
          </Layer>
          <Layer i={3} cam={cam} t={t}>
            <Providers lang={lang} t={t} frame={frame} fps={fps} />
          </Layer>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Bildmarke ab Frame 0 bis zum Verdichten */}
      <SafeArea format="reel" style={{alignItems: 'center'}}>
        <div style={{marginTop: 24, opacity: 1 - prog(t, s5.merge, s5.merge + 0.3, EASE.exit)}}>
          <Logo lockup="symbol" height={MARK_H} />
        </div>
      </SafeArea>

      {/* s1 · Hook: steht ab Frame 0 (Thumbnail) */}
      <SafeArea format="reel" style={{justifyContent: 'center', padding: '120px 20px 0'}}>
        <KineticLine
          text={c.hook}
          inAt={s1.hook - HOOK_LEAD}
          outAt={s1.out}
          profile="lift"
          style={{...TYPE.hero, fontSize: 112, color: C.petrol}}
        />
      </SafeArea>

      {/* Textzeilen bleiben flach im Vordergrund */}
      <Line text={c.rules} inAt={s2.line} outAt={s2.out} />
      <Line text={c.ask} inAt={s3.line} outAt={s3.out} />
      <Line text={c.map} inAt={s4.line} outAt={s4.out} calm />
      <Line text={c.fit} inAt={s5.line} outAt={s5.merge} />

      {/* Gold-Punkt → Iris */}
      <div
        style={{
          position: 'absolute',
          left: CENTER.x - 32,
          top: CENTER.y - 32,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: C.gold,
          transform: `scale(${prog(t, s5.merge + 0.2, end.iris, EASE.land) * (1 + 0.6 * prog(t, end.iris - 0.15, end.iris + 0.2, EASE.enter))})`,
          opacity: merge > 0 ? 1 - prog(t, end.iris + 0.1, end.iris + 0.4, EASE.exit) : 0,
        }}
      />

      <EndCardClaim start={end.iris} origin={{x: (CENTER.x / 1080) * 100, y: (CENTER.y / 1920) * 100}} cta={c.cta} />

      <Grain frame={frame} opacity={0.035} />
      {showSafe ? <SafeZones format="reel" /> : null}
    </AbsoluteFill>
  );
};

export const reel01Duration = TL.duration;
export const reel01Fps = TL.fps;
