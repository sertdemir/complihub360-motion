# Serie "Kompass"

Vorlage für Reels mit einer Aussage (1080×1920, 16–30 s), aus der Kombi-Probe
*"Die Linie findet den Kompass"* (videos/styles, 2026-10-11).

## Eine neue Folge

1. `episodes/<id>.json` anlegen (Vorbild `ep01.json`):

   ```json
   {
     "id": "ep02",
     "title": "Arbeitstitel",
     "hook":  {"de": "…", "en": "…"},
     "lines": [{"de": "…", "en": "…"}],
     "cta":   {"de": "Link in der Bio", "en": "Link in bio"}
   }
   ```

   - Hook steht ab Frame 0 — er ist das Vorschaubild im Feed.
   - 1–3 Zeilen; die letzte ist die Pointe und bleibt bis zur Bildmarke.
   - Je Zeile höchstens ein `*Akzent*` (Gold, kursiv). Video-Copy siezt.
   - DNA: keine Angst, keine Dringlichkeit, kein Hype, Optionales nie als Pflicht.

2. `npm run series -- <id> --plan` — zeigt die abgeleitete Timeline.
3. `npm run series -- <id> --draft` — Draft DE + EN, Kontaktbögen in `out/sheets/`.
4. Abnahme, dann `npm run series -- <id>` — final nach `out/series/<id>-de.mp4` / `-en.mp4`.

## Was wo liegt

| Datei | Rolle |
|---|---|
| `episode.ts` | Format einer Folge + Prüfung (Zeilenzahl, Texte, ein Akzent) |
| `timing.ts` | Timeline aus dem Text — Lesepausen nach `PROFILE.calm`, eine Timeline für beide Sprachen |
| `CompassReel.tsx` | Komposition `CompassReel` (Props: `episode`, `lang`, `showSafe`) |
| `../../sims/compass/` | 3D-Kompass; liest die Timeline aus der Capture-Config |
| `../../sfx/cues/compass_series.py` | Zen-Klang, ein Schlegel je Zeile |
| `../../scripts/series.mjs` | Build: Timeline → 3D-Aufnahme (nur bei Änderung) → Klang → Render → Mux → Checks |

3D-Clip und Klang landen in `public/series/<id>/` (nicht im Repo, jederzeit neu erzeugbar).
