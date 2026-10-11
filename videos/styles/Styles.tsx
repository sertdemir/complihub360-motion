import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {C, clamp01, EASE, GRADIENT, lerp, prog, TYPE} from '../../src/brand/brand';
import {Logo} from '../../src/c360/Logo';
import {KineticLine} from '../../src/c360/Text';
import {Grain} from '../../src/components/primitives';
import TL from './timeline.json';

// ─── Stilproben (2026-10-11) ─────────────────────────────────────────────────
// Drei Richtungen für kommende Reels, alle mit derselben Botschaft, demselben
// Timing und Zen-Klang, damit nur der Stil sich unterscheidet:
//   StyleLine       · "Eine Linie"        — eine goldene Linie erzählt alles
//   StyleObjects    · "Stille Objekte"    — 3D-Stillleben (sims/objects) als Clip
//   StyleLandscape  · "Klarheit als Landschaft" — Höhenlinien, die zur Ruhe kommen
// Keine fertigen Reels: Frame 0 und Endcard sind hier bewusst schlicht.

export const MESSAGE = 'Sehen, was *wirklich* gilt.';
export const STYLE_DURATION = TL.duration;
export const STYLE_FPS = TL.fps;

const Message: React.FC<{top: number; color?: string}> = ({top, color = C.petrol}) => (
  <div style={{position: 'absolute', top, left: 60, width: 900}}>
    <KineticLine text={MESSAGE} inAt={TL.line} profile="calm" style={{...TYPE.display, color}} />
  </div>
);

// ─── 1 · Eine Linie ──────────────────────────────────────────────────────────
// Unruhig suchend → ruhige Unterstreichung unter der Botschaft → ein Kreis,
// der zur Bildmarke wird.
const LINE_PATH = [
  // sucht: unruhig im unteren Bilddrittel, von links nach rechts
  'M -60 1460',
  'C 60 1330, 150 1540, 250 1420',
  'C 340 1310, 290 1200, 400 1240',
  'C 520 1290, 470 1470, 600 1440',
  'C 730 1410, 650 1220, 780 1230',
  'C 900 1240, 990 1150, 960 1060',
  // findet: steigt auf und wird zur ruhigen Unterstreichung, rechts nach links
  'C 945 1000, 930 930, 860 930',
  'L 60 930',
  // schließt: am linken Rand hinauf und als Kreis um die Bildmarke
  'C -10 930, -10 430, 410 430',
  'A 130 130 0 1 1 670 430',
  'A 130 130 0 1 1 410 430',
].join(' ');
const LINE_LEN = getLength(LINE_PATH);

export const StyleLine: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const draw = prog(t, 0.1, TL.logo, EASE.move) * LINE_LEN;
  const tip = getPointAtLength(LINE_PATH, Math.max(0.1, Math.min(LINE_LEN - 0.1, draw)));
  const toLogo = prog(t, TL.logo - 0.1, TL.logo + 0.7, EASE.enter);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.paper} 0%, ${C.mist} 100%)`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path
          d={LINE_PATH}
          fill="none"
          stroke={C.gold}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={LINE_LEN}
          strokeDashoffset={LINE_LEN - draw}
          opacity={1 - 0.85 * toLogo}
        />
        <circle cx={tip?.x ?? 0} cy={tip?.y ?? 0} r={11} fill={C.gold} opacity={(1 - toLogo) * (draw > 1 ? 1 : 0)} />
      </svg>
      <Message top={650} />
      <div style={{position: 'absolute', left: 540 - 136, top: 430 - 134, opacity: toLogo, transform: `scale(${lerp(0.92, 1, toLogo)})`}}>
        <Logo lockup="symbol" height={268} />
      </div>
      <Grain frame={frame} opacity={0.03} />
    </AbsoluteFill>
  );
};

// ─── 2 · Stille Objekte ──────────────────────────────────────────────────────
export const StyleObjects: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const logo = prog(t, TL.logo, TL.logo + 0.8, EASE.enter);
  return (
    <AbsoluteFill style={{background: C.mist}}>
      <OffthreadVideo src={staticFile('styles/objects.mp4')} muted />
      <Message top={470} />
      <div style={{position: 'absolute', top: 274, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: logo}}>
        <Logo lockup="symbol" height={140} />
      </div>
      <Grain frame={frame} opacity={0.025} />
    </AbsoluteFill>
  );
};

// ─── 3 · Klarheit als Landschaft ─────────────────────────────────────────────
// Höhenfeld aus drei ruhigen Hügeln plus Unruhe, die abklingt. Höhenlinien per
// Marching Squares, gezeichnet auf eine Fläche, die schräg im Raum liegt.
const HILLS = [
  {x: 420, y: 470, a: 1.0, s: 150},
  {x: 860, y: 760, a: 0.8, s: 130},
  {x: 560, y: 1030, a: 0.62, s: 120},
];
const SIZE = 1400;
const STEP = 10;
const LEVELS = 13;

const height = (x: number, y: number, rough: number, t: number) => {
  let h = 0;
  for (const p of HILLS) h += p.a * Math.exp(-((x - p.x) ** 2 + (y - p.y) ** 2) / (2 * p.s * p.s));
  const n =
    0.32 * Math.sin(x * 0.013 + y * 0.006 + t * 0.55) +
    0.24 * Math.sin(x * 0.007 - y * 0.017 - t * 0.4) +
    0.18 * Math.sin((x + y) * 0.021 + t * 0.7);
  return h + rough * n * 0.55;
};

const drawContours = (ctx: CanvasRenderingContext2D, t: number) => {
  const rough = lerp(1, 0.08, prog(t, 0.3, 3.8, EASE.move));
  const settle = prog(t, 2.6, 4.2, EASE.enter);
  const nx = SIZE / STEP + 1;
  const grid = new Float32Array(nx * nx);
  for (let j = 0; j < nx; j++) for (let i = 0; i < nx; i++) grid[j * nx + i] = height(i * STEP, j * STEP, rough, t);
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.lineCap = 'round';
  for (let l = 1; l <= LEVELS; l++) {
    const lv = -0.45 + (l / LEVELS) * 1.45;
    const top = l >= LEVELS - 3;
    ctx.strokeStyle = top ? `rgba(197,145,59,${0.35 + 0.6 * settle})` : `rgba(0,77,64,${0.18 + 0.22 * (l / LEVELS)})`;
    ctx.lineWidth = top ? 3.2 : 2;
    ctx.beginPath();
    for (let j = 0; j < nx - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = grid[j * nx + i], b = grid[j * nx + i + 1], c = grid[(j + 1) * nx + i + 1], d = grid[(j + 1) * nx + i];
        const idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (d > lv ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const x = i * STEP, y = j * STEP;
        const lerpE = (p: number, q: number) => (lv - p) / (q - p);
        const T: [number, number] = [x + STEP * lerpE(a, b), y];
        const R: [number, number] = [x + STEP, y + STEP * lerpE(b, c)];
        const B: [number, number] = [x + STEP * lerpE(d, c), y + STEP];
        const L: [number, number] = [x, y + STEP * lerpE(a, d)];
        const seg = (p: [number, number], q: [number, number]) => {
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(q[0], q[1]);
        };
        switch (idx) {
          case 1: case 14: seg(L, B); break;
          case 2: case 13: seg(B, R); break;
          case 3: case 12: seg(L, R); break;
          case 4: case 11: seg(T, R); break;
          case 5: seg(L, T); seg(B, R); break;
          case 6: case 9: seg(T, B); break;
          case 7: case 8: seg(L, T); break;
          case 10: seg(T, R); seg(L, B); break;
        }
      }
    }
    ctx.stroke();
  }
};

export const StyleLandscape: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) drawContours(ctx, t);
  }, [t]);
  const logo = prog(t, TL.logo, TL.logo + 0.8, EASE.enter);
  const tilt = lerp(62, 54, clamp01(t / TL.duration));
  return (
    <AbsoluteFill style={{background: GRADIENT}}>
      <AbsoluteFill style={{perspective: 1500, perspectiveOrigin: '50% 30%'}}>
        <canvas
          ref={ref}
          width={SIZE}
          height={SIZE}
          style={{
            position: 'absolute',
            left: (1080 - SIZE) / 2,
            top: 820,
            width: SIZE,
            height: SIZE,
            transform: `rotateX(${tilt}deg) rotateZ(${-8 + t * 1.6}deg)`,
            transformOrigin: '50% 40%',
          }}
        />
      </AbsoluteFill>
      <Message top={470} />
      <div style={{position: 'absolute', top: 274, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: logo}}>
        <Logo lockup="symbol" height={140} />
      </div>
      <Grain frame={frame} opacity={0.03} />
    </AbsoluteFill>
  );
};
