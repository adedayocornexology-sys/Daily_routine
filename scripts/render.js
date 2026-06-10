// Usage: node scripts/render.js <input.html> <output.png>
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Playwright's browser CDN is blocked in some cloud envs; fall back to
// any Chrome already on the machine (CHROME_PATH or puppeteer's cache).
function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH))
    return process.env.CHROME_PATH;
  try {
    chromium.executablePath();
    if (fs.existsSync(chromium.executablePath())) return undefined; // use playwright's own
  } catch {}
  const base = path.join(os.homedir(), '.cache', 'puppeteer', 'chrome');
  if (fs.existsSync(base)) {
    for (const v of fs.readdirSync(base)) {
      const p = path.join(base, v, 'chrome-linux64', 'chrome');
      if (fs.existsSync(p)) return p;
    }
  }
  return undefined;
}

(async () => {
  const [input, output] = process.argv.slice(2);
  const browser = await chromium.launch({
    executablePath: findChrome(),
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 420, height: 740 });
  await page.goto('file://' + path.resolve(input));
  await page.waitForTimeout(1800); // fonts + animations settle
  await page.screenshot({
    path: output,
    clip: { x: 0, y: 0, width: 420, height: 740 }
  });
  await browser.close();
  console.log('rendered:', output);
})();
