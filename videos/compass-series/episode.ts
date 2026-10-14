// Eine Folge der Serie "Kompass" ist nur Text: Hook, ein bis drei Zeilen, CTA —
// je in DE und EN. Alles andere (Timing, 3D-Kamera, Nadel, Klang) leitet die
// Vorlage daraus ab. `*wort*` markiert den einen Gold-Akzent einer Zeile.

export type Lang = 'de' | 'en';
export type Bilingual = Record<Lang, string>;

export type Episode = {
  id: string;
  title: string;
  /** Steht ab Frame 0 im Bild — er ist das Vorschaubild im Feed. */
  hook: Bilingual;
  /** 1–3 Zeilen, nacheinander, während der Kompass im Raum steht. Die letzte ist die Pointe. */
  lines: Bilingual[];
  cta: Bilingual;
};

export const validateEpisode = (e: Episode): string[] => {
  const errs: string[] = [];
  const texts = [e.hook, ...e.lines, e.cta];
  if (e.lines.length < 1 || e.lines.length > 3) errs.push(`lines: 1–3 Zeilen, nicht ${e.lines.length}`);
  for (const t of texts) {
    for (const lang of ['de', 'en'] as const) {
      if (!t?.[lang]?.trim()) errs.push(`fehlender Text (${lang})`);
      const accents = (t?.[lang]?.match(/\*[^*\s]+\*/g) ?? []).length;
      if (accents > 1) errs.push(`mehr als ein Akzent: "${t[lang]}"`);
    }
  }
  return errs;
};
