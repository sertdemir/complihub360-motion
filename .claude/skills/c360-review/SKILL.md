---
name: c360-review
description: Abnahme-Checkliste für CompliHub360-Videos — ergänzt den upstream review-loop um DNA-Prüfung (Angst, Hype, Fachperson-Anmaßung), CI-Treue, Instagram-Tauglichkeit (Thumbnail, Safe Zones, stumm lesbar) und KI-Kennzeichnung. Einsetzen vor jeder Aussage, ein Video sei fertig, und nach jeder Änderung an Copy, Figuren oder Ton.
---

# c360-review

Erst `review-loop` (Kontaktbögen, Technik-Checkliste), dann diese Liste. Ein Video ist erst fertig, wenn beide durch sind und der Nutzer abgenommen hat.

## Befehle

```bash
npm run reel:draft && npm run reel:sheet     # Kontaktbogen, 1 Bild/s
node scripts/sheet.mjs --video <mp4> --timeline videos/<id>/timeline.json   # pro Beat
node scripts/sheet.mjs ... --from 10 --to 12 --every 0.2                    # Übergang scrubben
npm run reel:safe                             # Safe-Zone-Overlay
node scripts/wave.mjs <mp4> --timeline ...    # Ton auf den Beats, Loudness
```

## 1 · DNA (Blocker — ein Treffer stoppt)

- [ ] Kein Frame, kein Wort, kein Ton erzeugt Angst oder Druck (Bußgeld, Frist, "drohen", Alarm-Rot, Countdown, Riser/Impact auf Risiko).
- [ ] Nichts Optionales wird als Pflicht dargestellt.
- [ ] Keine Hype-Wörter, keine Superlative ohne Beleg.
- [ ] Keine Figur/Stimme gibt sich als Anwalt, Steuerberater oder andere Fachperson aus.
- [ ] Unsicherheit wird nicht hinter selbstsicherer Sprache versteckt.
- [ ] Ton und Respekt wären für ein Ein-Personen-Unternehmen dieselben wie für einen Konzern.
- [ ] Decision-Filter-Frage: *Würde der Zuschauer danach fühlen, dass CompliHub360 auf seiner Seite steht?*

Treffer → nicht selbst auflösen. Stelle und Filterpunkt benennen, Nutzer fragen.

## 2 · CI

- [ ] Nur Werte aus `src/brand/` (kein Hex, keine Kurve im Szenencode — `grep -n "#[0-9a-fA-F]\{6\}" videos/`).
- [ ] Gold markiert genau die Pointe des Frames.
- [ ] Logo-Geometrie unverändert, Claim nur ab ~90 px.
- [ ] Der Gradient ist der Gradient — keine Variante.

## 3 · Instagram

- [ ] **Frame 0 ist ein starkes Bild** (Thumbnail): Marke + Kernaussage sichtbar.
- [ ] Alles Wichtige in der Safe Zone (`npm run reel:safe`).
- [ ] Ohne Ton verständlich (Reels laufen stumm) — Sprechertext immer als Caption.
- [ ] Kernaussage auf 360 px Breite lesbar.
- [ ] Endcard steht ≥ 2 s.

## 4 · KI-Kennzeichnung

- [ ] Enthält das Video KI-generierte realistische Menschen, geklonte/synthetische Stimmen oder fotorealistische generierte Szenen? → Kennzeichnung im Video (Lower Third oder Endcard) **und** im Post-Text. Lieber großzügig: für eine Compliance-Marke ist das Glaubwürdigkeit.
- [ ] Rechte an jedem Asset geklärt (Modell-Lizenz kommerziell, Musik, Fonts). Quelle in `videos/<id>/CREDITS.md`.

## Bericht

Was geprüft, was gefunden, was behoben, welcher Kontaktbogen es zeigt. Keine Behebung behaupten, die nicht neu gerendert und angesehen wurde.
