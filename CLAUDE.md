# complihub360-motion — Projektkontext für Claude

Video- und Motion-Produktion für **CompliHub360**: Instagram-Reels, Marketing-Clips, Erklärvideos (15 s bis 5 min). Fork von [claude-motion](https://github.com/whaleyxbt/claude-motion) (MIT). Dessen Mechanik steht in `AGENTS.md` (unten eingebunden), dessen Skills unter `.claude/skills/` (`motion-design`, `review-loop`, `sound-design`, `web-sims`).

**Starte jede Video-Aufgabe mit dem Skill `c360-director`.** Er legt Ablauf, Format, Tonprofil und Maschine fest; `c360-brand` ist die CI, `c360-review` die Abnahme. Wo `AGENTS.md` und diese Datei sich widersprechen (Palette `C`/`F` in `src/lib.ts`, Coral-Akzent, Instrument Serif), gilt diese Datei — das sind Werte des Upstream-Beispiels, nicht unsere.

## Die DNA gilt immer

CompliHub360 verkauft **Vertrauen**. Vor jeder Entscheidung, die ein Zuschauer spürt:

> **Does this make the viewer feel that CompliHub360 is always on their side?**

Harte Grenzen — Blocker, nicht abwägbar:

- **Angst wird nie zur Conversion eingesetzt.** Keine Bußgeld-Hooks, keine Dringlichkeit als Taktik.
- **We do not create needs. We identify them.** Optionales nie als Pflicht.
- Keine Figur und keine Stimme gibt sich als Anwalt, Steuerberater, Zollspezialist oder andere Fachperson aus.
- Unsicherheit nie hinter selbstsicherer Sprache verstecken.
- Respekt und Ton variieren nie nach Unternehmensgröße.
- Keine Hype-Sprache. *Let the experience create the wow.*
- KI-generierte realistische Menschen, Stimmen, Szenen werden gekennzeichnet.

Bei Copy, Hooks, Figuren, Claims: vorher `KN-BRAND-001` lesen (Repo `sertdemir/complihub360-alpha`, `.knowledge/memory/nodes/KN-BRAND-001-complihub360-dna.md`). Einen DNA-Konflikt **nie selbst auflösen** — benennen und den Nutzer fragen.

Subagenten erben diese Datei nicht zuverlässig: Wer delegiert, gibt die harten Grenzen im Prompt mit.

## Trennung

- Dieses Repo ist **ausschließlich CompliHub360**. Keine Assets oder Arbeit anderer Unternehmen hier ablegen.
- Keine Kundendaten, keine echten personenbezogenen Daten in Videos oder im Repo — auch nicht in Demo-Screens.
- API-Keys (ElevenLabs, fal, …) nur als Environment-Secret, nie im Repo.

## Arbeitsweise

- Storyboard zuerst als **Canvas** (Artifact) mit drei Varianten je Szene; gebaut wird erst nach Abnahme.
- Jede Zeit steht in `videos/<id>/timeline.json`. Keine festen Zeitpunkte in Komponenten oder Cue-Sheets.
- Farben, Schriften, Logo, Bewegung nur aus `src/brand/` und `src/c360/`.
- Nie "fertig" melden ohne angesehene Kontaktbögen des aktuellen Renders (`review-loop` + `c360-review`).
- Ansprache im Chat: **du**. Video-Copy siezt.

## Befehle

```bash
npm run check          # tsc + Tokens aktuell?
npm run studio         # Live-Vorschau
npm run reel:draft     # halbe Auflösung → out/reel-draft.mp4
npm run reel:sheet     # Kontaktbogen
npm run reel:safe      # Safe-Zone-Overlay
npm run reel:build     # Ton + Render + Mux + Loudness → out/reel-template.mp4
npm run tokens:sync -- --from ../complihub360-alpha/apps/vs1-demo/ui/tokens.json
```

Remotion ist frei bis 3 Personen im Unternehmen; ab der 4. Person braucht es eine Company License. Roadmap und Tool-Stack: `docs/ROADMAP.md`.

---

@AGENTS.md
