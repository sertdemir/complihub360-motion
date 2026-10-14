import {holdFor, PROFILE} from '../../src/brand/brand';
import type {Episode} from './episode';

// Timeline einer Folge, abgeleitet aus dem Text. Eine Timeline für beide
// Sprachen (je Zeile zählt die längere Fassung), damit 3D-Clip und Klang
// geteilt werden. Genutzt von der Komposition (calculateMetadata) und von
// scripts/series.mjs (3D-Aufnahme, Cue-Sheet, Kontaktbögen).

export const FPS = 30;
// Geometrie der Draufsicht: der goldene Ring des 3D-Kompasses, in px auf 1080×1920.
export const RING = {r: 300, cy: 1180} as const;

export type SeriesTimeline = {
  fps: number;
  duration: number;
  ringR: number;
  ringCy: number;
  hookOut: number;
  line: number;
  circleClosed: number;
  to3d: number;
  tiltStart: number;
  tiltEnd: number;
  needle: number;
  lines: {in: number; out: number}[];
  backStart: number;
  backEnd: number;
  to2d: number;
  logo: number;
  claim: number;
};

const r2 = (x: number) => Math.round(x * 100) / 100;
const words = (s: string) => s.trim().split(/\s+/).length;

/** Sekunden, die eine Zeile vom ersten Wort bis zum Beginn des Ausblendens steht. */
const onScreen = (pair: {de: string; en: string}) => {
  const p = PROFILE.calm;
  const longer = words(pair.de) >= words(pair.en) ? pair.de : pair.en;
  return (words(longer) - 1) * p.stagger + p.enter + holdFor(longer, 'calm');
};

export const seriesTimeline = (ep: Episode): SeriesTimeline => {
  const p = PROFILE.calm;
  // Hook steht ab Frame 0; die Linie sucht darunter und schließt den Kreis.
  const hookOut = Math.max(2.8, holdFor(ep.hook.de.length > ep.hook.en.length ? ep.hook.de : ep.hook.en, 'calm') + 1.2);
  const line = 0.4;
  const circleClosed = hookOut + 0.5;
  const to3d = circleClosed;
  const tiltStart = to3d + 0.5;
  const tiltEnd = tiltStart + 1.5;
  const needle = tiltStart + 1.2;
  const lines: {in: number; out: number}[] = [];
  let t = tiltStart + 0.4;
  for (const l of ep.lines) {
    const out = t + onScreen(l);
    lines.push({in: r2(t), out: r2(out)});
    t = out + p.exit + 0.25;
  }
  const backStart = lines[lines.length - 1].out + 0.2;
  const backEnd = backStart + 1.0;
  const logo = backEnd + 0.2;
  const claim = logo + 1.6;
  const duration = Math.ceil(claim + 5.4);
  return {
    fps: FPS,
    duration,
    ringR: RING.r,
    ringCy: RING.cy,
    hookOut: r2(hookOut),
    line,
    circleClosed: r2(circleClosed),
    to3d: r2(to3d),
    tiltStart: r2(tiltStart),
    tiltEnd: r2(tiltEnd),
    needle: r2(needle),
    lines,
    backStart: r2(backStart),
    backEnd: r2(backEnd),
    to2d: r2(backEnd),
    logo: r2(logo),
    claim: r2(claim),
  };
};
