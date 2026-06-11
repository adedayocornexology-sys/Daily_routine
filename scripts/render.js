// Usage: node scripts/render.js <input.html> <output.png>
const { chromium } = require('playwright');
const path = require('path');
const { findChrome } = require('./find-chrome');

(async () => {
  const [input, output] = process.argv.slice(2);
  const browser = await chromium.launch({
    executablePath: findChrome(() => chromium.executablePath()),
    args: ['--no-sandbox']
  });
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.setViewportSize({ width: 420, height: 740 });
  await page.goto('file://' + path.resolve(input));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800); // fonts + animations settle
  await page.screenshot({
    path: output,
    clip: { x: 0, y: 0, width: 420, height: 740 }
  });
  await browser.close();
  console.log('rendered:', output);
})();
