'use strict';

// Real browser QA for the same offline assets shipped inside the Capacitor apps.
// Run from mobile/: node scripts/qa-browser.cjs (requires Playwright + Chromium).
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile, mkdir, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'www');
const artifactRoot = process.env.QA_ARTIFACT_DIR || path.join(root, 'qa-artifacts');
const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json',
};

const profiles = [
  { name: 'iphone-small', width: 375, height: 667, scale: 2, levels: 2 },
  { name: 'android-phone', width: 412, height: 915, scale: 2.625, levels: 2 },
  { name: 'ipad-13', width: 1024, height: 1366, scale: 2, levels: 2 },
];

function serve() {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = path.resolve(publicRoot, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(publicRoot + path.sep)) return void res.writeHead(403).end();
      const bytes = await readFile(file);
      res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' }).end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  return server;
}

async function move(page, from, to, number) {
  const branches = page.locator('#board .branch');
  await branches.nth(from).click();
  await branches.nth(to).click();
  await page.waitForFunction(expected => {
    const counter = Number.parseInt(document.querySelector('#moves')?.textContent || '', 10);
    return counter === expected && !document.querySelector('#undo').disabled;
  }, number, { timeout: 8000 });
}

async function routeFor(page, level, mode = 'adventure') {
  const moves = await page.evaluate(({ level, mode }) =>
    window.FluffyTest.generate(level, mode).route, { level, mode });
  assert.ok(moves.length > 0, `${mode} level ${level} has no solution`);
  return moves;
}

async function playLevel(page, level, mode = 'adventure') {
  assert.equal(Number(await page.locator('#level').innerText()), level);
  const route = await routeFor(page, level, mode);
  for (let i = 0; i < route.length; i++) await move(page, route[i][0], route[i][1], i + 1);
  await page.locator('#modal[open] #next').waitFor({ state: 'visible', timeout: 8000 });
  const summary = await page.locator('#modalContent').innerText();
  assert.ok(summary.includes(`Level ${level} completed in ${route.length} moves`),
    `${mode} level ${level}: victory summary did not match the moves played`);
  await page.locator('#next').click();
  await page.waitForFunction(next => Number(document.querySelector('#level')?.textContent) === next,
    level + 1, { timeout: 5000 });
}

async function testControls(page) {
  const sound = page.locator('#sound');
  assert.equal(await sound.getAttribute('aria-pressed'), 'true');
  await sound.click();
  assert.equal(await sound.getAttribute('aria-pressed'), 'false');
  await sound.click();
  assert.equal(await sound.getAttribute('aria-pressed'), 'true');

  await page.locator('#difficulty').click();
  assert.equal(await page.locator('#switchLanguage').inputValue(), 'en');
  await page.locator('#switchLanguage').selectOption('uk');
  assert.equal(await page.locator('html').getAttribute('lang'), 'uk');
  await page.locator('#switchLanguage').selectOption('en');
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  await page.locator('#motion').click();
  assert.match(await page.locator('#motion').innerText(), /off/i);
  await page.locator('#motion').click();
  assert.match(await page.locator('#motion').innerText(), /on/i);
  await page.locator('#voice').click();
  assert.match(await page.locator('#voice').innerText(), /off/i);
  await page.locator('#voice').click();
  assert.match(await page.locator('#voice').innerText(), /on/i);
  await page.locator('#close').click();

  const initial = await page.locator('#board .branch').evaluateAll(branches =>
    branches.map(branch => branch.getAttribute('aria-label')));
  await page.locator('#hint').click();
  assert.equal(await page.locator('#board .branch.hinted').count(), 2, 'Hint must highlight source and destination');
  await page.locator('#restart').click();
  await page.locator('#yes').click();

  const [a, b] = (await routeFor(page, 1))[0];
  await move(page, a, b, 1);
  await page.locator('#undo').click();
  assert.equal(Number.parseInt(await page.locator('#moves').innerText(), 10), 0);
  assert.deepEqual(await page.locator('#board .branch').evaluateAll(branches =>
    branches.map(branch => branch.getAttribute('aria-label'))), initial, 'Undo must restore all branches');

  await move(page, a, b, 1);
  await page.locator('#restart').click();
  await page.locator('#yes').click();
  assert.equal(Number.parseInt(await page.locator('#moves').innerText(), 10), 0);

  await page.locator('#extra').click();
  assert.equal(await page.locator('#board .branch').count(), 8);
  assert.equal(await page.locator('#extra').isDisabled(), true);
  await page.locator('#restart').click();
  await page.locator('#yes').click();
  assert.equal(await page.locator('#board .branch').count(), 7);
}

async function testProfile(browser, profile, baseUrl) {
  const context = await browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    deviceScaleFactor: profile.scale, isMobile: true, hasTouch: true,
    locale: 'en-US', reducedMotion: 'reduce', serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.locator('#board .branch').first().waitFor();
    assert.equal(await page.locator('#board .branch').count(), 7);
    assert.equal(Number(await page.locator('#level').innerText()), 1);
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');

    const size = await page.evaluate(() => ({
      viewport: window.innerWidth, document: document.documentElement.scrollWidth,
      appLeft: document.getElementById('app').getBoundingClientRect().left,
      appRight: document.getElementById('app').getBoundingClientRect().right,
    }));
    assert.ok(size.document <= size.viewport + 2, `${profile.name}: horizontal overflow ${JSON.stringify(size)}`);
    assert.ok(size.appLeft >= -2 && size.appRight <= size.viewport + 2,
      `${profile.name}: game clipped horizontally ${JSON.stringify(size)}`);

    await testControls(page);
    for (let level = 1; level <= profile.levels; level++) await playLevel(page, level);
    assert.equal(Number(await page.locator('#level').innerText()), 3);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(Number(await page.locator('#level').innerText()), 3, 'Unlocked level must persist');
    const [from, to] = (await routeFor(page, 3))[0];
    await move(page, from, to, 1);
    const boardBefore = await page.locator('#board .branch').evaluateAll(branches =>
      branches.map(branch => branch.getAttribute('aria-label')));
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(Number.parseInt(await page.locator('#moves').innerText(), 10), 1,
      'Unfinished game must persist across reload');
    assert.deepEqual(await page.locator('#board .branch').evaluateAll(branches =>
      branches.map(branch => branch.getAttribute('aria-label'))), boardBefore);

    // Exercise the modes that use different numbers of branches and hidden pets.
    // The existing logic suite separately proves all 100 levels in each mode.
    if (profile.name === 'android-phone') {
      await page.locator('#difficulty').click();
      await page.locator('[data-mode="cozy"]').click();
      assert.equal(await page.locator('#board .branch').count(), 6);
      await playLevel(page, 1, 'cozy');

      await page.locator('#difficulty').click();
      await page.locator('[data-mode="expert"]').click();
      assert.equal(await page.locator('#board .branch').count(), 7);
      assert.equal(await page.locator('#extra').isDisabled(), true, 'Expert mode must not allow extra branches');
      await playLevel(page, 1, 'expert');
    }
    assert.deepEqual(pageErrors, [], `${profile.name}: uncaught browser errors`);
    return { device: profile.name, status: 'pass', levels: profile.levels, viewport: `${profile.width}x${profile.height}` };
  } catch (error) {
    await mkdir(artifactRoot, { recursive: true });
    await page.screenshot({ path: path.join(artifactRoot, `${profile.name}-failure.png`), fullPage: true }).catch(() => {});
    return { device: profile.name, status: 'fail', error: error.stack || String(error), pageErrors };
  } finally {
    await context.close();
  }
}

(async () => {
  const server = serve();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const baseUrl = `http://127.0.0.1:${server.address().port}/`;
    const results = [];
    for (const profile of profiles) {
      const result = await testProfile(browser, profile, baseUrl);
      results.push(result);
      console.log(`${result.status.toUpperCase()}: ${profile.name}${result.error ? '\n' + result.error : ''}`);
    }
    await mkdir(artifactRoot, { recursive: true });
    await writeFile(path.join(artifactRoot, 'qa-summary.json'), JSON.stringify(results, null, 2));
    if (results.some(result => result.status !== 'pass')) process.exitCode = 1;
    else console.log('PASS: UI gameplay, navigation, controls and persistence on three mobile/tablet sizes');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
