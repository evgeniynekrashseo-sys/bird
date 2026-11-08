import { Capacitor } from '@capacitor/core';
import { NativeAudio } from '@capacitor-community/native-audio';

// A WKWebView may report a running AudioContext while emitting no sound.
// On mobile devices, use AVAudioPlayer/MediaPlayer via Capacitor instead.
if (Capacitor.isNativePlatform()) {
  const browserAudio = window.FluffyAudio;
  const clips = ['music', 'pick', 'move', 'invalid', 'complete', 'win', 'chirp'];
  let enabled = false;
  let paused = false;
  let touched = false;
  let prepared = false;
  let preparing;
  let playingMusic = false;
  let failed = false;
  let sequence = 0;

  const report = (message, error) => console.warn(`Fluffy Forest audio: ${message}`, error?.message || error || '');

  function startFallback() {
    if (failed) return;
    failed = true;
    report('native playback unavailable, using WebAudio');
    browserAudio?.setEnabled(enabled, !touched || paused);
    if (paused) browserAudio?.pause();
    else browserAudio?.resume();
  }

  function prepare() {
    if (failed) return Promise.resolve(false);
    if (prepared) return Promise.resolve(true);
    if (!preparing) {
      preparing = (async () => {
        // 'focus: true' selects playback, independent of the iPhone silent switch.
        await NativeAudio.configure({ focus: true, fade: false });
        // The iOS plugin writes to one shared asset dictionary, so preload
        // sequentially to avoid races between its dispatch queues.
        for (const name of clips) {
          await NativeAudio.preload({
            assetId: `fluffy-${name}`,
            assetPath: `${name}.mp3`,
            audioChannelNum: name === 'music' ? 1 : 2,
            channels: name === 'music' ? 1 : 2, // iOS v8 plugin reads 'channels'.
            isUrl: false,
          });
          await NativeAudio.setVolume({
            assetId: `fluffy-${name}`,
            volume: name === 'music' ? 0.36 : 0.72,
          });
        }
        prepared = true;
        return true;
      })().catch(error => {
        report('native preload failed', error);
        startFallback();
        return false;
      });
    }
    return preparing;
  }

  async function syncMusic() {
    if (failed) return;
    const current = ++sequence;
    if (!enabled || paused || !touched) {
      if (playingMusic) {
        playingMusic = false;
        try { await NativeAudio.stop({ assetId: 'fluffy-music' }); }
        catch (error) { report('unable to stop music', error); }
      }
      return;
    }
    if (!await prepare() || !enabled || paused || !touched || current !== sequence) return;
    if (!playingMusic) {
      playingMusic = true;
      try { await NativeAudio.loop({ assetId: 'fluffy-music' }); }
      catch (error) { playingMusic = false; report('unable to play music', error); startFallback(); }
    }
  }

  function effect(kind) {
    if (!enabled || paused) return;
    if (failed) { browserAudio?.effect(kind); return; }
    const name = clips.includes(kind) ? kind : 'pick';
    void prepare().then(ok => {
      if (ok && enabled && !paused) {
        return NativeAudio.play({ assetId: `fluffy-${name}` }).catch(error => {
          report(`effect ${name} failed`, error);
          startFallback();
          browserAudio?.effect(name);
        });
      }
    });
  }

  function onGesture() {
    if (!enabled || paused || touched) return;
    touched = true;
    if (failed) browserAudio?.resume();
    else void syncMusic();
  }

  function setEnabled(value, defer = false) {
    enabled = Boolean(value);
    if (failed) {
      browserAudio?.setEnabled(enabled, defer);
      return;
    }
    if (enabled && !defer) touched = true;
    if (!enabled) browserAudio?.setEnabled(false);
    void syncMusic();
    if (enabled && !defer) effect('pick'); // Audible confirmation when unmuted.
  }

  function pause() {
    paused = true;
    if (failed) browserAudio?.pause();
    else void syncMusic();
  }

  function resume() {
    paused = false;
    if (failed) browserAudio?.resume();
    else void syncMusic();
  }

  for (const event of ['touchstart', 'pointerdown', 'click', 'keydown']) {
    document.addEventListener(event, onGesture, { passive: true });
  }

  window.FluffyAudio = {
    setEnabled, effect, pause, resume,
    diagnostics: () => ({ engine: failed ? 'web-fallback' : 'native', enabled, paused, touched, prepared, playingMusic }),
  };
}
