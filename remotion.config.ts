import fs from 'node:fs';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(16);
// Ein Render-Tab. Mit mehreren parallelen Tabs malt Chromium in der Cloud-
// Umgebung (4 Kerne, keine GPU) bei voller Auflösung einzelne 256-px-Kacheln
// nicht aus — gemessen 2026-10-11: concurrency 2 → 237 von 450 Frames mit
// weißen/schwarzen Kacheln, concurrency 1 → 0. Kostet ~20 % Zeit.
// Jeder Build prüft das Ergebnis mit scripts/glitch-check.py.
Config.setConcurrency(1);
Config.setPixelFormat('yuv420p');

// Without a system browser Remotion downloads its own headless Chrome on first render.
// Cloud-Sessions (claude.ai/code) sperren diesen Download; dort liegt Chromium
// unter $PLAYWRIGHT_BROWSERS_PATH und wird hier automatisch gefunden.
const pwChrome = () => {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !fs.existsSync(base)) return null;
  const dir = fs.readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
  return dir ? `${base}/${dir}/chrome-linux/chrome` : null;
};
const browser = [process.env.REMOTION_BROWSER, '/usr/bin/chromium', pwChrome()].find(
  (b): b is string => !!b && fs.existsSync(b),
);
if (browser) {
  Config.setBrowserExecutable(browser);
  Config.setChromeMode('chrome-for-testing');
}
