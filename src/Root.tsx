import React from 'react';
import {Composition, Still} from 'remotion';
import {ArticleCover} from './ArticleCover';
import {EffortVideo} from './EffortVideo';
import {FPS, H, TL, W} from './lib';
import {FORMATS} from './brand/brand';
import {ReelTemplate, reelDuration, reelFps} from '../videos/reel-template/ReelTemplate';
import {Reel01, reel01Duration, reel01Fps} from '../videos/reel-01/Reel01';
import {calculateCompassMetadata, CompassReel} from '../videos/compass-series/CompassReel';
import type {Episode} from '../videos/compass-series/episode';
import EP01 from '../videos/compass-series/episodes/ep01.json';
import {ProductProbe, probeDuration, probeFps} from '../videos/product-probe/ProductProbe';
import {COMBO_DURATION, STYLE_DURATION, STYLE_FPS, StyleCombo, StyleLine, StyleObjects} from '../videos/styles/Styles';

export const Root: React.FC = () => (
  <>
    {/* CompliHub360 */}
    <Composition id="ProductProbe" component={ProductProbe} durationInFrames={Math.round(probeDuration * probeFps)} fps={probeFps} width={FORMATS.reel.w} height={FORMATS.reel.h} />
    {/* Serie "Kompass": eine Folge = videos/compass-series/episodes/<id>.json, gebaut mit npm run series -- <id> */}
    <Composition
      id="CompassReel"
      component={CompassReel}
      calculateMetadata={calculateCompassMetadata}
      durationInFrames={1}
      fps={30}
      width={FORMATS.reel.w}
      height={FORMATS.reel.h}
      defaultProps={{episode: EP01 as Episode, lang: 'de' as const, showSafe: false}}
    />
    <Composition id="StyleCombo" component={StyleCombo} durationInFrames={Math.round(COMBO_DURATION * STYLE_FPS)} fps={STYLE_FPS} width={FORMATS.reel.w} height={FORMATS.reel.h} />
    {([['StyleLine', StyleLine], ['StyleObjects', StyleObjects]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} durationInFrames={Math.round(STYLE_DURATION * STYLE_FPS)} fps={STYLE_FPS} width={FORMATS.reel.w} height={FORMATS.reel.h} />
    ))}
    {(['de', 'en'] as const).map((lang) => (
      <Composition
        key={lang}
        id={`Reel01-${lang.toUpperCase()}`}
        component={Reel01}
        durationInFrames={Math.round(reel01Duration * reel01Fps)}
        fps={reel01Fps}
        width={FORMATS.reel.w}
        height={FORMATS.reel.h}
        defaultProps={{lang, showSafe: false}}
      />
    ))}
    <Composition
      id="ReelTemplate"
      component={ReelTemplate}
      durationInFrames={Math.round(reelDuration * reelFps)}
      fps={reelFps}
      width={FORMATS.reel.w}
      height={FORMATS.reel.h}
      defaultProps={{showSafe: false}}
    />
    {/* Upstream-Referenz aus claude-motion */}
    <Composition
      id="EffortVideo"
      component={EffortVideo}
      durationInFrames={Math.round(TL.duration * FPS)}
      fps={FPS}
      width={W}
      height={H}
    />
    <Still id="ArticleCover" component={ArticleCover} width={2000} height={800} />
  </>
);
