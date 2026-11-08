'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const names = ['music', 'pick', 'move', 'invalid', 'complete', 'win', 'chirp'];

async function build(native = true) {
  return (await esbuild.build({
    entryPoints: [path.join(root, 'src/native-audio.js')],
    bundle: true, write: false, format: 'iife', platform: 'browser',
    plugins: [{
      name: 'mock-native-audio',
      setup(api) {
        api.onResolve({ filter: /^@capacitor\/core$/ }, () => ({ path: 'capacitor', namespace: 'mock' }));
        api.onResolve({ filter: /^@capacitor-community\/native-audio$/ }, () => ({ path: 'native-audio', namespace: 'mock' }));
        api.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({
          contents: args.path === 'capacitor'
            ? `export const Capacitor = {isNativePlatform: () => ${native}};`
            : 'export const NativeAudio = globalThis.mockPlugin;',
          loader: 'js',
        }));
      },
    }],
  })).outputFiles[0].text;
}

async function tick() {
  for (let i = 0; i < 100; i++) await Promise.resolve();
}

(async () => {
  const state = [];
  const listeners = {};
  const fallback = { setEnabled() { state.push('fallback'); }, effect() {}, pause() {}, resume() {} };
  const mockPlugin = {
    async configure(opts) { state.push(['configure', opts]); },
    async preload(opts) { state.push(['preload', opts]); },
    async setVolume(opts) { state.push(['volume', opts]); },
    async loop(opts) { state.push(['loop', opts]); },
    async stop(opts) { state.push(['stop', opts]); },
    async play(opts) { state.push(['play', opts]); },
  };
  const sandbox = {
    mockPlugin,
    window: { FluffyAudio: fallback },
    document: { addEventListener(event, cb) { listeners[event] = cb; } },
    console,
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(await build(true), sandbox);

  const native = sandbox.window.FluffyAudio;
  assert.notEqual(native, fallback, 'Native audio replaces silent WebAudio on iOS');
  native.setEnabled(true, true);
  await tick();
  assert.equal(state.filter(x => x[0] === 'loop').length, 0, 'Background music must wait for a gesture');

  listeners.touchstart();
  await tick();
  assert.equal(state.filter(x => x[0] === 'configure').length, 1, 'Configure native playback once');
  assert.equal(state.find(x => x[0] === 'configure')[1].focus, true, 'Silent switch must not mute the game');
  assert.equal(state.filter(x => x[0] === 'preload').length, 7, 'Preload the music and six effects');
  assert.equal(state.find(x => x[0] === 'preload' && x[1].assetId === 'fluffy-pick')[1].channels,
    2, 'Native iOS effects must use both available channels');
  assert.equal(state.filter(x => x[0] === 'loop').length, 1, 'Native soundtrack should loop after tapping');

  native.effect('pick');
  native.effect('complete');
  native.effect('chirp');
  await tick();
  assert.deepEqual(state.filter(x => x[0] === 'play').map(x => x[1].assetId),
    ['fluffy-pick', 'fluffy-complete', 'fluffy-chirp']);

  const beforeMute = state.length;
  native.setEnabled(false);
  await tick();
  native.effect('pick');
  await tick();
  assert.ok(state.slice(beforeMute).some(x => x[0] === 'stop' && x[1].assetId === 'fluffy-music'),
    'Mute must stop the native music');
  assert.equal(state.filter(x => x[0] === 'play').length, 3, 'Mute must suppress effects');

  native.setEnabled(true);
  await tick();
  assert.equal(state.filter(x => x[0] === 'loop').length, 2, 'Unmute should restart the music');
  assert.equal(state.filter(x => x[0] === 'play').length, 4, 'Unmute should give a confirmation sound');
  native.pause();
  await tick();
  native.resume();
  await tick();
  assert.equal(state.filter(x => x[0] === 'loop').length, 3, 'Resume should restart soundtrack');

  const web = { window: { FluffyAudio: fallback }, mockPlugin, document: sandbox.document, console };
  web.globalThis = web;
  vm.runInNewContext(await build(false), web);
  assert.equal(web.window.FluffyAudio, fallback, 'Browser uses original WebAudio engine');

  for (const name of names) {
    const nativeFile = path.join(root, 'ios/App/App/sounds', name + '.mp3');
    assert.ok(fs.existsSync(nativeFile), `Bundled iOS asset ${name} is missing`);
    assert.ok(fs.statSync(nativeFile).size > 1000, `Sound ${name} is empty`);
  }
  const project = fs.readFileSync(path.join(root, 'ios/App/App.xcodeproj/project.pbxproj'), 'utf8');
  for (const name of names) assert.ok(project.includes(name + '.mp3 in Resources'), `${name} is not copied into the iOS app bundle`);
  const podfile = fs.readFileSync(path.join(root, 'ios/App/Podfile'), 'utf8');
  assert.ok(podfile.includes("pod 'CapacitorCommunityNativeAudio'"), 'Native audio must be registered in the iOS CocoaPods project');
  assert.ok(podfile.includes("pod 'CapacitorCommunityTextToSpeech'"), 'Animal hint voice plugin must remain registered');
  assert.ok(!fs.existsSync(path.join(root, 'ios/App/CapApp-SPM')),
    'The old SPM directory must be absent or Capacitor will ignore CocoaPods');
  for (const workflow of ['ios-build.yml', 'ios-release.yml']) {
    const yml = fs.readFileSync(path.join(root, '..', '.github/workflows', workflow), 'utf8');
    assert.ok(yml.includes('-workspace App.xcworkspace'), `iOS ${workflow} must compile using installed pods`);
  }
  const index = fs.readFileSync(path.join(root, 'www/index.html'), 'utf8');
  assert.ok(index.indexOf('audio.js') < index.indexOf('native-audio.js') && index.indexOf('native-audio.js') < index.indexOf('game.js'),
    'Native audio bridge must replace WebAudio before the game initializes');
  console.log('PASS: native audio loading, mute, music, effects, resume, web fallback and iOS asset bundle');
})().catch(error => { console.error(error); process.exitCode = 1; });
