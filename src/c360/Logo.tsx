import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAIM, MARK_ARC, MARK_ARC_LOWER, MARK_SWOOSH, WORDMARK_GOLD, WORDMARK_INK} from '../brand/logo-paths';
import {globusPfad, RUHE_LAENGE, UMLAUF_SEKUNDEN} from '../brand/globe-spin';
import {clamp01, EASE, lerp, prog, sp, SPRING} from '../brand/brand';

// ─── Logo, animierbar ────────────────────────────────────────────────────────
// Geometrie und Farblogik 1:1 aus Compass (Logo.tsx im Produkt-Repo, Figma-Node
// 2101:1151). Neu ist nur die Zeit: `start` ist der Beat, an dem die Marke
// einläuft; ohne `start` steht sie fertig da. Der Globus dreht mit derselben
// Umlaufzeit wie im Produkt (25 s), aber aus dem Frame gerechnet statt aus
// requestAnimationFrame — sonst flackert es beim Rendern.

export type LogoTone = 'on-light' | 'on-petrol';

const TONE = {
  'on-light': {ring: '#0D3B33', ink: '#012E27', gold: '#C5913B', claim: '#6A5B1E'},
  'on-petrol': {ring: '#FFFFFF', ink: '#FFFFFF', gold: '#C5913B', claim: '#F4C44A'},
} as const;

const MARK_W = 40.594;
const MARK_H = 40.018;
const WORD_W = 101;
const WORD_H = 20.701;
const GAP_V = 8;

let seq = 0;

const Mark: React.FC<{tone: LogoTone; k: (o: number) => number; t: number; gradId: string}> = ({
  tone,
  k,
  t,
  gradId,
}) => {
  const c = TONE[tone];
  const ring = k(0);
  const lower = k(0.12);
  const swoosh = k(0.3);
  return (
    <>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C6923B" />
          <stop offset="100%" stopColor="#B07E36" />
        </linearGradient>
        <clipPath id={`${gradId}-clip`}>
          <rect x={-2} y={0} width={(MARK_W + 4) * swoosh} height={MARK_H} />
        </clipPath>
      </defs>
      <g
        opacity={ring}
        transform={`rotate(${lerp(-70, 0, ring)} 21.7 20.4) translate(2.11 0)`}
      >
        <path d={MARK_ARC} fill={c.ring} />
      </g>
      <g opacity={lower} transform={`translate(10.101 ${29.798 + (1 - lower) * 6})`}>
        <path d={MARK_ARC_LOWER} fill={c.ring} />
      </g>
      <path
        d={globusPfad(RUHE_LAENGE + (360 * t) / UMLAUF_SEKUNDEN)}
        fill={c.ink}
        opacity={k(0.08)}
      />
      <g clipPath={`url(#${gradId}-clip)`}>
        <path d={MARK_SWOOSH} fill={`url(#${gradId})`} transform="translate(0 13.877)" />
      </g>
    </>
  );
};

const Word: React.FC<{tone: LogoTone; k: number; claim: number | null}> = ({tone, k, claim}) => {
  const c = TONE[tone];
  return (
    <>
      <g opacity={k} transform={`translate(0 ${(1 - k) * 4})`}>
        {WORDMARK_INK.map((d, i) => (
          <path key={`i${i}`} d={d} fill={c.ink} />
        ))}
        {WORDMARK_GOLD.map((d, i) => (
          <path key={`g${i}`} d={d} fill={c.gold} />
        ))}
      </g>
      {claim === null ? null : (
      <g opacity={claim} transform={`translate(0 ${WORD_H - 7})`}>
        <rect x={13.5 * (1 - claim)} y="3.5" width={13.5 * claim} height="0.7" fill={c.claim} />
        <path d={CLAIM} fill={c.claim} transform="translate(17.5 0)" />
        <rect x="87.5" y="3.5" width={13.5 * claim} height="0.7" fill={c.claim} />
      </g>
      )}
    </>
  );
};

/**
 * Logo als Video-Element. `lockup`: 'symbol' (nur Bildmarke) oder 'stacked'
 * (Bildmarke über Wortmarke mit Claim — ab ~90 px Höhe, darunter ist der
 * Claim nicht lesbar). `height` in px.
 */
export const Logo: React.FC<{
  lockup?: 'symbol' | 'stacked';
  tone?: LogoTone;
  height: number;
  start?: number;
  /** Claim-Zeile in der Wortmarke. Aus, wenn der Claim als eigene Zeile gesetzt wird. */
  withClaim?: boolean;
  style?: React.CSSProperties;
}> = ({lockup = 'stacked', tone = 'on-light', height, start, withClaim = true, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const [gradId] = React.useState(() => `c360-swoosh-${++seq}`);
  // Einlauf in Stufen: offset in s nach `start`. Ohne start: alles steht.
  const k = (offset: number) =>
    start === undefined ? 1 : clamp01(sp(frame, fps, start + offset, SPRING.panel));
  const word = start === undefined ? 1 : prog(t, start + 0.45, start + 1.1, EASE.enter);
  const claim = start === undefined ? 1 : prog(t, start + 0.95, start + 1.6, EASE.enter);

  const stacked = lockup === 'stacked';
  const w = stacked ? WORD_W : MARK_W;
  const WORD_TEXT_H = 13.7; // Wortzeichen ohne Claim-Zeile (wie im Produkt-Logo)
  const h = stacked ? MARK_H + GAP_V + (withClaim ? WORD_H : WORD_TEXT_H) : MARK_H;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{height, width: (height * w) / h, overflow: 'visible', ...style}}>
      <g transform={stacked ? `translate(${(WORD_W - MARK_W) / 2} 0)` : undefined}>
        <Mark tone={tone} k={k} t={t} gradId={gradId} />
      </g>
      {stacked && (
        <g transform={`translate(0 ${MARK_H + GAP_V})`}>
          <Word tone={tone} k={word} claim={withClaim ? claim : null} />
        </g>
      )}
    </svg>
  );
};
