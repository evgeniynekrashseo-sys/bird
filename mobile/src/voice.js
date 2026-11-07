import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// Native Android/iOS TTS uses the voice installed for the player's language.
// Web players use the device's built-in Web Speech implementation.
let request = 0;
export async function speak(text, lang, options = {}) {
  const id = ++request;
  if (!text) return;
  const pet = options.pet === true;
  try {
    if (Capacitor.isNativePlatform()) {
      await TextToSpeech.stop();
      if (id !== request) return;
      await TextToSpeech.speak({
        text, lang,
        rate: pet ? 1.06 : 0.94,
        pitch: pet ? 1.55 : 1.06,
        volume: 1,
        category: 'playback', queueStrategy: 1,
      });
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = pet ? 1.06 : 0.94;
      utterance.pitch = pet ? 1.55 : 1.06;
      const voices = window.speechSynthesis.getVoices();
      const exact = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase());
      const related = voices.find(v => v.lang.toLowerCase().split('-')[0] === lang.toLowerCase().split('-')[0]);
      if (exact || related) utterance.voice = exact || related;
      if (id === request) window.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    // Missing voice packs must never interrupt gameplay.
    console.warn('Speech unavailable for locale', lang, error?.message || error);
  }
}

export async function stop() {
  request++;
  try {
    if (Capacitor.isNativePlatform()) await TextToSpeech.stop();
    else window.speechSynthesis?.cancel();
  } catch {}
}

window.FluffyVoice = { speak, stop };
