---
name: moyacode-poster
description: Design and export branded MoyaCode visuals as BOTH a static PNG poster and an animated MP4 reel from one design spec. Use this skill whenever Cornelius asks for a poster, flyer, design, visual announcement, or animated/video version of a poster for any MoyaCode event, program, bootcamp, or campaign. Also trigger for Market Ranch poster requests (yellow/black variant — see market-ranch-video skill for the full Market Ranch dual-render pipeline). Architecture is Design Spec → Dual Render — a design-spec.json (the Figma layer) drives one HTML template with a deterministic window.seekTo(t) engine; Playwright captures the static PNG (420×740) and Puppeteer→FFmpeg renders the MP4 (1080×1920, 30fps). Every render is verified by extracting spot frames before delivery. For word-reveal educational reels (not poster-based), use the moyacode-reel skill instead.
---

# MoyaCode Poster Skill — Design Spec → Dual Render

Every poster request now produces **two assets from one spec**: the static PNG (feed/print/WhatsApp) and an animated MP4 reel where the poster *builds itself* on screen (Reels/Stories/TikTok/Status).

Workflow modeled on Anthropic's Fable self-editing pipeline:
1. **Decisions live in `design-spec.json`** with reasoning written down (the `final-edit.json` pattern).
2. **Every frame is a pure function of time** — `window.seekTo(t)`, the Remotion principle without installing Remotion. No CSS keyframes during capture.
3. **Renderers execute the JSON** — Playwright (PNG) and Puppeteer→FFmpeg (MP4) are dumb executors.
4. **Verify your own output** — extract spot frames from the MP4, view them, walk the checklist, fix, re-render.

Optimized for Windows 10 · 1.6GHz · 4GB RAM (ultrafast preset, JPEG frames, ≤30fps).

Sister skills: `moyacode-reel` (word-reveal educational reels — keep using for concept-teaching content), `market-ranch-video` (full Market Ranch dual-render).

---

## Brand Tokens — MoyaCode (default)

```
Background:   #0A0F1E (Deep Ocean dark)
Teal:         #00E5A0 (primary CTA, logo, highlights)
Coral:        #FF5C7A (eyebrow labels, secondary badges)
Amber:        #FFD166 (tertiary stats, warm pops)
Fonts:        Bebas Neue (headlines/labels) + Space Grotesk (body/UI) + Syne 800 (hero display)
Grid overlay: rgba(0,229,160,0.06) — 28px · Grain: SVG feTurbulence 0.35
Top bar:      5px gradient teal → coral → amber
Tone:         cinematic, premium, gamified — never generic or flat
```

Market Ranch variant: `#0A0A0A` + `#FFD600`, Bebas + DM Sans, diagonal split (full pipeline in market-ranch-video skill).

## Fixed Poster Zones (420×740)

```
[topbar]    5px gradient bar
[header]    MOYA white + CODE teal wordmark (left) | year badge (right)
[eyebrow]   coral, uppercase, 3px tracking, 24px coral line prefix
[headline]  3 lines: white / teal .accent / hollow .stroke — Syne 800 ~62px
[subhead]   body copy
[divider]   teal→coral gradient line
[tracks]    3 pill badges — teal / coral / amber
[stats]     3-column card grid (Bebas numerals)
[ctabox]    teal-tinted box + solid teal button
[footer]    location (left) | hashtag (right)
Background layers (always, in order): .bg-grid → .bg-glow-teal → .bg-glow-coral → .bg-grain
Decorative: deco circles (top-right), pulsing dots, vertical code tag e.g. </bootcamp>
```

All design rules from the original poster skill remain in force (logo treatment, 3-line headline, layer order, etc.).

---

## STEP 1 — Write design-spec.json (the Figma layer)

Single source of truth. Both renders consume it. Content fields = the original extraction guide (event name, tagline, eyebrow, 3 tracks, 3 stats, CTA, venue, hashtag). If event name or core message is missing, **ask before building**.

```json
{
  "post_id": "2026-06-11-ondo-codes-hackathon",
  "format": {
    "static": { "w": 420, "h": 740 },
    "video":  { "w": 1080, "h": 1920, "fps": 30, "duration": 12 }
  },
  "content": {
    "eyebrow": "MOYACODE × AJASIN FOUNDATION",
    "headline": ["ONDO", "CODES", "2026"],
    "subhead": "A hackathon for the next generation of Owo builders",
    "tracks": ["HTML & CSS", "JavaScript", "AI Fluency"],
    "stats": [{"v":"3","l":"DAYS"},{"v":"₦0","l":"ENTRY"},{"v":"100+","l":"BUILDERS"}],
    "cta": "REGISTER FREE", "cta_info": "Ajasin Library Hall · Owo",
    "venue": "Owo, Ondo State", "hashtag": "#OndoCodes"
  },
  "timeline": [
    { "t": 0.0, "zone": "topbar",   "anim": "wipeRight",   "dur": 0.5, "why": "brand gradient enters first" },
    { "t": 0.3, "zone": "header",   "anim": "fadeDown",    "dur": 0.4 },
    { "t": 0.8, "zone": "eyebrow",  "anim": "lineGrow",    "dur": 0.5 },
    { "t": 1.3, "zone": "headline", "anim": "lineStagger", "dur": 1.8, "why": "white → teal → stroke, one line per beat" },
    { "t": 3.1, "zone": "subhead",  "anim": "fadeUp",      "dur": 0.5 },
    { "t": 3.6, "zone": "divider",  "anim": "wipeRight",   "dur": 0.4 },
    { "t": 4.0, "zone": "tracks",   "anim": "pillStagger", "dur": 0.9, "why": "teal/coral/amber pop in sequence" },
    { "t": 5.0, "zone": "stats",    "anim": "countUp",     "dur": 1.2, "why": "numerals count up — gamified energy" },
    { "t": 6.4, "zone": "ctabox",   "anim": "popPulse",    "dur": 0.6, "why": "CTA lands last, pulses till end" },
    { "t": 7.0, "zone": "footer",   "anim": "fadeUp",      "dur": 0.4 }
  ],
  "caption": "…",
  "verification": {
    "spot_frames_sec": [0.6, 3.5, 6.8, 11.5],
    "checklist": ["all 4 bg layers visible", "3-line headline treatment correct",
                  "3 pills teal/coral/amber", "stats finished counting at end",
                  "CTA pulsing and readable", "nothing clipped at 1080×1920"]
  }
}
```

Rules:
- Every non-obvious timing choice gets a `"why"`.
- Final 3–5 seconds = full composed poster held (end state). **The static PNG is exactly this end state** — image and video always match.
- Background layers (grid/glows/grain) are visible from t=0 — they don't animate in.

## STEP 2 — One template, deterministic engine

`template.html`, 420×740 logical. `?mode=static` → `seekTo(duration)` → screenshot. `?mode=video` → renderer drives every frame. **No CSS animations/transitions during capture** — motion is computed in JS:

```js
const SPEC = /* injected design-spec.json */;
const ease = { out: p => 1 - Math.pow(1-p, 3),
               back: p => 1 + 2.7*Math.pow(p-1,3) + 1.7*Math.pow(p-1,2) };
const clamp = (t, i) => Math.min(1, Math.max(0, (t - i.t) / i.dur));

const ANIMS = {
  wipeRight:   (el,p) => el.style.clipPath = `inset(0 ${100*(1-ease.out(p))}% 0 0)`,
  fadeDown:    (el,p) => { el.style.opacity=p; el.style.transform=`translateY(${-16*(1-ease.out(p))}px)`; },
  fadeUp:      (el,p) => { el.style.opacity=p; el.style.transform=`translateY(${16*(1-ease.out(p))}px)`; },
  lineGrow:    (el,p) => { el.style.opacity=Math.min(1,p*2);
                           el.querySelector('.line').style.width = `${24*ease.out(p)}px`; },
  lineStagger: (el,p) => { const lines = el.querySelectorAll('.hl');
                           lines.forEach((l,i) => { const lp = Math.min(1, Math.max(0, p*lines.length - i));
                             l.style.opacity = lp; l.style.transform = `translateY(${20*(1-ease.out(lp))}px)`; }); },
  pillStagger: (el,p) => { const pills = el.querySelectorAll('.pill');
                           pills.forEach((pl,i) => { const pp = Math.min(1, Math.max(0, p*pills.length - i));
                             pl.style.opacity = pp; pl.style.transform = `scale(${ease.back(pp)})`; }); },
  countUp:     (el,p) => { el.style.opacity = Math.min(1,p*2);
                           el.querySelectorAll('.stat-v').forEach(s => {
                             const target = s.dataset.v;
                             const num = parseInt(target.replace(/\D/g,'')) || 0;
                             s.textContent = num ? target.replace(/\d+/, Math.round(num*ease.out(p))) : target; }); },
  popPulse:    (el,p,t) => { el.style.opacity=p;
                           el.style.transform = `scale(${p>=1 ? 1+0.015*Math.sin(t*4) : ease.back(p)})`; }
};

window.seekTo = (t) => {
  for (const item of SPEC.timeline) {
    const el = document.getElementById(item.zone);
    if (!el) continue;
    if (t < item.t) { el.style.opacity = 0; continue; }
    ANIMS[item.anim](el, clamp(t, item), t, item);
  }
};
window.READY = true;
```

Markup hooks: headline lines = `<div class="hl">`, pills = `.pill`, stat values = `.stat-v` with `data-v` holding the final string. Video mode: viewport 1080×1920 + `body { zoom: 2.571; }` (letterbox spare pixels with `#0A0F1E`). Google Fonts: Bebas Neue + Space Grotesk + Syne (and `await document.fonts.ready` before any capture).

## STEP 3 — Render both assets

**PNG (Playwright):** 420×740 viewport, `deviceScaleFactor: 2`, `?mode=static`, wait `window.READY` + fonts, screenshot → `<slug>-poster.png`. Use `node scripts/render.js <input.html> <output.png>`.

**MP4 (Puppeteer → FFmpeg stdin):** Use `node scripts/render_video.js <template.html> <design-spec.json> <output.mp4>`.
```js
const total = SPEC.format.video.fps * SPEC.format.video.duration;
for (let f = 0; f < total; f++) {
  await page.evaluate(t => window.seekTo(t), f / SPEC.format.video.fps);
  ffmpeg.stdin.write(await page.screenshot({ type: 'jpeg', quality: 90 }));
}
```
Puppeteer flags (always): `--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu --disable-software-rasterizer --disable-extensions --single-process`
FFmpeg (always): `-r 30 -vcodec libx264 -pix_fmt yuv420p -preset ultrafast -crf 28 -movflags +faststart -shortest` (+ `-i audio.wav` if voiceover/music supplied — e.g. Liam ElevenLabs VO from the content pipeline).

## STEP 4 — Verification pass (mandatory)

```bash
ffmpeg -i <slug>.mp4 -vf "select='eq(t\,0.6)+eq(t\,3.5)+eq(t\,6.8)+eq(t\,11.5)'" -vsync 0 check_%d.jpg
```
View the spot frames AND the PNG. Walk `verification.checklist`. Any failure → fix the spec/engine → re-render → re-verify. Record everything in `render-manifest.json`. Never deliver unverified.

## STEP 5 — Deliver

1. PNG (first) · 2. MP4 · 3. design-spec.json · 4. template + render scripts · 5. caption/announcement copy in the response.

`npm install puppeteer playwright fluent-ffmpeg` · `node scripts/render_video.js design-spec.json`

---

## Figma / design-tool sync (optional layer)

`design-spec.json` IS the Figma file. If Figma MCP is connected in Claude Code: push the composed frame to Figma for review, pull refined tokens/layout back **into the spec** — never bypass it. Canva MCP in claude.ai serves the same role for client-facing variants.

## Claude Code routine integration

```
/loop moyacode-content-daily:
  read calendar/theme → write design-spec.json (with "why" per timing)
  → render PNG + MP4 → verification pass → fix until green
  → save to content/moyacode/YYYY-MM-DD/ (png, mp4, spec, manifest, caption.txt)

/goal do not stop until both PNG and MP4 exist AND every verification check passes
```
Effort xhigh. Batch days: one subagent per post (spec → render → verify), plus one fresh-eyes verifier subagent over all manifests.

## Output Checklist

- [ ] design-spec.json first, reasoning on timing choices
- [ ] PNG end-state == MP4 final frame
- [ ] All 4 background layers, 3-line headline treatment, 3 pills, 3 stats, CTA box, footer
- [ ] No CSS animations — all motion via seekTo(t)
- [ ] MP4: 1080×1920, 30fps, yuv420p, faststart, 8–15s; countUp finished before hold
- [ ] Spot frames extracted, viewed, checklist passed, manifest written
- [ ] PNG + MP4 + spec + caption delivered
