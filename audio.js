/* Original, lightweight woodland soundtrack and soft toy sound effects. */
(() => {
  'use strict';

  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  const STEP_SECONDS = 60 / 76 / 2;
  const MELODY = [
    74, -1, 71, -1, 69, -1, 71, 76,
    74, -1, 71, 69, 67, -1, 69, -1,
    71, -1, 74, -1, 76, -1, 74, 71,
    69, -1, 67, 69, 71, -1, 67, -1,
  ];
  const CHORDS = [
    [55, 59, 62], // G
    [52, 55, 59], // Em
    [48, 52, 55], // C
    [50, 54, 57], // D
  ];

  let context;
  let master;
  let music;
  let effects;
  let enabled = false;
  let paused = false;
  let timer;
  let step = 0;
  let nextBeat = 0;
  let unlocking;

  const hz = midi => 440 * (2 ** ((midi - 69) / 12));

  function setup() {
    if (!AudioEngine) return false;
    if (context) return true;
    try {
      context = new AudioEngine();
      master = context.createGain();
      master.gain.value = 0.9;
      music = context.createGain();
      music.gain.value = 0.48;
      effects = context.createGain();
      effects.gain.value = 0.88;
      music.connect(master);
      effects.connect(master);
      master.connect(context.destination);
      return true;
    } catch { return false; }
  }

  function note(frequency, at, duration, volume, type, bus, cutoff = 2400) {
    if (!context) return;
    const osc = context.createOscillator();
    const filter = context.createBiquadFilter();
    const amp = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, at);
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), at + 0.035);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(filter);
    filter.connect(amp);
    amp.connect(bus);
    osc.start(at);
    osc.stop(at + duration + 0.025);
  }

  function soundtrackStep(at) {
    const index = step % MELODY.length;
    if (index % 8 === 0) {
      const chord = CHORDS[Math.floor(index / 8)];
      for (const pitch of chord) note(hz(pitch), at, 3.25, 0.011, 'sine', music, 1050);
    }
    if (MELODY[index] >= 0) {
      note(hz(MELODY[index]), at, 0.74, 0.052, 'sine', music, 2250);
      note(hz(MELODY[index] + 12), at + 0.018, 0.46, 0.007, 'triangle', music, 1950);
    }
    step++;
  }

  function schedule() {
    if (!enabled || paused || !context || context.state !== 'running') return;
    if (nextBeat < context.currentTime) nextBeat = context.currentTime + 0.06;
    while (nextBeat < context.currentTime + 0.7) {
      soundtrackStep(nextBeat);
      nextBeat += STEP_SECONDS;
    }
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = undefined;
  }

  function unlock() {
    if (!enabled || paused || !setup()) return Promise.resolve(false);
    if (unlocking) return unlocking;
    // Call resume() synchronously from the tap event before the gesture expires on iOS.
    try {
      const resumed = context.state === 'running' ? Promise.resolve() : context.resume();
      unlocking = Promise.resolve(resumed).then(() => {
        if (!enabled || paused || context.state !== 'running') return false;
        master.gain.setTargetAtTime(0.9, context.currentTime, 0.035);
        if (!timer) {
          nextBeat = context.currentTime + 0.06;
          schedule();
          timer = setInterval(schedule, 180);
        }
        return true;
      }).catch(() => false).finally(() => { unlocking = undefined; });
      return unlocking;
    } catch { return Promise.resolve(false); }
  }

  function wakeFromGesture() {
    if (!enabled || paused || !setup()) return;
    if (timer && context.state === 'running') return;
    // A short, silent source also primes WKWebView's audio pipeline on first touch.
    // It is connected to zero gain, so it never makes an unwanted click.
    try {
      const source = context.createOscillator();
      const silent = context.createGain();
      silent.gain.value = 0;
      source.connect(silent);
      silent.connect(context.destination);
      source.start(context.currentTime);
      source.stop(context.currentTime + 0.025);
    } catch { /* Keep playing if the priming source is unsupported. */ }
    void unlock();
  }

  function setEnabled(value, defer = false) {
    enabled = Boolean(value);
    if (!enabled) {
      stopTimer();
      if (context) master.gain.setTargetAtTime(0.0001, context.currentTime, 0.015);
    } else if (!defer) {
      // A tap on the music toggle is itself a trusted activation gesture.
      wakeFromGesture();
      unlock().then(ready => { if (ready && enabled) effect('pick'); });
    }
  }

  function softToy() {
    if (!context) return;
    const at = context.currentTime + 0.005;
    const osc = context.createOscillator();
    const filter = context.createBiquadFilter();
    const amp = context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(430, at);
    osc.frequency.exponentialRampToValueAtTime(265, at + 0.14);
    filter.type = 'lowpass';
    filter.frequency.value = 720;
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(0.13, at + 0.024);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + 0.19);
    osc.connect(filter);
    filter.connect(amp);
    amp.connect(effects);
    osc.start(at);
    osc.stop(at + 0.2);
  }

  function effect(kind, frequency = 530) {
    if (!enabled || paused) return;
    if (!context || context.state !== 'running') {
      unlock().then(() => {
        if (enabled && !paused && context?.state === 'running') effect(kind, frequency);
      });
      return;
    }
    const at = context.currentTime + 0.01;
    if (kind === 'pick') {
      softToy();
    } else if (kind === 'move') {
      note(360, at, 0.15, 0.042, 'sine', effects, 850);
      note(520, at + 0.06, 0.17, 0.025, 'sine', effects, 1200);
    } else if (kind === 'invalid') {
      note(235, at, 0.18, 0.033, 'triangle', effects, 700);
    } else if (kind === 'complete') {
      [659.25, 783.99, 987.77, 1318.51].forEach((f, i) => {
        note(f, at + i * 0.085, 0.62, 0.075 - i * 0.008, 'sine', effects, 3200);
      });
    } else if (kind === 'chirp') {
      note(950, at, 0.13, 0.037, 'sine', effects, 2300);
      note(1260, at + 0.1, 0.17, 0.031, 'sine', effects, 2800);
    } else if (kind === 'win') {
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
        note(f, at + i * 0.12, 1.05, 0.062, 'sine', effects, 4000);
      });
    } else {
      note(frequency, at, 0.18, 0.032, 'sine', effects, 1400);
    }
  }

  function pause() {
    paused = true;
    stopTimer();
    if (context && context.state === 'running') context.suspend().catch(() => {});
  }

  function resume() {
    paused = false;
    if (enabled) unlock();
  }

  // iOS allows playback only after a real interaction.
  ['touchstart', 'pointerdown', 'click', 'keydown'].forEach(event => {
    document.addEventListener(event, wakeFromGesture, { passive: true });
  });
  window.FluffyAudio = { setEnabled, effect, pause, resume };
})();
