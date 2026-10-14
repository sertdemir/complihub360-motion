#!/usr/bin/env node
// Erzeugt das Punkteraster der Landflächen für den Punktglobus (src/c360/DotGlobe.tsx).
// Quelle: Natural Earth 1:110m über world-atlas (gemeinfrei). Nur bei Bedarf neu laufen lassen:
//   node scripts/globe-dots.mjs [abstand-in-grad]
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {feature} from 'topojson-client';
import {geoContains} from 'd3-geo';

const require = createRequire(import.meta.url);
const land = feature(require('world-atlas/land-110m.json'), 'land');
const step = Number(process.argv[2] ?? 1.8);
const dots = [];
for (let lat = -58; lat <= 82; lat += step) {
  // gleiche Abstände auf der Kugel: Längenschritt mit 1/cos(Breite) strecken
  const dLon = step / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  for (let lon = -180; lon < 180; lon += dLon) {
    if (geoContains(land, [lon, lat])) dots.push([Math.round(lon * 10) / 10, Math.round(lat * 10) / 10]);
  }
}
fs.writeFileSync(new URL('../src/brand/globe-dots.json', import.meta.url), JSON.stringify(dots));
console.log(`${dots.length} Landpunkte, Abstand ${step}°`);
