import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, clamp01, EASE, F, lerp, prog, sp, SPRING, TYPE} from '../../src/brand/brand';
import {Backdrop} from '../../src/c360/Backdrop';
import {EndCard} from '../../src/c360/EndCard';
import {Logo} from '../../src/c360/Logo';
import {KineticLine, SafeArea, SafeZones} from '../../src/c360/Text';
import {Grain} from '../../src/components/primitives';
import {COPY, Lang, Priority, PRIORITY_LABEL} from './copy';
import TL from './timeline.json';

// ─── Reel 01 · "Vom offenen Vorhaben zur klaren Risk Map" ───────────────────
// 9:16 · 24 s · Profil lift, Szene 4 (Risk Map) calm. Storyboard abgenommen
// 2026-10-11 (Kern A, Szenen 1–6 A), Fassungen DE und EN.
//
// Durchgehendes Objekt statt Schnitten: die zutreffenden Regel-Chips fliegen
// in die Wizard-Karte, die Karte wird zur Risk Map, die Map macht den
// Fachleuten Platz, deren Karten sich zu einem Gold-Punkt verdichten — und aus
// dem Punkt öffnet sich die Endcard.
//
// Raster (1080×1920): Text immer in der oberen Zone, Objekte in der Kartenzone.

const X0 = 60;
const W = 900;
const LINE_TOP = 420;
const CARD_TOP = 760;
const CARD_H = 770;
const CENTER = {x: X0 + W / 2, y: CARD_TOP + CARD_H / 2};
const HOOK_LEAD = 1.1;

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

// ─── Szene 2 · Regel-Chips ───────────────────────────────────────────────────
const CHIP_FROM = [
  {x: 170, y: 860, a: 0.0},
  {x: 720, y: 820, a: 1.3},
  {x: 330, y: 1060, a: 2.1},
  {x: 800, y: 1180, a: 3.4},
  {x: 210, y: 1320, a: 4.2},
  {x: 600, y: 1390, a: 5.0},
];
const chipGrid = (i: number) => ({x: X0 + 150 + (i % 3) * 300, y: CARD_TOP + 200 + Math.floor(i / 3) * 170});

const RuleChips: React.FC<{lang: Lang; t: number; frame: number; fps: number}> = ({lang, t, frame, fps}) => {
  const {s2, s3} = TL;
  const show = prog(t, s2.chips, s2.chips + 0.5, EASE.enter);
  const snap = Math.min(1, sp(frame, fps, s2.snap, SPRING.panel));
  const fade = prog(t, s2.fade, s2.fade + 0.6, EASE.move);
  const fly = prog(t, s2.out, s3.card + 0.25, EASE.move);
  if (show <= 0 || fly >= 1) return null;
  return (
    <>
      {COPY[lang].chips.map((c, i) => {
        const f = CHIP_FROM[i];
        const drift = {x: f.x + 26 * Math.sin(t * 0.9 + f.a), y: f.y + 18 * Math.cos(t * 0.7 + f.a)};
        const g = chipGrid(i);
        const x0 = lerp(drift.x, g.x, snap);
        const y0 = lerp(drift.y, g.y, snap);
        const x = lerp(x0, CENTER.x, fly);
        const y = lerp(y0, CENTER.y, fly);
        const dim = c.applies ? 1 : lerp(1, 0.16, fade);
        const out = c.applies ? 1 - fly : 1 - prog(t, s2.out, s2.out + 0.3, EASE.exit);
        return (
          <div
            key={c.label}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%,-50%) scale(${lerp(1, 0.35, fly) * lerp(0.9, 1, show)}) rotate(${(1 - snap) * (i % 2 ? 4 : -4)}deg)`,
              opacity: show * dim * out,
            }}
          >
            <Pill on={c.applies ? 0.12 * fade : 0} style={{fontSize: 40, padding: '24px 40px', boxShadow: '0 16px 32px -22px rgba(0,35,29,0.55)'}}>
              {c.label}
            </Pill>
          </div>
        );
      })}
    </>
  );
};

// ─── Szene 3/4 · die Karte: erst Wizard, dann Risk Map ───────────────────────
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

const Surface: React.FC<{lang: Lang; t: number; frame: number; fps: number}> = ({lang, t, frame, fps}) => {
  const {s3, s4} = TL;
  const enter = clamp01(sp(frame, fps, s3.card, SPRING.panel));
  const exit = prog(t, s4.out, s4.out + 0.35, EASE.exit);
  if (enter <= 0 || exit >= 1) return null;
  // Nacheinander statt überblendet: zwei Textebenen übereinander lesen sich als Fehler.
  const wizardOut = prog(t, s4.card, s4.card + 0.25, EASE.exit);
  const mapIn = prog(t, s4.card + 0.2, s4.card + 0.5, EASE.enter);
  return (
    <div
      style={{
        position: 'absolute',
        left: X0,
        top: CARD_TOP,
        width: W,
        height: CARD_H,
        padding: 52,
        borderRadius: 40,
        background: 'rgba(255,255,255,0.86)',
        border: `1.5px solid ${C.line}`,
        boxShadow: '0 30px 60px -36px rgba(0,35,29,0.45)',
        opacity: enter * (1 - exit),
        transform: `translateY(${(1 - enter) * 80 - exit * 120}px) scale(${lerp(0.96, 1, enter)})`,
      }}
    >
      <div style={{position: 'absolute', inset: 52, opacity: 1 - wizardOut}}>
        <Wizard lang={lang} t={t} frame={frame} fps={fps} />
      </div>
      <div style={{position: 'absolute', inset: 52, opacity: mapIn}}>
        <RiskMap lang={lang} frame={frame} fps={fps} />
      </div>
    </div>
  );
};

// ─── Szene 5 · Fachleute, anonym ─────────────────────────────────────────────
const Providers: React.FC<{lang: Lang; t: number; frame: number; fps: number}> = ({lang, t, frame, fps}) => {
  const {s5, end} = TL;
  const c = COPY[lang];
  const merge = prog(t, s5.merge, end.iris, EASE.move);
  const gone = prog(t, s5.merge + 0.15, end.iris - 0.05, EASE.exit);
  const CARD = 250;
  const GAP = 36;
  const top = CARD_TOP + 60;
  return (
    <>
      {c.providers.map((p, i) => {
        const k = clamp01(sp(frame, fps, s5.cards[i], SPRING.pop));
        if (k <= 0 || gone >= 1) return null;
        const y = top + i * (CARD + GAP);
        const toCenter = CENTER.y - (y + CARD / 2);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: X0,
              top: y,
              width: W,
              height: CARD,
              padding: '36px 44px',
              borderRadius: 32,
              background: 'rgba(255,255,255,0.86)',
              border: `1.5px solid ${C.line}`,
              boxShadow: '0 24px 48px -32px rgba(0,35,29,0.45)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: k * (1 - gone),
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
          left: X0,
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

export const Reel01: React.FC<{lang: Lang; showSafe?: boolean}> = ({lang, showSafe = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {s1, s2, s3, s4, s5, end} = TL;
  const c = COPY[lang];

  // Glow folgt der Geschichte: Ruhe im Hook, Klarheit wächst bis zur Risk Map.
  const glow =
    0.3 +
    0.15 * prog(t, s2.snap, s2.snap + 0.8, EASE.move) +
    0.35 * prog(t, s4.rows[0], s4.line + 0.6, EASE.move) -
    0.2 * prog(t, s4.out, s5.cards[0], EASE.move);
  const merge = prog(t, s5.merge, end.iris, EASE.move);

  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Backdrop t={t} glow={glow} glowY={55} />

      {/* Bildmarke ab Frame 0 bis zum Verdichten */}
      <SafeArea format="reel" style={{alignItems: 'center'}}>
        <div style={{marginTop: 24, opacity: 1 - prog(t, s5.merge, s5.merge + 0.3, EASE.exit)}}>
          <Logo lockup="symbol" height={88} />
        </div>
      </SafeArea>

      {/* s1 · Hook: steht ab Frame 0 (Thumbnail) */}
      <SafeArea format="reel" style={{justifyContent: 'center', padding: '0 20px'}}>
        <KineticLine
          text={c.hook}
          inAt={s1.hook - HOOK_LEAD}
          outAt={s1.out}
          profile="lift"
          style={{...TYPE.hero, fontSize: 112, color: C.petrol}}
        />
      </SafeArea>

      {/* s2 · Viele Regeln */}
      <Line text={c.rules} inAt={s2.line} outAt={s2.out} />
      <RuleChips lang={lang} t={t} frame={frame} fps={fps} />

      {/* s3 · Wizard → s4 · Risk Map (dieselbe Karte) */}
      <Line text={c.ask} inAt={s3.line} outAt={s3.out} />
      <Line text={c.map} inAt={s4.line} outAt={s4.out} calm />
      <Surface lang={lang} t={t} frame={frame} fps={fps} />

      {/* s5 · Fachleute */}
      <Line text={c.fit} inAt={s5.line} outAt={s5.merge} />
      <Providers lang={lang} t={t} frame={frame} fps={fps} />

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

      <EndCard start={end.iris} origin={{x: (CENTER.x / 1080) * 100, y: (CENTER.y / 1920) * 100}} line={c.url} />

      <Grain frame={frame} opacity={0.035} />
      {showSafe ? <SafeZones format="reel" /> : null}
    </AbsoluteFill>
  );
};

export const reel01Duration = TL.duration;
export const reel01Fps = TL.fps;
