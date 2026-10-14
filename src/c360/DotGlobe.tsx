import React, {useMemo} from 'react';
import {C, clamp01, EASE, prog} from '../brand/brand';
import DOTS from '../brand/globe-dots.json';

// ─── Punktglobus (nach der MakerMap-Referenz, 2026-10-14) ────────────────────
// Landflächen als Punkteraster (Natural Earth 1:110m, scripts/globe-dots.mjs),
// orthografisch projiziert und je Frame neu gerechnet — reine Funktion der
// Blickrichtung. Märkte erscheinen als Gold-Punkte, Verbindungen als Großkreis-
// Bögen. Gold markiert Orientierung, nie Gefahr: keine roten Punkte, kein Blinken.

const RAD = Math.PI / 180;

export type GlobeMarket = {code: string; lon: number; lat: number; at: number};

type P = {x: number; y: number; z: number};
const project = (lon: number, lat: number, lon0: number, lat0: number, r: number): P => {
  const l = (lon - lon0) * RAD;
  const p = lat * RAD;
  const p0 = lat0 * RAD;
  const cp = Math.cos(p);
  return {
    x: r * cp * Math.sin(l),
    y: -r * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * cp * Math.cos(l)),
    z: Math.sin(p0) * Math.sin(p) + Math.cos(p0) * cp * Math.cos(l),
  };
};

/** Großkreis zwischen zwei Punkten, leicht über die Oberfläche gehoben. */
const arc = (a: GlobeMarket, b: GlobeMarket, lon0: number, lat0: number, r: number, k: number) => {
  const toV = (m: GlobeMarket) => [Math.cos(m.lat * RAD) * Math.cos(m.lon * RAD), Math.cos(m.lat * RAD) * Math.sin(m.lon * RAD), Math.sin(m.lat * RAD)];
  const [va, vb] = [toV(a), toV(b)];
  const om = Math.acos(Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  const n = 24;
  const pts: string[] = [];
  for (let i = 0; i <= Math.round(n * k); i++) {
    const s = i / n;
    const f1 = Math.sin((1 - s) * om) / Math.sin(om);
    const f2 = Math.sin(s * om) / Math.sin(om);
    const v = [0, 1, 2].map((j) => f1 * va[j] + f2 * vb[j]);
    const lat = Math.asin(v[2]) / RAD;
    const lon = Math.atan2(v[1], v[0]) / RAD;
    const lift = 1 + 0.09 * Math.sin(Math.PI * s);
    const q = project(lon, lat, lon0, lat0, r * lift);
    pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`);
  }
  return pts.join(' ');
};

export const DotGlobe: React.FC<{
  size: number;
  t: number;
  lon0: number;
  lat0: number;
  markets?: GlobeMarket[];
  /** Bögen vom ersten Markt zu allen weiteren, je ab `at` des Ziels. */
  arcs?: boolean;
  /** >1 zoomt in die Kugel hinein; der Rahmen (Kreis der Größe `size`) bleibt. */
  zoom?: number;
}> = ({size, t, lon0, lat0, markets = [], arcs = true, zoom = 1}) => {
  const r = (size / 2 - 6) * zoom;
  const dotR = (size / 420) * Math.sqrt(zoom);
  const half = size / 2;
  const pts = useMemo(() => DOTS as [number, number][], []);
  const visible: {x: number; y: number; z: number}[] = [];
  for (const [lon, lat] of pts) {
    const q = project(lon, lat, lon0, lat0, r);
    if (q.z > 0.02 && Math.abs(q.x) < half + 4 && Math.abs(q.y) < half + 4) visible.push(q);
  }
  const [home, ...targets] = markets;
  return (
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{display: 'block'}}>
      {visible.map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={dotR * (0.55 + 0.45 * Math.sqrt(q.z))} fill={C.petrol} opacity={0.12 + 0.42 * q.z} />
      ))}
      {arcs && home
        ? targets.map((m) => {
            const k = prog(t, m.at - 0.15, m.at + 0.75, EASE.move);
            return k > 0 ? (
              <polyline key={m.code} points={arc(home, m, lon0, lat0, r, k)} fill="none" stroke={C.gold} strokeWidth={size / 160} strokeLinecap="round" opacity={0.9} />
            ) : null;
          })
        : null}
      {markets.map((m) => {
        const q = project(m.lon, m.lat, lon0, lat0, r);
        if (q.z <= 0) return null;
        const k = clamp01(prog(t, m.at, m.at + 0.45, EASE.enter));
        const pulse = t > m.at ? ((t - m.at) % 1.6) / 1.6 : 0;
        const s = size / 46;
        const label = clamp01((zoom - 1.4) / 0.6) * k;
        return (
          <g key={m.code} transform={`translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`} opacity={k}>
            <circle r={s * (1 + 2.2 * pulse)} fill="none" stroke={C.gold} strokeWidth={size / 400} opacity={(1 - pulse) * 0.7} />
            <circle r={s * k} fill={C.gold} stroke="#f8fafa" strokeWidth={size / 260} />
            <text x={0} y={-s * 1.9} textAnchor="middle" opacity={label} style={{fontFamily: 'Inter Variable, Inter, sans-serif', fontWeight: 600, fontSize: size / 24, fill: C.petrolDeep}}>{m.code}</text>
          </g>
        );
      })}
    </svg>
  );
};
