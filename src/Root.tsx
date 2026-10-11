import React from 'react';
import {Composition, Still} from 'remotion';
import {ArticleCover} from './ArticleCover';
import {EffortVideo} from './EffortVideo';
import {FPS, H, TL, W} from './lib';
import {FORMATS} from './brand/brand';
import {ReelTemplate, reelDuration, reelFps} from '../videos/reel-template/ReelTemplate';
import {Reel01, reel01Duration, reel01Fps} from '../videos/reel-01/Reel01';
import {STYLE_DURATION, STYLE_FPS, StyleLine, StyleObjects} from '../videos/styles/Styles';

export const Root: React.FC = () => (
  <>
    {/* CompliHub360 */}
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
