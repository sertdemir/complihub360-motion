// Compass-Tokens → src/brand/tokens.gen.ts
//
// Quelle ist brand/compass-tokens.json, eine Kopie von apps/vs1-demo/ui/tokens.json
// aus sertdemir/complihub360-alpha (dort der Spiegel der ausgelieferten Werte).
// Videos lesen Farben und Schriften NUR aus der generierten Datei, nie als Hex im
// Komponentencode. Aktualisieren:
//
//   npm run tokens:sync -- --from ../complihub360-alpha/apps/vs1-demo/ui/tokens.json
//   npm run tokens:sync              # nur neu generieren
//   npm run tokens:sync -- --check   # rot, wenn tokens.gen.ts veraltet ist
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const jsonPath = path.join(root, 'brand/compass-tokens.json');
const outPath = path.join(root, 'src/brand/tokens.gen.ts');

const args = process.argv.slice(2);
const from = args.includes('--from') ? args[args.indexOf('--from') + 1] : null;
if (from) fs.copyFileSync(path.resolve(from), jsonPath);

const t = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Semantische Farben: {light, dark} → beide Modi getrennt.
const mode = (node, m) =>
  Object.fromEntries(
    Object.entries(node).map(([k, v]) =>
      v && typeof v === 'object' && !('light' in v) ? [k, mode(v, m)] : [k, v?.[m] ?? v],
    ),
  );

const out = {
  source: t.$meta?.source ?? 'Compass',
  generated: t.$meta?.generated ?? null,
  primitives: t.primitives,
  light: mode(t.color.color ?? t.color, 'light'),
  dark: mode(t.color.color ?? t.color, 'dark'),
  typography: t.typography,
  radius: t.radius,
};

const body =
  '// GENERIERT von scripts/sync-tokens.mjs aus brand/compass-tokens.json. Nicht von Hand ändern.\n' +
  `export const COMPASS = ${JSON.stringify(out, null, 2)} as const;\n`;

if (args.includes('--check')) {
  const cur = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
  if (cur !== body) {
    console.error('tokens.gen.ts ist veraltet: npm run tokens:sync');
    process.exit(1);
  }
  console.log('tokens.gen.ts aktuell');
} else {
  fs.writeFileSync(outPath, body);
  console.log(`→ ${path.relative(root, outPath)} (Compass ${out.generated})`);
}
