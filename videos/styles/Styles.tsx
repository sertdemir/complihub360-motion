import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {C, EASE, lerp, prog, TYPE} from '../../src/brand/brand';
import {Logo} from '../../src/c360/Logo';
import {KineticLine} from '../../src/c360/Text';
import {Grain} from '../../src/components/primitives';
import TL from './timeline.json';
import CT from './combo.json';

// ─── Stilproben (2026-10-11) ─────────────────────────────────────────────────
// Richtungen für kommende Reels, mit derselben Botschaft, demselben Timing und
// Zen-Klang, damit nur der Stil sich unterscheidet. Vom Nutzer weiterverfolgt
// (2026-10-11), noch ohne Favorit:
//   StyleLine       · "Eine Linie"        — eine goldene Linie erzählt alles
//   StyleObjects    · "Stille Objekte"    — 3D-Stillleben (sims/objects) als Clip
// Verworfen: "Klarheit als Landschaft" (Höhenlinien) — im Git-Verlauf.
// Keine fertigen Reels: Frame 0 und Endcard sind hier bewusst schlicht.

export const MESSAGE = 'Sehen, was *wirklich* gilt.';
export const STYLE_DURATION = TL.duration;
export const STYLE_FPS = TL.fps;

const Message: React.FC<{top: number; color?: string; inAt?: number}> = ({top, color = C.petrol, inAt = TL.line}) => (
  <div style={{position: 'absolute', top, left: 60, width: 900}}>
    <KineticLine text={MESSAGE} inAt={inAt} profile="calm" style={{...TYPE.display, color}} />
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

// ─── Kombi · Die Linie findet den Kompass ────────────────────────────────────
// A + B: die Linie sucht und schließt sich zum Kreis — exakt dort, wo der Ring
// des 3D-Kompasses in Draufsicht liegt (CT.ringCy, CT.ringR). Der 3D-Clip
// (sims/compass) übernimmt, kippt in die Perspektive, die Nadel kommt zur Ruhe,
// zurück in die Draufsicht — die Linie übernimmt wieder und wird Bildmarke.
const CX = 540;
// Sucht im freien Band zwischen Botschaft und Kreis, mündet rechts tangential in den Kreis.
const SEARCH_PATH = [
  'M -60 830',
  'C 70 730, 170 900, 290 810',
  'C 390 735, 360 870, 480 850',
  'C 610 828, 620 730, 730 765',
  'C 860 805, 885 1040, 840 1180',
].join(' ');
const CIRCLE_PATH = `M ${CX + CT.ringR} ${CT.ringCy} A ${CT.ringR} ${CT.ringR} 0 1 1 ${CX - CT.ringR} ${CT.ringCy} A ${CT.ringR} ${CT.ringR} 0 1 1 ${CX + CT.ringR} ${CT.ringCy}`;
const SEARCH_LEN = getLength(SEARCH_PATH);
const CIRCLE_LEN = getLength(CIRCLE_PATH);
export const COMBO_DURATION = CT.duration;

export const StyleCombo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const search = prog(t, 0.1, CT.circleClosed - 0.9, EASE.move) * SEARCH_LEN;
  const circle = prog(t, CT.circleClosed - 0.9, CT.circleClosed, EASE.move) * CIRCLE_LEN;
  const in3d = prog(t, CT.to3d - 0.1, CT.to3d + 0.35, EASE.move);
  const out3d = prog(t, CT.to2d, CT.to2d + 0.35, EASE.move);
  const video = in3d * (1 - out3d);
  const trail = 1 - prog(t, CT.circleClosed - 0.3, CT.to3d + 0.3, EASE.exit);
  const logo = prog(t, CT.logo, CT.logo + 0.8, EASE.enter);
  const tipAt = search < SEARCH_LEN - 0.5 ? getPointAtLength(SEARCH_PATH, Math.max(0.1, search)) : getPointAtLength(CIRCLE_PATH, Math.max(0.1, Math.min(CIRCLE_LEN - 0.1, circle)));
  // Bildmarken-Ring (Außenradius 19,6 von 40,018 Einheiten) deckt sich mit dem Kreis.
  // Sein Mittelpunkt liegt bei (21,7 | 20,4) in der 40,594 × 40,018-Box, nicht in der Boxmitte.
  const markH = (CT.ringR / 19.6) * 40.018;
  const unit = markH / 40.018;
  return (
    <AbsoluteFill style={{background: C.stage}}>
      <AbsoluteFill style={{opacity: video}}>
        <OffthreadVideo src={staticFile('styles/compass.mp4')} muted />
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={SEARCH_PATH} fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="round" strokeDasharray={SEARCH_LEN} strokeDashoffset={SEARCH_LEN - search} opacity={trail} />
        <path d={CIRCLE_PATH} fill="none" stroke={C.gold} strokeWidth={9} strokeLinecap="round" strokeDasharray={CIRCLE_LEN} strokeDashoffset={CIRCLE_LEN - circle} opacity={(1 - video) * (1 - logo)} />
        <circle cx={tipAt?.x ?? 0} cy={tipAt?.y ?? 0} r={11} fill={C.gold} opacity={t < CT.circleClosed ? 1 : 0} />
      </svg>
      <Message top={470} inAt={CT.line} />
      <div style={{position: 'absolute', left: CX - 21.7 * unit, top: CT.ringCy - 20.4 * unit, opacity: logo, transform: `scale(${lerp(0.94, 1, logo)})`}}>
        <Logo lockup="symbol" height={markH} />
      </div>
      <Grain frame={frame} opacity={0.025} />
    </AbsoluteFill>
  );
};
