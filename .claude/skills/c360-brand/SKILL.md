---
name: c360-brand
description: CompliHub360-CI für Video — Compass-Farben, der Gradient, Schriften, Logo-Animation, Endcard, Formate mit Instagram-Safe-Zones und Motion-Tokens (Easing, Springs, Tonprofile calm/lift). Einsetzen bei jeder Gestaltungsentscheidung in einem CompliHub360-Video und beim Aktualisieren der Tokens aus Compass.
---

# c360-brand

Alles Visuelle kommt aus `src/brand/brand.ts`. Komponenten schreiben **keine** Hex-Werte, Bezier-Kurven oder Schriftnamen selbst.

## Quellen

| Datei | Inhalt | Pflege |
|---|---|---|
| `brand/compass-tokens.json` | Kopie von `apps/vs1-demo/ui/tokens.json` aus `complihub360-alpha` | `npm run tokens:sync -- --from <pfad>` |
| `src/brand/tokens.gen.ts` | daraus generiert | nie von Hand; `npm run tokens:check` |
| `src/brand/brand.ts` | `C`, `GRADIENT`, `F`, `TYPE`, `FORMATS`, `EASE`, `SPRING`, `PROFILE` | hier |
| `src/brand/logo-paths.ts`, `globe-*.ts` | Logo-Geometrie aus Compass (Figma 2101:1151) | 1:1 aus dem Produkt-Repo |

## Farbe

- Flächen: **der Gradient** (`GRADIENT`, Festlegung 2026-08-25 — genau diese Kombination, keine Varianten) oder **Petrol** (`C.petrol` → `C.petrolDeep`) für Endcard und Kontrast.
- Text: `C.ink` auf hell, `C.onPetrol` auf Petrol. Display in `C.petrol`.
- **Gold ist der eine Akzent** und markiert die Pointe — ein Wort pro Zeile (`*wort*` in `KineticLine`), ein Haken, ein Punkt. Text-Gold: `C.goldOnLight` (hell) / `C.goldOnPetrol` (Petrol); `C.gold` nur für Flächen und Marke.
- Rot/Warning gibt es im Video nicht als Stilmittel. Wo Risiko-Stufen gezeigt werden müssen, gelten die Compass-Statusfarben der Risk Map — sachlich, nie dramatisiert.

## Schrift

IBM Plex Serif (Display, 500), Inter (UI), IBM Plex Mono (Labels) — aus Compass. Stufen in `TYPE`: `hero` 124 px, `display` 96, `title` 56, `body` 40, `caption` 44, `label` 24 (bei 1080 px Breite). Handy-Test: Kernaussage muss auf einer 360 px breiten Kachel lesbar sein.

## Logo

`<Logo lockup="symbol"|"stacked" tone="on-light"|"on-petrol" height start />`. Mit `start` läuft es ein (Ring dreht ein, Bogen steigt, Schwung wischt, Wortmarke, Claim); ohne `start` steht es. Der Globus dreht wie im Produkt (25 s pro Umlauf), aber frame-genau. Claim erst ab ~90 px Logo-Höhe.

## Endcard

`<EndCard start origin line? />` — Petrol-Iris aus einem Objekt im Bild (`origin`), Logo mit Claim. `line` nur für ruhige Information (URL, "Mehr im Profil") — nie Druck, nie Countdown. Mindest-Standzeit 2 s.

## Formate & Safe Zones

`FORMATS.reel` 1080×1920 (oben 250, unten 380, links 60, rechts 120 frei), `feed` 1080×1350, `square`, `wide` 1920×1080. Inhalte in `<SafeArea format>`; prüfen mit `npm run reel:safe` (rotes Overlay = verdeckt).

## Bewegung

- `EASE.enter` = (0.22, 1, 0.36, 1) — dieselbe Kurve wie das Produkt-UI. `exit` halb so lang wie `enter`. `move` für Zustandswechsel, `land` für Werte, die ankommen.
- `SPRING.settle` (ruhig), `panel` (Flächen), `pop` (Haken, Badges — nur `lift`).
- `PROFILE.calm` / `PROFILE.lift`: Stagger, Ein-/Ausstieg, Lesepausen. `holdFor(text, profile)` rechnet die Mindest-Standzeit.
- Die Motion-Tokens sind ein **Vorschlag für Compass** — dort gibt es noch keine Motion-Variablen. Ändert sich Compass, folgt dieses File.

## Textur

Feines `Grain` (≈ 0.035, hell braucht weniger als dunkel), driftendes Punktraster im `Backdrop`, Glow aus dem Zustand (`glow`), nicht aus der Uhr. Kein Line-Boil/Sketch-Look — der verträgt sich nicht mit Vertrauen.
