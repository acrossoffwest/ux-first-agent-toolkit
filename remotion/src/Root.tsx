import React from 'react';
import { Composition } from 'remotion';
import { Polish, PolishProps } from './Polish';

const defaults: PolishProps = {
  fps: 30,
  width: 1280,
  height: 720,
  introSec: 2.8,
  mainSec: 10,
  outroSec: 2.2,
  title: 'Walkthrough',
  subtitle: '',
  outroText: 'Готово',
  badges: [],
  hasIntroAudio: false,
  hasOutroAudio: false,
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Polish"
    component={Polish}
    durationInFrames={450}
    fps={30}
    width={1280}
    height={720}
    defaultProps={defaults}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.round((props.introSec + props.mainSec + props.outroSec) * props.fps),
      fps: props.fps,
      width: props.width,
      height: props.height,
      props,
    })}
  />
);
