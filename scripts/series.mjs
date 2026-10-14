#!/usr/bin/env node
// Baut eine Folge der Serie "Kompass" aus videos/compass-series/episodes/<id>.json:
// Timeline ableiten → 3D-Kompass aufnehmen → Klang → DE/EN rendern → muxen →
// Aussetzer-Check → Kontaktbogen.
//
//   npm run series -- ep01               beide Sprachen, volle Auflösung
//   npm run series -- ep01 --plan        nur Timeline ausgeben, nichts rendern
//   npm run series -- ep01 --draft       halbe Auflösung, ohne Aussetzer-Check
//   npm run series -- ep01 --lang de     nur eine Sprache
//
// Der 3D-Clip wird nur neu aufgenommen, wenn sich die Timeline geändert hat.
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const id = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--lang');
const flag = (k) => argv.includes(`--${k}`);
const langs = argv.includes('--lang') ? [argv[argv.indexOf('--lang') + 1]] : ['de', 'en'];
if (!id) {
  console.error('usage: npm run series -- <episode-id> [--plan] [--draft] [--lang de|en]');
  process.exit(1);
}
const epFile = path.join(ROOT, 'videos/compass-series/episodes', `${id}.json`);
const episode = JSON.parse(fs.readFileSync(epFile, 'utf8'));

// timing.ts / episode.ts sind die Quelle der Komposition — hier dieselben Funktionen.
const cache = path.join(ROOT, 'out/.cache');
fs.mkdirSync(cache, {recursive: true});
const bundled = path.join(cache, 'series-timing.mjs');
await esbuild.build({
  stdin: {contents: "export {seriesTimeline} from './timing'; export {validateEpisode} from './episode';", resolveDir: path.join(ROOT, 'videos/compass-series'), loader: 'ts'},
  bundle: true, platform: 'node', format: 'esm', packages: 'external', outfile: bundled, logLevel: 'error',
});
const {seriesTimeline, validateEpisode} = await import(pathToFileURL(bundled).href + `?v=${Date.now()}`);

const errs = validateEpisode(episode);
if (errs.length) {
  console.error(`${id}: ${errs.join('; ')}`);
  process.exit(1);
}
const tl = seriesTimeline(episode);
const dir = path.join(ROOT, 'out/series', id);
fs.mkdirSync(dir, {recursive: true});
const tlFile = path.join(dir, 'timeline.json');
fs.writeFileSync(tlFile, JSON.stringify(tl, null, 2) + '\n');
const fmt = (x) => x.toFixed(1).padStart(5);
console.log(`${id} · "${episode.title}" · ${tl.duration} s`);
console.log(`  ${fmt(0)}  Hook          ${episode.hook.de}`);
console.log(`  ${fmt(tl.circleClosed)}  Kreis schließt sich → 3D`);
tl.lines.forEach((l, i) => console.log(`  ${fmt(l.in)}  Zeile ${i + 1}       ${episode.lines[i].de}`));
console.log(`  ${fmt(tl.logo)}  Bildmarke`);
console.log(`  ${fmt(tl.claim)}  Endcard       Always on your side. · ${episode.cta.de}`);
console.log(`  → ${path.relative(ROOT, tlFile)}`);
if (flag('plan')) process.exit(0);

const run = (cmd, args, env = {}) => execFileSync(cmd, args, {cwd: ROOT, stdio: 'inherit', env: {...process.env, ...env}});
const pub = path.join(ROOT, 'public/series', id);
fs.mkdirSync(pub, {recursive: true});

// 3D-Kompass: nur neu aufnehmen, wenn die Timeline sich geändert hat.
const clip = path.join(pub, 'compass.mp4');
const stamp = path.join(pub, 'compass.timeline.sha');
const hash = crypto.createHash('sha256').update(JSON.stringify(tl)).digest('hex');
if (!fs.existsSync(clip) || !fs.existsSync(stamp) || fs.readFileSync(stamp, 'utf8') !== hash) {
  const cfg = path.join(dir, 'sim-config.json');
  fs.writeFileSync(cfg, JSON.stringify({duration: tl.duration, timeline: tl}));
  const pw = process.env.PLAYWRIGHT_BROWSERS_PATH;
  const chrome = pw && fs.readdirSync(pw).filter((d) => d.startsWith('chromium-')).map((d) => path.join(pw, d, 'chrome-linux/chrome')).find((p) => fs.existsSync(p));
  run('node', ['sims/build.mjs', 'compass']);
  run('node', ['sims/capture.mjs', 'compass', '--config', cfg, '--size', '1080x1920', '--dpr', '1', '--fps', '30', '--crf', '16', '--out', clip],
    chrome && !process.env.CHROMIUM ? {CHROMIUM: chrome} : {});
  fs.writeFileSync(stamp, hash);
} else {
  console.log('3D-Clip aktuell, keine neue Aufnahme.');
}

const wav = path.join(pub, 'sound.wav');
run('python3', ['-m', 'sfx', 'sfx/cues/compass_series.py', '--timeline', tlFile, '--out', wav]);

for (const lang of langs) {
  const base = path.join(ROOT, 'out/series', `${id}-${lang}`);
  const props = path.join(dir, `props-${lang}.json`);
  fs.writeFileSync(props, JSON.stringify({episode, lang, showSafe: false}));
  const draft = flag('draft') ? ['--scale=0.5', '--crf=26'] : [];
  run('npx', ['remotion', 'render', 'CompassReel', `${base}-silent.mp4`, `--props=${props}`, ...draft]);
  run('ffmpeg', ['-loglevel', 'error', '-y', '-i', `${base}-silent.mp4`, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', `${base}.mp4`]);
  if (!flag('draft')) run('python3', ['scripts/glitch-check.py', `${base}.mp4`]);
  run('node', ['scripts/sheet.mjs', '--video', `${base}.mp4`, '--timeline', tlFile, '--cols', '6', '--rows', '2', '--size', '270', '--name', `${id}-${lang}`]);
  console.log(`→ ${path.relative(ROOT, base)}.mp4`);
}
