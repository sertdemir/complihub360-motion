import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, F, prog} from '../brand/brand';
import {KineticLine} from './Text';
import {Backdrop} from './Backdrop';
import {Logo} from './Logo';

/**
 * Endcard "Gestapelt" (Reel 01, Runde 2 · A): Petrol-Iris aus einem Objekt im
 * Bild, große Marke ohne Claim-Zeile, Goldlinie, der Claim als eigene Zeile im
 * Vordergrund, darunter eine ruhige CTA. Einladung statt Druck — keine Frist,
 * kein Countdown.
 *
 * Der Claim bleibt in jeder Sprachfassung englisch, wie im Logo.
 */
export const CLAIM_LINE = 'Always on *your* *side.*';

export const EndCardClaim: React.FC<{
  start: number;
  cta: string;
  url?: string;
  origin?: {x: number; y: number};
}> = ({start, cta, url, origin = {x: 50, y: 50}}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const iris = prog(t, start, start + 0.7, EASE.move);
  if (iris <= 0) return null;
  const r = Math.hypot(width, height) * iris;
  const rule = prog(t, start + 1.0, start + 1.6, EASE.enter);
  const ctaK = prog(t, start + 2.0, start + 2.6, EASE.enter);
  return (
    <AbsoluteFill style={{clipPath: `circle(${r}px at ${origin.x}% ${origin.y}%)`}}>
      <Backdrop t={t} variant="petrol" glow={0.4} glowY={46} />
      <AbsoluteFill
        style={{alignItems: 'center', justifyContent: 'center', gap: 64, padding: '250px 120px 380px 60px'}}
      >
        <Logo lockup="stacked" tone="on-petrol" height={360} start={start + 0.3} withClaim={false} />
        <div
          style={{
            width: 560 * rule,
            height: 2,
            background: `linear-gradient(90deg, rgba(197,145,59,0), ${C.gold}, rgba(197,145,59,0))`,
          }}
        />
        <div style={{textAlign: 'center'}}>
          <KineticLine
            text={CLAIM_LINE}
            inAt={start + 1.2}
            profile="calm"
            accent={C.goldOnPetrol}
            style={{fontFamily: F.display, fontWeight: 500, fontSize: 112, lineHeight: 1.04, letterSpacing: '-0.02em', color: C.onPetrol}}
          />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: ctaK, transform: `translateY(${(1 - ctaK) * 18}px)`}}>
          <span
            style={{
              fontFamily: F.sans,
              fontWeight: 600,
              fontSize: 42,
              color: C.petrolDeep,
              background: C.goldOnPetrol,
              borderRadius: 999,
              padding: '28px 56px',
            }}
          >
            {cta}
          </span>
          {url ? (
            <span style={{fontFamily: F.mono, fontSize: 28, letterSpacing: '0.14em', color: C.onPetrolSoft}}>{url}</span>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
