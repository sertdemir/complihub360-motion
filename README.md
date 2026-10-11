# complihub360-motion

Video- und Motion-Produktion für **CompliHub360** — Instagram-Reels, Marketing-Clips und Erklärvideos von 15 Sekunden bis 5 Minuten, gebaut von Claude, immer in der CI und immer innerhalb der Marken-DNA.

Basis ist [claude-motion](https://github.com/whaleyxbt/claude-motion) (MIT, Original-README unter [`docs/claude-motion-README.md`](docs/claude-motion-README.md)): Remotion für Motion-Graphics, ein frame-genauer Sim-Renderer für 3D und Simulationen, eine Klangmaschine ohne Samples und ein Review-Loop, in dem der Agent seine eigenen Frames prüft. Darüber liegt die CompliHub-Schicht:

- **Brand-Layer** (`src/brand/`) — Farben und Schriften aus Compass, der Gradient, Formate mit Instagram-Safe-Zones, Motion-Tokens mit zwei Tonprofilen (`calm`, `lift`).
- **Bausteine** (`src/c360/`) — animiertes Logo mit drehendem Globus, Endcard, Hintergrund, Wort-für-Wort-Zeilen, Safe-Zone-Overlay.
- **Skills** (`.claude/skills/c360-*`) — Regie, CI, Abnahme mit DNA-Prüfung.
- **Vorlagen** (`videos/`) — `reel-template`: 15-s-Reel, 9:16.

## Start

```bash
npm install
npm run check          # Typen + Tokens
npm run reel:build     # → out/reel-template.mp4
npm run studio         # Live-Vorschau
```

Voraussetzungen: Node 20+, Python 3, ffmpeg, ein Chromium (wird automatisch gefunden: `$REMOTION_BROWSER`, `/usr/bin/chromium` oder Playwright-Chromium).

## Ein Video beauftragen

```text
Nutze c360-director. Ich brauche ein 20-s-Reel zu <Thema> für Instagram.
Kernaussage: <ein Satz>. Erst das Storyboard als Canvas, drei Varianten je Szene.
```

## Struktur

```
.claude/skills/c360-*     Regie, CI, Abnahme (CompliHub)
.claude/skills/*          motion-design, review-loop, sound-design, web-sims (upstream)
brand/compass-tokens.json Kopie der Compass-Tokens aus complihub360-alpha
src/brand/                brand.ts (C, GRADIENT, F, TYPE, FORMATS, EASE, SPRING, PROFILE), Logo-Geometrie
src/c360/                 Logo, EndCard, Backdrop, KineticLine, SafeArea, SafeZones
videos/<id>/              je Video: Komposition + timeline.json
sfx/cues/<id>.py          je Video: Cue-Sheet
sims/                     Web-Sims → 60-fps-Video (upstream)
docs/ROADMAP.md           Phasen und Tool-Stack mit Preisen
```

## Upstream

`upstream` zeigt auf claude-motion. Neuerungen übernehmen: `git fetch upstream && git merge upstream/main`. Die CompliHub-Schicht liegt in eigenen Ordnern und berührt nur wenige Upstream-Dateien (`src/Root.tsx`, `src/index.ts`, `remotion.config.ts`, `package.json`, `tsconfig.json`).

## Lizenzen

Code von claude-motion: MIT (siehe `LICENSE`). Remotion: frei bis 3 Personen, darüber Company License. Logo, Marke und Compass-Tokens: © CompliHub360, nicht Teil der MIT-Lizenz.
