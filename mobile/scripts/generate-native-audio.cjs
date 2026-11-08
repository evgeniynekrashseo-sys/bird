'use strict';

// Original Fluffy Forest sounds. All samples are synthesized locally; no third-party audio.
// Run: node scripts/generate-native-audio.cjs (requires ffmpeg for MP3 export).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const RATE = 32000;
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = [
  path.join(ROOT, 'ios', 'App', 'App', 'sounds'),
  path.join(ROOT, 'android', 'app', 'src', 'assets'),
  path.join(ROOT, 'www', 'assets', 'sounds'),
];
const tempo = 60 / 76 / 2;
const hz = midi => 440 * 2 ** ((midi - 69) / 12);

function create(duration) {
  return new Float64Array(Math.ceil(duration * RATE));
}

function sound(out, start, duration, from, to = from, amplitude = 0.15, style = 'bell') {
  const first = Math.round(start * RATE);
  const length = Math.round(duration * RATE);
  let phase = 0;
  for (let i = 0; i < length; i++) {
    const index = first + i;
    if (index >= out.length || index < 0) continue;
    const t = i / RATE;
    const progress = i / length;
    const pitch = from + (to - from) * progress;
    phase += 2 * Math.PI * pitch / RATE;
    const attack = Math.min(1, t / 0.024);
    const fade = Math.pow(Math.max(0, 1 - progress), style === 'plush' ? 3.4 : 1.6);
    const tremolo = style === 'bell' ? (0.8 + 0.2 * Math.sin(t * 4.1)) : 1;
    const partials = style === 'bell'
      ? (Math.sin(phase) + 0.19 * Math.sin(2 * phase) + 0.045 * Math.sin(3 * phase))
      : (Math.sin(phase) + 0.075 * Math.sin(2 * phase));
    out[index] += amplitude * attack * fade * tremolo * partials;
  }
}

function score() {
  const melody = [
    74, -1, 71, -1, 69, -1, 71, 76,
    74, -1, 71, 69, 67, -1, 69, -1,
    71, -1, 74, -1, 76, -1, 74, 71,
    69, -1, 67, 69, 71, -1, 67, -1,
  ];
  const chords = [[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]];
  const duration = melody.length * tempo;
  const out = create(duration);
  for (let step = 0; step < melody.length; step++) {
    const at = step * tempo;
    if (step % 8 === 0) {
      for (const p of chords[step / 8]) sound(out, at, 3.0, hz(p), hz(p), 0.039, 'plush');
    }
    if (melody[step] > 0) {
      sound(out, at, 0.58, hz(melody[step]), hz(melody[step]), 0.077, 'bell');
      sound(out, at + 0.014, 0.36, hz(melody[step] + 12), hz(melody[step] + 12), 0.016, 'bell');
    }
  }
  // Smooth the wrap point so an endless loop has no click.
  for (let i = 0; i < RATE / 10; i++) {
    const position = out.length - 1 - i;
    out[position] *= Math.min(1, i / (RATE / 10));
  }
  return out;
}

function effect(name) {
  const duration = { pick: 0.22, move: 0.34, invalid: 0.32, complete: 0.96, win: 1.5, chirp: 0.45 }[name];
  const out = create(duration);
  if (name === 'pick') sound(out, 0, 0.19, 425, 265, 0.35, 'plush');
  if (name === 'move') {
    sound(out, 0, 0.20, 365, 390, 0.2, 'plush');
    sound(out, 0.09, 0.22, 520, 620, 0.19, 'plush');
  }
  if (name === 'invalid') sound(out, 0, 0.29, 260, 215, 0.19, 'plush');
  if (name === 'complete') {
    [659.25, 783.99, 987.77, 1318.51].forEach((freq, i) => sound(out, i * 0.11, 0.52, freq, freq, 0.20, 'bell'));
  }
  if (name === 'win') {
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => sound(out, i * 0.14, 0.86, freq, freq, 0.22, 'bell'));
  }
  if (name === 'chirp') {
    sound(out, 0, 0.16, 930, 1120, 0.19, 'bell');
    sound(out, 0.13, 0.24, 1160, 1370, 0.18, 'bell');
  }
  return out;
}

function encodeWav(samples) {
  const out = Buffer.alloc(44 + samples.length * 2);
  out.write('RIFF', 0);
  out.writeUInt32LE(out.length - 8, 4);
  out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20); // PCM
  out.writeUInt16LE(1, 22); // mono
  out.writeUInt32LE(RATE, 24);
  out.writeUInt32LE(RATE * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36);
  out.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  }
  return out;
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fluffy-generated-'));
try {
  OUTPUT.forEach(dir => fs.mkdirSync(dir, { recursive: true }));
  for (const name of ['music', 'pick', 'move', 'invalid', 'complete', 'win', 'chirp']) {
    const wav = path.join(tempDir, `${name}.wav`);
    const mp3 = path.join(tempDir, `${name}.mp3`);
    fs.writeFileSync(wav, encodeWav(name === 'music' ? score() : effect(name)));
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', wav,
      '-af', name === 'music' ? 'volume=2.5' : 'anull',
      '-codec:a', 'libmp3lame', '-qscale:a', '5', '-ar', '32000', mp3]);
    OUTPUT.forEach(dir => fs.copyFileSync(mp3, path.join(dir, `${name}.mp3`)));
    process.stdout.write(`Generated ${name}.mp3 (${fs.statSync(mp3).size} bytes)\n`);
  }
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
