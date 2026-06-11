// Playwright's browser CDN is blocked in some cloud envs; fall back to
// any Chrome already on the machine (CHROME_PATH or puppeteer's cache).
const fs = require('fs');
const os = require('os');
const path = require('path');

function findChrome(getDefaultExecutablePath) {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH))
    return process.env.CHROME_PATH;
  try {
    const defaultPath = getDefaultExecutablePath && getDefaultExecutablePath();
    if (defaultPath && fs.existsSync(defaultPath)) return undefined; // use the library's own
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

module.exports = { findChrome };
