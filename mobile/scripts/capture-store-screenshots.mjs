import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wwwRoot = path.join(mobileRoot, 'www');
const outputRoot = path.join(mobileRoot, 'store', 'screenshots');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(wwwRoot, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(wwwRoot + path.sep)) { res.writeHead(403).end(); return; }
    const content = await readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }).end(content);
  } catch { res.writeHead(404).end(); }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  await mkdir(outputRoot, { recursive: true });
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'en-US',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle' });
  await page.locator('#board .branch').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  const capture = async (name) => {
    await page.screenshot({ path: path.join(outputRoot, name), animations: 'disabled' });
    console.log(`Captured ${name}`);
  };

  await capture('01-forest-adventure.png');
  await page.locator('#difficulty').click();
  await page.locator('[data-mode="cozy"]').click();
  await page.evaluate(() => window.start(9));
  await capture('02-cozy-puzzles.png');
  await page.locator('#difficulty').click();
  await page.locator('[data-mode="expert"]').click();
  await page.evaluate(() => window.start(16));
  await capture('03-expert-challenge.png');
  await page.locator('#difficulty').click();
  await capture('04-three-modes-and-languages.png');
  await browser.close();
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
}
