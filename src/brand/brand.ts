import {Easing, spring, SpringConfig} from 'remotion';
import {COMPASS} from './tokens.gen';

// ─── CompliHub360 · Brand-Layer für Video ────────────────────────────────────
// Einzige Quelle für Farben, Schriften, Formate und Bewegung in jedem Video.
// Komponenten schreiben keine Hex-Werte und keine Bezier-Kurven selbst.
// Farben kommen aus Compass (tokens.gen.ts), die Ausnahme ist der Gradient —
// der ist eine Nutzer-Festlegung (2026-08-25) und steht hier wörtlich.

const P = COMPASS.primitives;
const L = COMPASS.light;

export const C = {
  // Flächen
  paper: L.bg.primary, // #ffffff
  mist: P.primary[50], // #ebf1f0
  petrol: P.primary[500], // #004d40 — Markenfläche
  petrolDeep: P.primary[700], // #00231d
  // Text
  ink: L.text.primary, // #0f172a
  inkSoft: L.text.secondary,
  inkMuted: L.text.tertiary,
  onPetrol: P.white,
  onPetrolSoft: 'rgba(255,255,255,0.72)',
  // Akzent — Gold ist der EINE Akzent. Er markiert die Pointe eines Frames,
  // nie eine Warnung. Rot/Warning-Töne gibt es im Video nicht als Stilmittel.
  gold: P.accent.brand, // #c5913b — Marken-Gold (Logo, Schwung)
  goldBright: P.accent[500], // #d4af37
  goldOnPetrol: P.accent[300], // #f4c44a — Text-Gold auf Petrol (6,0:1)
  goldOnLight: P.accent[800], // #6a5b1e — Text-Gold auf Hell (6,7:1)
  // Passung (Checks im Matching) — Compass success/700, sachlich, kein Signal-Grün
  fit: P.success[700], // #047a52
  // Linien
  line: 'rgba(0,77,64,0.12)',
  lineOnPetrol: 'rgba(255,255,255,0.14)',
} as const;

/**
 * "Der Gradient" (Nutzer-Vokabular, Festlegung 2026-08-25): IMMER genau diese
 * Kombination, Petrol- zu Gold-Tint. Keine Varianten erfinden.
 */
export const GRADIENT = 'linear-gradient(165deg, #EAF3F1 0%, #DDECE8 55%, #E9E4D3 100%)';

export const F = {
  display: `"${COMPASS.typography['font-family'].display}", Georgia, serif`,
  sans: `"${COMPASS.typography['font-family'].sans} Variable", Inter, system-ui, sans-serif`,
  mono: `"${COMPASS.typography['font-family'].mono}", ui-monospace, monospace`,
} as const;

// ─── Formate ─────────────────────────────────────────────────────────────────
// safe = Ränder in px, in denen nichts Wichtiges stehen darf. Bei Reels deckt
// die Instagram-Oberfläche oben Kopfzeile, unten Caption/Audio und rechts die
// Aktionsleiste ab. Werte sind Richtwerte, keine Plattform-Spezifikation —
// im Zweifel mit `showSafe` gegenprüfen.
export const FORMATS = {
  reel: {w: 1080, h: 1920, safe: {top: 250, bottom: 380, left: 60, right: 120}},
  feed: {w: 1080, h: 1350, safe: {top: 60, bottom: 60, left: 60, right: 60}},
  square: {w: 1080, h: 1080, safe: {top: 60, bottom: 60, left: 60, right: 60}},
  wide: {w: 1920, h: 1080, safe: {top: 60, bottom: 90, left: 96, right: 96}},
} as const;
export type FormatId = keyof typeof FORMATS;

/** Video-Typo: Compass-Familien, für Bildschirmdistanz Handy hochskaliert. */
export const TYPE = {
  hero: {fontFamily: F.display, fontSize: 124, lineHeight: 1.04, letterSpacing: '-0.02em', fontWeight: 500},
  display: {fontFamily: F.display, fontSize: 96, lineHeight: 1.06, letterSpacing: '-0.015em', fontWeight: 500},
  title: {fontFamily: F.sans, fontSize: 56, lineHeight: 1.15, letterSpacing: '-0.01em', fontWeight: 600},
  body: {fontFamily: F.sans, fontSize: 40, lineHeight: 1.35, fontWeight: 450},
  caption: {fontFamily: F.sans, fontSize: 44, lineHeight: 1.25, fontWeight: 600},
  label: {fontFamily: F.mono, fontSize: 24, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500},
} as const;

// ─── Bewegung · Motion-Tokens ────────────────────────────────────────────────
// Vorschlag für Compass (dort gibt es noch keine Motion-Variablen). `enter`
// ist dieselbe Kurve, die das Produkt-UI schon fährt (0.22, 1, 0.36, 1), damit
// Video und Oberfläche gleich atmen.
export const EASE = {
  enter: Easing.bezier(0.22, 1, 0.36, 1),
  exit: Easing.bezier(0.6, 0, 0.9, 0.35),
  move: Easing.bezier(0.65, 0, 0.35, 1),
  land: Easing.bezier(0.55, 0, 0.2, 1.08),
} as const;

export const SPRING = {
  settle: {damping: 18, stiffness: 120, mass: 0.9},
  panel: {damping: 20, stiffness: 160, mass: 1},
  pop: {damping: 11, stiffness: 210, mass: 0.7},
} as const satisfies Record<string, Partial<SpringConfig>>;

/**
 * Tonprofile. `calm` für Erklärstücke, Risk Map, Privacy. `lift` für Reels und
 * Kampagnen. Beide teilen die Grenzen der DNA: keine Angst, kein Hype.
 */
export const PROFILE = {
  calm: {
    stagger: 0.12, // s zwischen Wörtern
    enter: 0.9,
    exit: 0.45,
    holdMin: 1.4, // s Mindest-Lesepause für eine kurze Zeile
    holdPerWord: 0.3,
    spring: SPRING.settle,
    allowPop: false,
  },
  lift: {
    stagger: 0.08,
    enter: 0.65,
    exit: 0.32,
    holdMin: 1.0,
    holdPerWord: 0.25,
    spring: SPRING.pop,
    allowPop: true,
  },
} as const;
export type ProfileId = keyof typeof PROFILE;

/** Lesepause für eine Zeile nach Profil (motion-design §4, verschärft). */
export const holdFor = (text: string, profile: ProfileId) => {
  const p = PROFILE[profile];
  const words = text.trim().split(/\s+/).length;
  return p.holdMin + Math.max(0, words - 3) * p.holdPerWord;
};

// ─── Helfer ──────────────────────────────────────────────────────────────────
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const prog = (t: number, t0: number, t1: number, ease: (x: number) => number = EASE.move) =>
  ease(clamp01((t - t0) / (t1 - t0)));
export const sp = (frame: number, fps: number, startSec: number, config: Partial<SpringConfig> = SPRING.settle) => {
  const fr = frame - startSec * fps;
  return fr <= 0 ? 0 : spring({frame: fr, fps, config});
};
