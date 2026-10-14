import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Mask} from '../components/primitives';
import {C, EASE, FORMATS, FormatId, PROFILE, ProfileId, prog} from '../brand/brand';

/**
 * Zeile, Wort für Wort aus der Maske. Ein Wort darf Akzent tragen
 * (`*so*` im Text) — genau eins pro Zeile, in Gold-Text.
 * `inAt` / `outAt` sind Beats aus der Timeline, nie feste Zahlen.
 */
export const KineticLine: React.FC<{
  text: string;
  inAt: number;
  outAt?: number;
  profile: ProfileId;
  style: React.CSSProperties;
  accent?: string;
  /** Hängt untrennbar am letzten Wort, z. B. ein Satzpunkt mit eigener Animation. */
  suffix?: React.ReactNode;
}> = ({text, inAt, outAt, profile, style, accent = C.goldOnLight, suffix}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const p = PROFILE[profile];
  const words = text.split(' ');
  return (
    <span style={{display: 'inline-block', ...style}}>
      {words.map((raw, i) => {
        // `*wort*` ist Akzent, auch mit Satzzeichen dahinter (`*Sie*.`).
        const m = raw.match(/^\*(.+)\*([.,:;!?…»«"“”’)]*)$/);
        const isAccent = !!m;
        const word = m ? m[1] : raw;
        const tail = m ? m[2] : '';
        const t0 = inAt + i * p.stagger;
        const k = prog(t, t0, t0 + p.enter, EASE.enter);
        const out = outAt === undefined ? 0 : prog(t, outAt + i * 0.03, outAt + i * 0.03 + p.exit, EASE.exit);
        const mask = (
          <Mask k={k} out={out} tilt={profile === 'lift' ? 4 : 2}>
            <span style={isAccent ? {color: accent, fontStyle: 'italic'} : undefined}>{word}</span>
            {tail}
          </Mask>
        );
        const last = i === words.length - 1;
        return (
          <React.Fragment key={i}>
            {last && suffix ? <span style={{whiteSpace: 'nowrap'}}>{mask}{suffix}</span> : mask}
            {last ? null : ' '}
          </React.Fragment>
        );
      })}
    </span>
  );
};

/** Inhaltsfläche innerhalb der Safe Zone des Formats. */
export const SafeArea: React.FC<{
  format: FormatId;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({format, children, style}) => {
  const s = FORMATS[format].safe;
  return (
    <div
      style={{
        position: 'absolute',
        top: s.top,
        bottom: s.bottom,
        left: s.left,
        right: s.right,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Debug-Overlay: zeigt, was die Plattform-Oberfläche verdeckt. */
export const SafeZones: React.FC<{format: FormatId}> = ({format}) => {
  const {w, h, safe} = FORMATS[format];
  const fill = 'rgba(220,38,38,0.22)';
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <rect x={0} y={0} width={w} height={safe.top} fill={fill} />
      <rect x={0} y={h - safe.bottom} width={w} height={safe.bottom} fill={fill} />
      <rect x={0} y={safe.top} width={safe.left} height={h - safe.top - safe.bottom} fill={fill} />
      <rect x={w - safe.right} y={safe.top} width={safe.right} height={h - safe.top - safe.bottom} fill={fill} />
    </svg>
  );
};
