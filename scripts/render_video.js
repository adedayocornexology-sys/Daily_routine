// Usage: node scripts/render_video.js <template.html> <design-spec.json> <output.mp4>
const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { PassThrough } = require('stream');
const { findChrome } = require('./find-chrome');

(async () => {
  const [templatePath, specPath, output] = process.argv.slice(2);
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const { w, h, fps, duration } = spec.format.video;

  const browser = await puppeteer.launch({
    executablePath: findChrome(() => puppeteer.executablePath()),
    args: [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
      '--disable-gpu', '--disable-software-rasterizer', '--disable-extensions', '--single-process'
    ]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h });
  await page.evaluateOnNewDocument((injectedSpec) => {
    window.SPEC = injectedSpec;
  }, spec);
  await page.goto('file://' + path.resolve(templatePath) + '?mode=video', { waitUntil: 'load' });
  await page.waitForFunction('window.READY === true');
  await page.evaluate(() => document.fonts.ready);

  const frames = new PassThrough();
  const total = Math.round(fps * duration);

  const done = new Promise((resolve, reject) => {
    ffmpeg(frames)
      .inputFormat('image2pipe')
      .inputFPS(fps)
      .videoCodec('libx264')
      .outputOptions(['-pix_fmt yuv420p', '-preset ultrafast', '-crf 28', '-movflags +faststart'])
      .on('error', reject)
      .on('end', resolve)
      .save(output);
  });

  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.seekTo(t), f / fps);
    const jpeg = await page.screenshot({ type: 'jpeg', quality: 90 });
    frames.write(jpeg);
  }
  frames.end();

  await done;
  await browser.close();
  console.log('rendered:', output);
})();
