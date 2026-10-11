# Roadmap & Tool-Stack

Stand: 2026-10-11. Preise aus einer Web-Recherche am selben Tag, überwiegend aus Drittquellen — vor einem Abo beim Anbieter gegenprüfen.

## Phasen

| Phase | Ergebnis | Status |
|---|---|---|
| **P0 Fundament** | Repo, Brand-Layer aus Compass, Motion-Tokens, Logo-Animation, Endcard, Safe Zones, Reel-Vorlage 15 s (`lift`), Skills `c360-director` / `c360-brand` / `c360-review` | ✅ |
| **P1 Stimme** | ElevenLabs (MCP), Aussprache-Wörterbuch, Timeline aus Sprach-Timestamps, Captions-Komponente, erstes 60-s-Erklärvideo (`calm`), Skill `c360-voice` | offen |
| **P2 Figuren 2D** | Figuren-Bibel, Lottie/Rive in Remotion, Ausdrucks-Set, Skill `c360-characters` | offen |
| **P3 Generativ + 3D** | fal.ai-Anbindung (Bild/Video), Recraft für Vektor-Assets, Blender headless für 3D, Kosten-Leitplanken, Skill `c360-generative` | offen |
| **P4 Plugin** | Paket als Claude-Code-Plugin (`.claude-plugin/`), Commands `/reel`, `/explainer`, `/cutdown`, Vorlagen-Bibliothek | offen |

## Statt Higgsfield: Pay-per-Call statt verfallender Credits

Higgsfield ist ein Credit-Aggregator mit GUI-Fokus (ca. $19–129/Monat, Credits verfallen). Für einen Agenten, der in Schüben arbeitet, passt eine API mit Abrechnung pro Aufruf besser. **fal.ai als ein Schlüssel** deckt die meisten Modelle ab.

| Bereich | Empfehlung | Preis (ca.) | Hinweis |
|---|---|---|---|
| Bild, allgemein | FLUX.2 Klein/Pro (BFL oder fal) | $0,014–0,03 / Bild | Klein 4B Apache-2.0; [dev]-Gewichte nicht kommerziell |
| Bild, Marke/Vektor | **Recraft** | $0,04 Raster / $0,08 SVG | markenkonsistente Illustrationen und Icons |
| Bild, günstig | gpt-image-1-mini | ~$0,005 / Bild | |
| Video, Entwurf | Wan 2.2 (fal) | ~$0,10 / s | offen, selbst hostbar |
| Video, Figur konsistent | Kling 2.6/3.0 mit Referenzbild | $0,14–0,34 / s | |
| Video, Hero-Shot | Veo 3.1 (Fast) | $0,15–0,40 / s | |
| 3D | **Blender headless** (`blender -b -P`) + GLB in three.js | frei | Rigging: Mixamo/AccuRIG frei |
| Bild→3D | Meshy / Tripo | ~$20/Monat bzw. $0,10–0,30 / Modell | **Hunyuan3D: Lizenz schließt die EU aus — nicht nutzen** |
| 2D-Figuren | Lottie (frei), Rive (Runtime frei, Export ab $9/Monat) | | `@remotion/lottie`, `@remotion/rive` |
| Stimme | ElevenLabs Starter $5–6 (kommerziell), Creator $22 (Voice Clone) | | offizieller MCP-Server |
| Stimme, günstig | OpenAI gpt-4o-mini-tts | ~$0,015 / min | |
| Musik | Eleven Music | ~$0,15 / min | Suno/Udio: keine verlässliche API — nicht darauf bauen |
| Schnitt, Effekte | Remotion, ffmpeg, whisper.cpp (Captions), rembg, Real-ESRGAN, RIFE | frei | DaVinci braucht GUI — ungeeignet |
| GPU auf Abruf | RunPod L40S (ComfyUI, Blender, eigene LoRAs) | ~$0,79 / h | lohnt erst bei Volumen |

### Budget-Stufen

- **A · 0–30 €/Monat:** Remotion + ffmpeg + whisper.cpp, Lottie, ElevenLabs Starter, fal.ai pay-as-you-go (~$10–15: ~300 Bilder + ~60–100 s Wan-Video), CC0-SFX.
- **B · 50–100 €/Monat:** A + ElevenLabs Creator (Markenstimme, Musik), Recraft-Guthaben, fal.ai ~$40–60 (Kling mit Referenz für eine wiederkehrende Figur, ~3–4 min/Monat), optional Meshy.
- **C · auf Abruf:** Veo 3.1 / Kling 3 Pro für einzelne Hero-Shots; RunPod-GPU nur für einen Batch hochfahren.

**Empfehlung:** mit A starten. B erst, wenn eine Figur und eine Markenstimme feststehen.

### Datenschutz

Kling, Seedance, Hailuo sind chinesische Anbieter; fal und Replicate sitzen in den USA. Keine personenbezogenen Daten, keine echten Gesichter hochladen ohne AVV/DPA und Transfer-Prüfung (SCCs). Für Marketing-Assets aus reinen Prompts und eigenen Illustrationen unkritisch.

### Offene Prüfungen

Lizenzdatei Wan 2.2 · aktuelle Preise Runware / Kie.ai · Epidemic / Artlist · alle als "ca." markierten Preise beim Anbieter.

Quellen der Recherche: [fal.ai Video-APIs](https://fal.ai/learn/tools/best-image-to-video-apis-2026) · [Recraft Pricing](https://www.recraft.ai/docs/api-reference/pricing) · [BFL](https://help.bfl.ai/articles/7424166364-wip-welcome-to-the-forest) · [Video-Preisindex](https://ugccopilot.ai/research/ai-video-model-price-index/) · [Hunyuan3D-Lizenz](https://huggingface.co/tencent/Hunyuan3D-2/blob/main/LICENSE) · [Rive Pricing](https://rive.app/docs/account-admin/pricing) · [RunPod](https://www.runpod.io/gpu-cloud/pricing) · [Remotion Pricing](https://www.remotion.dev/docs/license/pricing) · [Higgsfield-Preise (krea)](https://www.krea.ai/blog/higgsfield-pricing-explained-2026-unlimited-credits-and-real-monthly-costs)
