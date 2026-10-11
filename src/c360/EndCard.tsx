import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, F, prog} from '../brand/brand';
import {Backdrop} from './Backdrop';
import {Logo} from './Logo';

/**
 * Endcard: Petrol-Fläche, Logo mit Claim, optional eine ruhige Zeile darunter
 * (URL oder Einladung — nie Druck, nie Countdown). `start` ist der Beat, an dem
 * die Karte aufzieht; sie wächst als Kreis aus `origin`, damit der Übergang an
 * einem Objekt hängt statt an einer Blende.
 */
export const EndCard: React.FC<{
  start: number;
  line?: string;
  origin?: {x: number; y: number};
}> = ({start, line, origin = {x: 50, y: 50}}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const iris = prog(t, start, start + 0.7, EASE.move);
  const r = Math.hypot(width, height) * iris;
  const lineK = prog(t, start + 1.7, start + 2.3, EASE.enter);
  if (iris <= 0) return null;
  return (
    <AbsoluteFill
      style={{clipPath: `circle(${r}px at ${origin.x}% ${origin.y}%)`}}
    >
      <Backdrop t={t} variant="petrol" glow={0.35} glowY={42} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 56}}>
        <Logo lockup="stacked" tone="on-petrol" height={300} start={start + 0.35} />
        {line ? (
          <div
            style={{
              fontFamily: F.sans,
              fontSize: 34,
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: C.onPetrolSoft,
              opacity: lineK,
              transform: `translateY(${(1 - lineK) * 14}px)`,
            }}
          >
            {line}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
