import React, {useMemo} from 'react';
import {AbsoluteFill, CalculateMetadataFunction, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {C, EASE, lerp, PROFILE, prog, TYPE} from '../../src/brand/brand';
import {EndCardClaim} from '../../src/c360/EndCardClaim';
import {Logo} from '../../src/c360/Logo';
import {KineticLine, SafeZones} from '../../src/c360/Text';
import {Grain} from '../../src/components/primitives';
import type {Episode, Lang} from './episode';
import {seriesTimeline} from './timing';

// ─── Serie "Kompass" · Vorlage (aus der Kombi-Probe, 2026-10-11) ─────────────
// Ablauf jeder Folge: Hook steht ab Frame 0 über einem ruhenden Kreis → die
// Linie sucht und zeichnet den Kreis nach → der 3D-Kompass übernimmt, kippt in
// den Raum, die Nadel kommt zur Ruhe, die Zeilen der Folge erscheinen →
// zurück in die Draufsicht, der Kreis wird Bildmarke → Endcard mit Claim + CTA.
// Der 3D-Clip (public/series/<id>/compass.mp4) wird je Folge von
// scripts/series.mjs aus derselben Timeline aufgenommen.

export type CompassReelProps = {episode: Episode; lang: Lang; showSafe: boolean};

const CX = 540;
const TEXT_TOP = 300;

export const calculateCompassMetadata: CalculateMetadataFunction<CompassReelProps> = ({props}) => {
  const tl = seriesTimeline(props.episode);
  return {durationInFrames: Math.round(tl.duration * tl.fps), fps: tl.fps};
};

const Line: React.FC<{text: string; inAt: number; outAt?: number}> = ({text, inAt, outAt}) => (
  <div style={{position: 'absolute', top: TEXT_TOP, left: 60, width: 900}}>
    <KineticLine text={text} inAt={inAt} outAt={outAt} profile="calm" style={{...TYPE.display, color: C.petrol}} />
  </div>
);

export const CompassReel: React.FC<CompassReelProps> = ({episode, lang, showSafe}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const tl = useMemo(() => seriesTimeline(episode), [episode]);
  const {ringR, ringCy} = tl;

  // Suchlinie im freien Band zwischen Text und Kreis, mündet rechts tangential in den Kreis.
  const search = 'M -60 830 C 70 730, 170 900, 290 810 C 390 735, 360 870, 480 850 C 610 828, 620 730, 730 765 C 860 805, 885 1040, 840 1180';
  const circle = `M ${CX + ringR} ${ringCy} A ${ringR} ${ringR} 0 1 1 ${CX - ringR} ${ringCy} A ${ringR} ${ringR} 0 1 1 ${CX + ringR} ${ringCy}`;
  const SL = useMemo(() => getLength(search), [search]);
  const CL = useMemo(() => getLength(circle), [circle]);

  const s = prog(t, tl.line, tl.circleClosed - 0.9, EASE.move) * SL;
  const c = prog(t, tl.circleClosed - 0.9, tl.circleClosed, EASE.move) * CL;
  const video = prog(t, tl.to3d - 0.1, tl.to3d + 0.35, EASE.move) * (1 - prog(t, tl.to2d, tl.to2d + 0.35, EASE.move));
  const trail = 1 - prog(t, tl.circleClosed - 0.3, tl.to3d + 0.3, EASE.exit);
  const logo = prog(t, tl.logo, tl.logo + 0.8, EASE.enter);
  const tip = s < SL - 0.5 ? getPointAtLength(search, Math.max(0.1, s)) : getPointAtLength(circle, Math.max(0.1, Math.min(CL - 0.1, c)));
  // Bildmarken-Ring (Außenradius 19,6 von 40,018 Einheiten) deckt sich mit dem Kreis;
  // sein Mittelpunkt liegt bei (21,7 | 20,4) in der 40,594 × 40,018-Box.
  const markH = (ringR / 19.6) * 40.018;
  const unit = markH / 40.018;
  // Hook ist in Frame 0 schon ganz da: Einlauf liegt vor dem ersten Frame.
  const hook = episode.hook[lang];
  const hookIn = -(PROFILE.calm.enter + (hook.split(' ').length - 1) * PROFILE.calm.stagger);

  return (
    <AbsoluteFill style={{background: C.stage}}>
      <AbsoluteFill style={{opacity: video}}>
        <OffthreadVideo src={staticFile(`series/${episode.id}/compass.mp4`)} muted />
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {/* ruhender Kreis: Vorschaubild und Versprechen, dass die Linie ankommt */}
        <circle cx={CX} cy={ringCy} r={ringR} fill="none" stroke={C.gold} strokeWidth={3} opacity={0.28 * (1 - video) * (1 - logo)} />
        <path d={search} fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="round" strokeDasharray={SL} strokeDashoffset={SL - s} opacity={trail} />
        <path d={circle} fill="none" stroke={C.gold} strokeWidth={9} strokeLinecap="round" strokeDasharray={CL} strokeDashoffset={CL - c} opacity={(1 - video) * (1 - logo)} />
        <circle cx={tip?.x ?? 0} cy={tip?.y ?? 0} r={11} fill={C.gold} opacity={t > tl.line && t < tl.circleClosed ? 1 : 0} />
      </svg>
      <Line text={hook} inAt={hookIn} outAt={tl.hookOut} />
      {episode.lines.map((l, i) => (
        <Line key={i} text={l[lang]} inAt={tl.lines[i].in} outAt={i === episode.lines.length - 1 ? tl.logo : tl.lines[i].out} />
      ))}
      <div style={{position: 'absolute', left: CX - 21.7 * unit, top: ringCy - 20.4 * unit, opacity: logo, transform: `scale(${lerp(0.94, 1, logo)})`}}>
        <Logo lockup="symbol" height={markH} />
      </div>
      <Grain frame={frame} opacity={0.025} />
      <EndCardClaim start={tl.claim} cta={episode.cta[lang]} origin={{x: (CX / 1080) * 100, y: (ringCy / 1920) * 100}} />
      {showSafe ? <SafeZones format="reel" /> : null}
    </AbsoluteFill>
  );
};
