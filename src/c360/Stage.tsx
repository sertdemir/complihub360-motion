import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {C} from '../brand/brand';
import {rand} from '../lib';

/**
 * Dunkle Bühne mit einem weichen Lichtkegel von oben (Video-Lab-Konzept V1).
 * `glow` 0..1 kommt aus dem Zustand der Geschichte: Der Kegel wird heller,
 * wo Klarheit entsteht. Staub treibt langsam durch das Licht und ist nur im
 * Kegel zu sehen — nichts steht tot still, ohne dass etwas generiert wird.
 * `dissolve` 0..1 zieht den Kegel zusammen (Karten lösen sich ins Licht auf).
 */
export const Stage: React.FC<{
  t: number;
  glow?: number;
  coneX?: number; // % der Breite
  dust?: number; // Anzahl Partikel
}> = ({t, glow = 0.4, coneX = 50, dust = 70}) => {
  const {width, height} = useVideoConfig();
  const cone = C.coneRgb;
  // Atmen: sehr langsam, nur ein paar Prozent.
  const breathe = 0.04 * Math.sin(t * 0.5);
  const a = 0.1 + 0.12 * glow + breathe;
  const cx = (coneX / 100) * width;
  const topW = width * 0.16;
  const botW = width * 1.25;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 120% 80% at 50% 20%, ${C.stage} 0%, ${C.stageDeep} 75%)`}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="cone-fall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgb(${cone})`} stopOpacity={a * 1.6} />
            <stop offset="55%" stopColor={`rgb(${cone})`} stopOpacity={a * 0.7} />
            <stop offset="100%" stopColor={`rgb(${cone})`} stopOpacity={0} />
          </linearGradient>
          <filter id="cone-soft" x="-30%" y="-10%" width="160%" height="120%">
            <feGaussianBlur stdDeviation="60" />
          </filter>
          <radialGradient id="floor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`rgb(${cone})`} stopOpacity={a * 0.9} />
            <stop offset="100%" stopColor={`rgb(${cone})`} stopOpacity={0} />
          </radialGradient>
        </defs>
        <polygon
          points={`${cx - topW / 2},-40 ${cx + topW / 2},-40 ${cx + botW / 2},${height * 0.92} ${cx - botW / 2},${height * 0.92}`}
          fill="url(#cone-fall)"
          filter="url(#cone-soft)"
        />
        <ellipse cx={cx} cy={height * 0.86} rx={width * 0.55} ry={110} fill="url(#floor)" />
        {Array.from({length: dust}, (_, i) => {
          // Jedes Teilchen: feste Bahn, langsamer Fall, leichtes Pendeln.
          const x0 = rand(i * 3.1) * width;
          const speed = 6 + rand(i * 7.7) * 14; // px/s
          const y = ((rand(i * 5.3) * height + t * speed) % (height + 40)) - 20;
          const x = x0 + 18 * Math.sin(t * (0.2 + rand(i) * 0.3) + i);
          // Nur im Kegel sichtbar: Abstand zur Kegelachse relativ zur Breite auf dieser Höhe.
          const half = (topW + (botW - topW) * (y / height)) / 2;
          const inCone = Math.max(0, 1 - Math.abs(x - cx) / half);
          const r = 1 + rand(i * 2.2) * 2.2;
          const twinkle = 0.6 + 0.4 * Math.sin(t * (0.8 + rand(i * 9.1)) + i * 1.7);
          const o = inCone * twinkle * (0.25 + 0.45 * glow) * (1 - y / height) * 1.4;
          return o > 0.02 ? <circle key={i} cx={x} cy={y} r={r} fill={`rgb(${cone})`} opacity={Math.min(1, o)} /> : null;
        })}
      </svg>
      {/* Vignette: der Raum endet weich, die Ränder bleiben ruhig. */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};
