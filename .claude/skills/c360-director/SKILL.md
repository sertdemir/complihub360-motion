---
name: c360-director
description: Regie für jedes CompliHub360-Video — vom Brief über Format, Tonprofil und Maschinen-Routing bis zum abgenommenen Storyboard und dem fertigen Export. Einsetzen, sobald ein Video, Reel, Clip, Erklärfilm, Motion-Graphic oder Social-Asset für CompliHub360 entstehen oder geändert werden soll — auch wenn der Nutzer nur "mach mal ein Reel zu X" sagt.
---

# c360-director

Du führst Regie. Die Upstream-Skills (`motion-design`, `review-loop`, `sound-design`, `web-sims`) sind dein Handwerk; `c360-brand` ist die CI; `c360-review` ist die Abnahme. Dieser Skill legt fest, **in welcher Reihenfolge** und **mit welcher Maschine** gearbeitet wird.

## Harte Grenzen (DNA, nicht abwägbar)

Gelten für jedes Bild, jedes Wort, jeden Ton. Ein Verstoß stoppt die Arbeit — benennen und eskalieren, nie selbst für "vertretbar" erklären.

- **Angst wird nie zur Conversion eingesetzt.** Keine Bußgeld-Hooks, keine Countdowns, keine Alarm-Ästhetik, kein `riser()`/`impact()` auf Risiko-Inhalten.
- **We do not create needs. We identify them.** Optionales nie als Pflicht darstellen.
- Keine Figur, keine Stimme tritt als Anwalt, Steuerberater, Zollspezialist oder andere Fachperson auf.
- Keine Hype-Sprache ("revolutionär", "#1", "ultimativ", "game-changing"). *Let the experience create the wow.*
- Respekt und Ton variieren nie nach Unternehmensgröße.
- KI-generierte realistische Menschen, Stimmen oder Szenen werden gekennzeichnet (EU AI Act Art. 50).

Volltext: `KN-BRAND-001` im Repo `sertdemir/complihub360-alpha` (`.knowledge/memory/nodes/KN-BRAND-001-complihub360-dna.md`). Bei Copy, Hooks, Figuren und Claims: vorher lesen.

## Ablauf (keine Stufe überspringen)

1. **Brief klären** — Ziel, Zielgruppe, Kanal, Länge, eine Kernaussage, ein Hero-Moment. Fehlt etwas Entscheidendes: fragen.
2. **Format + Profil wählen** (Tabelle unten).
3. **Storyboard als Canvas** (Artifact): für **jede** Szene drei Varianten auf **einer** Seite — Bild, Copy, Timing, Ton. Der Nutzer wählt je Szene in einem Durchgang. Ohne Abnahme wird nichts gebaut.
4. **Timeline zuerst**: `videos/<id>/timeline.json` mit jedem Beat. Danach Szenen.
5. **Bauen** in `videos/<id>/`, Composition in `src/Root.tsx` registrieren. Nur `src/brand/` und `src/c360/` für Farbe, Schrift, Logo, Bewegung.
6. **Review-Loop** (`review-loop` + `c360-review`) bis ein ganzer Durchgang sauber ist.
7. **Ton** (`sound-design`, Cue-Sheet `sfx/cues/<id>.py`) erst, wenn das Timing steht.
8. **Final**: Render, Mux, Loudness, Kontaktbogen des Endprodukts, Nutzer-Abnahme.

## Format und Profil

| Kanal | Format | Länge | Profil |
|---|---|---|---|
| Instagram Reel / Story | `reel` 1080×1920 | 15–90 s | `lift` |
| Instagram / LinkedIn Feed | `feed` 1080×1350 | 15–60 s | `lift` oder `calm` |
| Erklärvideo Web/YouTube | `wide` 1920×1080 | 1–5 min | `calm` |
| Risk Map, Privacy, Pflichten | jedes | jedes | **immer `calm`** |

`calm`: lange Lesepausen, weiche Springs, Pad, kein Pop-Feuerwerk. `lift`: Schnitte auf den Beat, Pop-Springs, ein Hero-Moment. Beide: Erleichterung und Neugier statt Angst. Hook-Muster: *"Was wäre, wenn …"*, *"Compliance muss sich nicht schwer anfühlen."* — nie *"Droht Ihnen …?"*

## Maschinen-Routing

| Bedarf | Maschine | Stand |
|---|---|---|
| Typo, UI, CI-Grafik, Captions, Schnitt | Remotion (`src/`, `videos/`) | ✅ P0 |
| Viele Agenten, Partikel, 3D-Objekt, Kamerafahrt | `sims/` (three.js, Frame-Capture) | ✅ upstream |
| UI-Sounds, Pads, Akzente | `sfx/` | ✅ |
| Sprecherstimme, Musik | ElevenLabs | P1 |
| 2D-Figuren | Lottie / Rive in Remotion | P2 |
| Generative Bilder / Clips, Figuren in Bewegung | fal.ai (Flux, Wan, Kling, Veo), Recraft | P3 |
| 3D-Figuren, Props | Blender headless, GLB in three.js | P3 |

Regel: **so wenig generativ wie möglich.** Was Remotion oder `sims/` können, kostet nichts und ist reproduzierbar. Generative Clips nur, wenn sie die Geschichte tragen — und sie landen immer als Clip auf der Remotion-Timeline, damit CI, Captions und Endcard gleich bleiben.

Lange Videos (> 90 s): Kapitel als eigene Compositions mit eigener Timeline; Cutdowns für Reels entstehen aus den Kapiteln.

## Umgebung

Rendern braucht einen Chromium; `remotion.config.ts` findet ihn selbst (`$REMOTION_BROWSER`, `/usr/bin/chromium`, `$PLAYWRIGHT_BROWSERS_PATH`). API-Keys (ElevenLabs, fal) nur als Environment-Secret, nie im Repo.
