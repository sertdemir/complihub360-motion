import fs from 'node:fs';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(16);
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
