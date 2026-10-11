import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {C, GRADIENT} from '../brand/brand';

/**
 * Hintergrund. `gradient`: der Gradient (Petrol→Gold-Tint), hell und ruhig —
 * Standard. `petrol`: Markenfläche für Endcard und Kontrastmomente.
 * `glow` 0..1 kommt aus dem Zustand der Geschichte, nicht aus der Uhr: ein
 * warmer Gold-Schein, der zeigt, wo gerade die Klarheit entsteht.
 * Das Punktraster driftet ein paar px/s — nichts steht tot still.
 */
export const Backdrop: React.FC<{
  t: number;
  variant?: 'gradient' | 'petrol';
  glow?: number;
  glowX?: number;
  glowY?: number;
}> = ({t, variant = 'gradient', glow = 0, glowX = 50, glowY = 45}) => {
  const {width, height} = useVideoConfig();
  const petrol = variant === 'petrol';
  const dot = petrol ? 'rgba(255,255,255,0.10)' : 'rgba(0,77,64,0.10)';
  const id = petrol ? 'p' : 'g';
  return (
    <AbsoluteFill
      style={{
        background: petrol
          ? `radial-gradient(ellipse 90% 70% at 50% 35%, ${C.petrol} 0%, ${C.petrolDeep} 100%)`
          : GRADIENT,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 45% at ${glowX}% ${glowY}%, rgba(212,175,55,${
            (petrol ? 0.05 : 0.04) + 0.18 * glow
          }) 0%, rgba(212,175,55,0) 70%)`,
        }}
      />
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        <defs>
          <pattern
            id={`dots-${id}`}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${-t * 3} ${-t * 6})`}
          >
            <circle cx="20" cy="20" r="1.3" fill={dot} />
          </pattern>
          <radialGradient id={`fade-${id}`} cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id={`mask-${id}`}>
            <rect width={width} height={height} fill={`url(#fade-${id})`} />
          </mask>
        </defs>
        <rect width={width} height={height} fill={`url(#dots-${id})`} mask={`url(#mask-${id})`} />
      </svg>
    </AbsoluteFill>
  );
};
