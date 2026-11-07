'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

let oscillators = 0;
let scheduleCalls = 0;
const listeners = {};
const param = () => ({
  value: 0,
  setValueAtTime() {},
  exponentialRampToValueAtTime() {},
  setTargetAtTime() {},
});
const node = () => ({
  gain: param(),
  frequency: param(),
  type: 'sine',
  connect() {},
  start() { oscillators++; },
  stop() {},
});
class FakeAudioContext {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = node(); }
  createGain() { return node(); }
  createOscillator() { return node(); }
  createBiquadFilter() { return node(); }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
}

const sandbox = {
  window: { AudioContext: FakeAudioContext },
  document: { addEventListener(name, listener) { listeners[name] = listener; } },
  setInterval() { scheduleCalls++; return scheduleCalls; },
  clearInterval() {},
};

const source = fs.readFileSync(path.join(__dirname, '..', 'www', 'audio.js'), 'utf8');
vm.runInNewContext(source, sandbox, { filename: 'audio.js' });

(async () => {
  const audio = sandbox.window.FluffyAudio;
  assert.ok(audio, 'Sound engine must be exposed');
  audio.setEnabled(true, true);
  assert.equal(oscillators, 0, 'Music must not autoplay before a gesture');
  listeners.pointerdown();
  await Promise.resolve();
  assert.ok(oscillators > 0, 'Background score must begin after user input');

  const beforePick = oscillators;
  audio.effect('pick');
  assert.equal(oscillators - beforePick, 1, 'Plush click should play one soft voice');

  const beforeComplete = oscillators;
  audio.effect('complete');
  assert.equal(oscillators - beforeComplete, 4, 'A completed family gets a four-note chime');

  audio.setEnabled(false);
  const muted = oscillators;
  audio.effect('win');
  audio.effect('pick');
  assert.equal(oscillators, muted, 'Master mute must silence all effects');

  const game = fs.readFileSync(path.join(__dirname, '..', 'www', 'game.js'), 'utf8');
  assert.ok(game.includes('if(sound&&speechEnabled&&t)'), 'Master mute must also silence narration');
  assert.ok(game.includes("window.FluffyVoice?.stop()"), 'Muting must stop current narration');
  const html = fs.readFileSync(path.join(__dirname, '..', 'www', 'index.html'), 'utf8');
  assert.ok(html.indexOf('audio.js') < html.indexOf('game.js'), 'Audio engine must load before game');
  const css = fs.readFileSync(path.join(__dirname, '..', 'www', 'style.css'), 'utf8');
  assert.ok(css.includes('animation:fireflyDrift') && css.includes('box-shadow:none'), 'Firefly glow must avoid shadow rectangles');
  console.log('PASS: soft toy tap, family chime, gesture-gated music, mute and firefly rendering');
})().catch(e => { console.error(e); process.exitCode = 1; });
