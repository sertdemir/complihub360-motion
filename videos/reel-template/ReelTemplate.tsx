import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, clamp01, EASE, lerp, prog, sp, SPRING, TYPE} from '../../src/brand/brand';
import {Backdrop} from '../../src/c360/Backdrop';
import {EndCard} from '../../src/c360/EndCard';
import {Logo} from '../../src/c360/Logo';
import {KineticLine, SafeArea, SafeZones} from '../../src/c360/Text';
import {Grain} from '../../src/components/primitives';
import TL from './timeline.json';

// ─── Reel-Vorlage · 9:16 · 15 s · Profil "lift" ──────────────────────────────
// Technische Vorlage für Instagram-Reels. Die Texte sind PLATZHALTER und noch
// nicht freigegeben — echte Copy läuft über Storyboard-Canvas und DNA-Check.
// Dramaturgie: Erleichterung statt Angst. Hook → drei Schritte, die als Karten
// liegen bleiben (durchgehende Objekte) → die Karten verdichten sich zu einem
// Gold-Punkt → aus dem Punkt öffnet sich die Endcard.

export const COPY = {
  hook: 'Compliance muss sich nicht *schwer* anfühlen.',
  steps: ['Sie beschreiben Ihr Vorhaben.', 'Wir zeigen, was *wirklich* gilt.', 'Und wer zu Ihnen passt.'],
};

const CARD_H = 176;
/** Einlaufzeit des Hooks (5 Wörter × stagger + enter, lift). */
const HOOK_LEAD = 1.1;
const CARD_GAP = 32;
const CENTER = {x: 50, y: 50};

const Check: React.FC<{k: number}> = ({k}) => (
  <svg width={56} height={56} viewBox="0 0 56 56" style={{flexShrink: 0}}>
    <circle cx={28} cy={28} r={26 * k} fill={C.gold} />
    <path
      d="M17 29 L25 37 L40 20"
      fill="none"
      stroke={C.paper}
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={40}
      strokeDashoffset={40 * (1 - clamp01((k - 0.4) / 0.6))}
    />
  </svg>
);

export const ReelTemplate: React.FC<{showSafe?: boolean}> = ({showSafe = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {s1, s2, end} = TL;

  const merge = prog(t, s2.merge, end.iris, EASE.move);
  const checksDone = s2.checks.reduce((a, c) => a + sp(frame, fps, c, SPRING.pop), 0) / s2.checks.length;
  const stackH = 3 * CARD_H + 2 * CARD_GAP;

  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Backdrop t={t} glow={0.25 + 0.5 * checksDone * (1 - merge)} glowY={52} />

      {/* Bildmarke steht ab Frame 0 — das erste Bild ist das Thumbnail. */}
      <SafeArea format="reel" style={{alignItems: 'center'}}>
        <div style={{marginTop: 24, opacity: 1 - prog(t, s2.merge, s2.merge + 0.3, EASE.exit)}}>
          <Logo lockup="symbol" height={88} />
        </div>
      </SafeArea>

      {/* s1 · Hook */}
      <SafeArea format="reel" style={{justifyContent: 'center', padding: '0 20px'}}>
        {/* Der Hook steht ab Frame 0 fertig da (Thumbnail); `s1.hook` ist der
            Beat, an dem er sitzt — der Einlauf liegt davor, außerhalb des Videos. */}
        <KineticLine
          text={COPY.hook}
          inAt={s1.hook - HOOK_LEAD}
          outAt={s1.hookOut}
          profile="lift"
          style={{...TYPE.hero, color: C.petrol}}
        />
      </SafeArea>

      {/* s2 · drei Schritte als Karten, die liegen bleiben */}
      <SafeArea format="reel" style={{justifyContent: 'center', padding: '0 12px'}}>
        <div style={{position: 'relative', height: stackH}}>
          {COPY.steps.map((text, i) => {
            const enter = clamp01(sp(frame, fps, s2.cards[i], SPRING.panel));
            const check = clamp01(sp(frame, fps, s2.checks[i], SPRING.pop));
            const y = i * (CARD_H + CARD_GAP);
            // Verdichten: jede Karte zieht zur Mitte des Stapels und schrumpft.
            const toCenter = stackH / 2 - CARD_H / 2 - y;
            const scale = lerp(1, 0.2, merge);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: y,
                  height: CARD_H,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 28,
                  padding: '0 36px',
                  borderRadius: 28,
                  background: 'rgba(255,255,255,0.78)',
                  border: `1.5px solid ${C.line}`,
                  boxShadow: '0 18px 40px -24px rgba(0,35,29,0.35)',
                  opacity: enter * (1 - prog(t, s2.merge + 0.15, end.iris - 0.05, EASE.exit)),
                  transform: `translateY(${(1 - enter) * 60 + toCenter * merge}px) scale(${scale})`,
                }}
              >
                <Check k={check} />
                <KineticLine
                  text={text}
                  inAt={s2.cards[i] + 0.1}
                  profile="lift"
                  style={{...TYPE.title, fontSize: 60, color: C.ink}}
                />
              </div>
            );
          })}
        </div>
      </SafeArea>

      {/* Gold-Punkt, in den die Karten münden — er wird zur Iris der Endcard. */}
      <div
        style={{
          position: 'absolute',
          left: `${CENTER.x}%`,
          top: `${CENTER.y}%`,
          width: 64,
          height: 64,
          marginLeft: -32,
          marginTop: -32,
          borderRadius: '50%',
          background: C.gold,
          transform: `scale(${prog(t, s2.merge + 0.2, end.iris, EASE.land) * (1 + 0.6 * prog(t, end.iris - 0.15, end.iris + 0.2, EASE.enter))})`,
          opacity: 1 - prog(t, end.iris + 0.1, end.iris + 0.4, EASE.exit),
        }}
      />

      <EndCard start={end.iris} origin={CENTER} />

      <Grain frame={frame} opacity={0.035} />
      {showSafe ? <SafeZones format="reel" /> : null}
    </AbsoluteFill>
  );
};

export const reelDuration = TL.duration;
export const reelFps = TL.fps;
