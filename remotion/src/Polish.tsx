import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type Badge = { atSec: number; label: string };
export type PolishProps = {
  fps: number;
  width: number;
  height: number;
  introSec: number;
  mainSec: number;
  outroSec: number;
  title: string;
  subtitle: string;
  outroText: string;
  badges: Badge[];
  hasIntroAudio: boolean;
  hasOutroAudio: boolean;
};

const INDIGO = '#4F46E5';
const SKY = '#38BDF8';
const AMBER = '#F59E0B';
const FONT = '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(135deg, ${INDIGO} 0%, ${SKY} 100%)`,
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT,
      color: 'white',
    }}
  >
    {children}
  </AbsoluteFill>
);

const Intro: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14 } });
  const sub = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const out = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <Card>
      <div style={{ opacity: out, textAlign: 'center', padding: '0 80px' }}>
        <div
          style={{
            transform: `scale(${0.8 + 0.2 * pop})`,
            opacity: pop,
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: -1,
            textShadow: '0 4px 24px rgba(0,0,0,0.25)',
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ opacity: sub, marginTop: 18, fontSize: 28, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
            {subtitle}
          </div>
        ) : null}
        <div
          style={{
            margin: '28px auto 0',
            width: 140 * pop,
            height: 6,
            borderRadius: 3,
            background: AMBER,
          }}
        />
      </div>
    </Card>
  );
};

const Outro: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12 } });
  return (
    <Card>
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          background: 'white',
          color: INDIGO,
          fontSize: 72,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${pop})`,
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}
      >
        ✓
      </div>
      <div style={{ marginTop: 28, fontSize: 40, fontWeight: 700, opacity: interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        {text}
      </div>
    </Card>
  );
};

const BadgePill: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const slide = spring({ frame, fps, config: { damping: 15 } });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 28,
        bottom: 34,
        transform: `translateX(${(slide - 1) * 120}px)`,
        opacity: slide * out,
        background: 'rgba(30, 27, 75, 0.85)',
        color: 'white',
        fontFamily: FONT,
        fontSize: 22,
        fontWeight: 600,
        padding: '10px 22px 10px 16px',
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        backdropFilter: 'blur(4px)',
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 5, background: AMBER }} />
      {label}
    </div>
  );
};

const Main: React.FC<{ badges: Badge[]; mainSec: number }> = ({ badges, mainSec }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progress = Math.min(1, frame / (mainSec * fps));
  return (
    <AbsoluteFill style={{ background: 'black' }}>
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
        <OffthreadVideo src={staticFile('main.mp4')} />
        {badges.map((b) => (
          <Sequence key={`${b.atSec}-${b.label}`} from={Math.round(b.atSec * fps)} durationInFrames={Math.round(2.8 * fps)}>
            <BadgePill label={b.label} />
          </Sequence>
        ))}
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: 6,
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${INDIGO}, ${SKY})`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Polish: React.FC<PolishProps> = (p) => {
  const introFrames = Math.round(p.introSec * p.fps);
  const mainFrames = Math.round(p.mainSec * p.fps);
  const outroFrames = Math.round(p.outroSec * p.fps);
  return (
    <AbsoluteFill style={{ background: 'black' }}>
      <Sequence durationInFrames={introFrames}>
        <Intro title={p.title} subtitle={p.subtitle} />
        {p.hasIntroAudio ? <Audio src={staticFile('intro.wav')} /> : null}
      </Sequence>
      <Sequence from={introFrames} durationInFrames={mainFrames}>
        <Main badges={p.badges} mainSec={p.mainSec} />
      </Sequence>
      <Sequence from={introFrames + mainFrames} durationInFrames={outroFrames}>
        <Outro text={p.outroText} />
        {p.hasOutroAudio ? <Audio src={staticFile('outro.wav')} /> : null}
      </Sequence>
    </AbsoluteFill>
  );
};
