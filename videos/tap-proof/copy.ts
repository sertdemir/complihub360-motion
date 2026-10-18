// Tap-Proof · Stufe 0 des Video-Lab-Tests (2026-10-18). Beats F2–F4 aus
// Pilot A (docs/marketing/motion-video-konzept-v1.md im Produkt-Repo):
// Vorhaben → Risk Map → Quelle. Video-Copy siezt; die Zeilen sprechen
// niemanden direkt an. Risk Map und Quelle sind als Beispiel gekennzeichnet —
// illustrativ, keine Kundendaten, vor einer Veröffentlichung fachlich prüfen.
// Unsicheres bleibt benannt: Umsatzsteuer hängt am Lager ("je nach Lager").

import type {Priority} from '../reel-01/copy';

export const COPY = {
  hook: 'Ein Paket nach *Frankreich.* Was gilt eigentlich?',
  plan: 'Erst das *Vorhaben.*',
  applies: 'Dann, was *gilt.*',
  source: 'Und *woher* wir das wissen.',
  close: 'Erst verstehen, dann *entscheiden.*',
  vorhaben: {
    label: 'Vorhaben',
    route: 'Deutschland → Frankreich',
    tags: ['D2C', 'Shopify', 'Amazon'],
  },
  risk: {
    label: 'Risk Map · DE → FR',
    example: 'Beispiel',
    rows: [
      {text: 'Verpackung registrieren (EPR)', p: 'high'},
      {text: 'Umsatzsteuer · OSS, je nach Lager', p: 'medium'},
      {text: 'Verbraucherinfos auf Französisch', p: 'low'},
    ] as {text: string; p: Priority}[],
  },
  quelle: {
    label: 'Quelle',
    lines: ["Code de l'environnement", 'Art. L541-10', 'Kennnummer (IDU) über ADEME'],
    stamp: 'Stand 10/2026',
  },
  cta: 'Link in der Bio',
} as const;
