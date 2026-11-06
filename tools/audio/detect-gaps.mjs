import { spawnSync } from 'node:child_process';

export function detectSilences(mediaFile, { noiseDb = -40, minDurationSec = 0.4 } = {}) {
  const result = spawnSync(
    'ffmpeg',
    ['-i', mediaFile, '-af', `silencedetect=noise=${noiseDb}dB:d=${minDurationSec}`, '-f', 'null', '-'],
    { encoding: 'utf8' }
  );
  if (result.status !== 0) {
    throw new Error(`ffmpeg silencedetect failed on ${mediaFile}: ${result.stderr?.slice(-400)}`);
  }
  const silences = [];
  let current = null;
  for (const line of result.stderr.split('\n')) {
    const start = line.match(/silence_start:\s*([\d.]+)/);
    const end = line.match(/silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/);
    if (start) current = { startSec: +start[1] };
    if (end && current) {
      silences.push({ ...current, endSec: +end[1], durSec: +end[2] });
      current = null;
    }
  }
  if (current) silences.push({ ...current, endSec: null, durSec: null, openEnded: true });
  return silences;
}
