import React from 'react';
import {Composition, Still} from 'remotion';
import {ArticleCover} from './ArticleCover';
import {EffortVideo} from './EffortVideo';
import {FPS, H, TL, W} from './lib';
import {FORMATS} from './brand/brand';
import {ReelTemplate, reelDuration, reelFps} from '../videos/reel-template/ReelTemplate';

export const Root: React.FC = () => (
  <>
    {/* CompliHub360 */}
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
