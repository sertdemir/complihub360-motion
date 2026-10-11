// Reel 01 · abgenommene Copy (Storyboard 2026-10-11: Kern A, Szenen 1–6 A).
// Wizard-Texte 1:1 aus dem Produkt (home.json → hero.preview), damit das Reel
// keine Funktion zeigt, die es nicht gibt. Runde 2 (2026-10-11): CTA „Link in
// der Bio“, Claim als eigene Zeile auf der Endcard. Die Risk Map ist als Beispiel
// gekennzeichnet — Werte illustrativ, keine Kundendaten.

export type Lang = 'de' | 'en';
export type Priority = 'low' | 'medium' | 'high' | 'immediate';

export const COPY = {
  de: {
    hook: 'Die Compliance-Arbeit, die Sie *nicht* allein erledigen sollten.',
    rules: 'Viele Regeln. Nicht alle gelten für *Sie*.',
    chips: [
      {label: 'DSGVO', applies: true},
      {label: 'NIS2', applies: false},
      {label: 'EPR', applies: true},
      {label: 'CSRD', applies: false},
      {label: 'USt-OSS', applies: true},
      {label: 'CE', applies: true},
    ],
    ask: 'Wir fragen nur, was *zählt*.',
    wizard: {
      step: 'Schritt 2 von 4',
      title: 'Welche Compliance-Bereiche sind relevant?',
      domains: ['Steuern & USt', 'EPR & Verpackung', 'Daten & Datenschutz', 'Marketing-Compliance'],
      picks: [1, 2],
      countBefore: '0 ausgewählt · 4 offen',
      countAfter: '2 ausgewählt · 2 offen',
      cta: 'Weiter',
    },
    map: 'Sehen, was *wirklich* gilt.',
    risk: {
      label: 'Ihre Risk Map · DE → UK + NL',
      example: 'Beispiel',
      rows: [
        {text: 'Datenschutzhinweise prüfen', p: 'low'},
        {text: 'Verpackungsdaten melden UK', p: 'medium'},
        {text: 'EPR-Registrierung UK', p: 'high'},
        {text: 'Verpackungsregister NL vor Verkaufsstart', p: 'immediate'},
      ] as {text: string; p: Priority}[],
    },
    fit: 'Und die Fachleute, die *passen*.',
    providers: [
      {match: 92, fits: ['EPR & Verpackung', 'Deutsch'], gap: 'Vor-Ort-Termin'},
      {match: 84, fits: ['Daten & Datenschutz'], gap: 'Niederländisch'},
    ],
    reveal: 'Name sichtbar nach der Buchung',
    cta: 'Link in der Bio',
  },
  en: {
    hook: 'The compliance work you *shouldn’t* be doing alone.',
    rules: 'Lots of rules. Not all of them apply to *you*.',
    chips: [
      {label: 'GDPR', applies: true},
      {label: 'NIS2', applies: false},
      {label: 'EPR', applies: true},
      {label: 'CSRD', applies: false},
      {label: 'VAT OSS', applies: true},
      {label: 'CE', applies: true},
    ],
    ask: 'We only ask what *matters*.',
    wizard: {
      step: 'Step 2 of 4',
      title: 'Which compliance domains are in scope?',
      domains: ['Tax & VAT', 'EPR & Packaging', 'Data & Privacy', 'Marketing Compliance'],
      picks: [1, 2],
      countBefore: '0 selected · 4 left',
      countAfter: '2 selected · 2 left',
      cta: 'Continue',
    },
    map: 'See what *actually* applies.',
    risk: {
      label: 'Your risk map · DE → UK + NL',
      example: 'Example',
      rows: [
        {text: 'Review privacy notices', p: 'low'},
        {text: 'Report packaging data UK', p: 'medium'},
        {text: 'EPR registration UK', p: 'high'},
        {text: 'Packaging register NL before launch', p: 'immediate'},
      ] as {text: string; p: Priority}[],
    },
    fit: 'And the specialists who *fit*.',
    providers: [
      {match: 92, fits: ['EPR & Packaging', 'German'], gap: 'On-site visit'},
      {match: 84, fits: ['Data & Privacy'], gap: 'Dutch'},
    ],
    reveal: 'Name shown after booking',
    cta: 'Link in bio',
  },
} as const;

/** Sichtbare Stufen-Labels — wie im Produkt (lib/priority.ts + Sprachdateien
 *  `*.priority.*`), nie "Critical" oder "Urgent". */
export const PRIORITY_LABEL: Record<Lang, Record<Priority, string>> = {
  de: {low: 'Niedrig', medium: 'Mittel', high: 'Hoch', immediate: 'Sofort'},
  en: {low: 'Low', medium: 'Medium', high: 'High', immediate: 'Immediate'},
};
