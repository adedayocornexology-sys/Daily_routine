---
name: market-ranch-video
description: Design and export daily branded Instagram content for Market Ranch as BOTH a static PNG poster and an animated MP4 reel from one design spec. Use this skill whenever Cornelius asks for a Market Ranch post, daily video, reel, content clip, or branded visual for Market Ranch — even casual requests like "make today's Market Ranch post" or "new Market Ranch video". Always use this skill for Market Ranch content. Architecture is Design Spec → Dual Render — a design-spec.json (the Figma layer) drives one HTML template with a deterministic window.seekTo(t) engine; Playwright captures the static PNG (420×740) and Puppeteer→FFmpeg renders the MP4 reel (1080×1920, 30fps). Every render is verified by extracting spot frames and checking them before delivery.
---

# Market Ranch Content Skill — Design Spec → Dual Render

One design decision, two assets: a static **PNG poster** (feed) and an animated **MP4 reel** (Reels/Stories/TikTok), from a single `design-spec.json`.

Workflow modeled on Anthropic's Fable self-editing pipeline:
1. **Decisions live in a JSON artifact** (`design-spec.json`) with reasoning written down — like `final-edit.json`.
2. **Every frame is a pure function of time** (`window.seekTo(t)`) — the Remotion principle, without installing Remotion. No CSS keyframes during capture.
3. **The renderer just executes the JSON** — Playwright/Puppeteer/FFmpeg are dumb executors.
4. **Verify your own output** — extract spot frames from the rendered MP4, view them, check the checklist, fix the spec, re-render. Verify the right work, not just that work happened.

Optimized for Windows 10 · 1.6GHz · 4GB RAM (ultrafast preset, JPEG frames, ≤30fps).

---

## Brand Tokens (fixed)

```
Background:     #0A0A0A  (near black)
Primary:        #FFD600  (yellow — dominant accent)
Text on dark:   #FFFFFF  | Text on yellow: #0A0A0A
Fonts:          Bebas Neue (headlines, labels, ticker) + DM Sans (body, bubbles, CTA)
Layout:         Diagonal split (dark top-left / yellow bottom-right, cut at ~55-60%)
Texture:        SVG feTurbulence grain overlay, opacity 0.18–0.25
Tone:           Cinematic, premium, activation-agency energy
```

## Fixed Structural Zones (all 7 present, every post)

```
[brandbar]   Top strip — "MARKET RANCH" Bebas white, tagline/date right
[bg]         Diagonal split + grain
[emoji_left] / [emoji_right]   Two characters facing each other across the divide (80–100px)
[bubble_left] / [bubble_right] Speech bubbles, colors inverted from their background
[headline]   Bebas Neue 48–64px, dark panel, upper-center/left
[ticker]     Full-width yellow strip near bottom, black Bebas text
[cta]        DM Sans 13–14px, bottom 40px region
```

---

## STEP 1 — Write design-spec.json (the Figma layer)

This file is the single source of truth. Both renders consume it. Never hardcode content into the template.

```json
{
  "post_id": "2026-06-11-firstbank-activation",
  "format": {
    "static":  { "w": 420,  "h": 740 },
    "video":   { "w": 1080, "h": 1920, "fps": 30, "duration": 12 }
  },
  "content": {
    "headline":     "YOUR BRAND DESERVES THE FIELD",
    "bubble_left":  "We run activations 🔥",
    "bubble_right": "Market Ranch delivers.",
    "emoji_left":   "🎯",
    "emoji_right":  "🐄",
    "ticker_text":  "Brand Activation · Field Marketing · Branded Merch · Creative Solutions",
    "cta_text":     "📩 DM us to activate your brand"
  },
  "timeline": [
    { "t": 0.0, "zone": "bg",          "anim": "diagonalWipe", "dur": 0.8, "why": "brand entrance — yellow slices in" },
    { "t": 0.4, "zone": "brandbar",    "anim": "slideDown",    "dur": 0.4 },
    { "t": 1.0, "zone": "headline",    "anim": "wordReveal",   "dur": 2.2, "why": "one word per beat, Bebas punch" },
    { "t": 3.4, "zone": "emoji_left",  "anim": "pop",          "dur": 0.4 },
    { "t": 3.8, "zone": "bubble_left", "anim": "bubblePop",    "dur": 0.5 },
    { "t": 4.8, "zone": "emoji_right", "anim": "pop",          "dur": 0.4 },
    { "t": 5.2, "zone": "bubble_right","anim": "bubblePop",    "dur": 0.5, "why": "Market Ranch answers last — gets the mic" },
    { "t": 6.0, "zone": "ticker",      "anim": "scrollLoop",   "dur": 6.0 },
    { "t": 7.0, "zone": "cta",         "anim": "fadeUpPulse",  "dur": 0.6 }
  ],
  "caption": "…(Instagram caption, generated alongside)…",
  "verification": {
    "spot_frames_sec": [0.5, 4.0, 8.0, 11.5],
    "checklist": ["diagonal split visible", "grain present", "both bubbles inverted colors",
                  "ticker readable", "CTA on screen at end", "nothing clipped at 1080×1920"]
  }
}
```

Rules:
- Every non-obvious timing choice gets a `"why"` — decisions with reasoning written down.
- Last 3–4 seconds = full composed poster held still (everything at end state). **The static PNG is exactly this end state** — guaranteed consistency between image and video.
- Total duration 8–15s. Ticker `scrollLoop` runs continuously once started.

If `headline` is missing from the request, **ask before building**. Everything else has defaults (see content table in the old skill — defaults unchanged).

## STEP 2 — One template, deterministic engine

Single `template.html`, 420×740 logical design. Two modes via query param:
- `?mode=static` → `seekTo(duration)` once → final composed frame → screenshot.
- `?mode=video` → renderer drives `seekTo(t)` frame by frame.

**Critical: NO CSS animations/transitions during capture.** All motion is computed in JS as a pure function of `t`:

```js
// In template.html — the engine
const SPEC = /* injected design-spec.json */;
const ease = {
  out:   p => 1 - Math.pow(1 - p, 3),
  back:  p => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2)
};
const clamp = (t, item) => Math.min(1, Math.max(0, (t - item.t) / item.dur));

const ANIMS = {
  diagonalWipe: (el, p) => el.style.clipPath = `polygon(0 0, 100% 0, 100% ${55 + 45*(1-ease.out(p))}%, 0 100%)`,
  slideDown:    (el, p) => { el.style.transform = `translateY(${-60*(1-ease.out(p))}px)`; el.style.opacity = p; },
  wordReveal:   (el, p) => { const words = el.querySelectorAll('.w'); const n = Math.floor(p * words.length + 0.001);
                             words.forEach((w,i) => { w.style.opacity = i < n ? 1 : 0;
                               w.style.transform = i < n ? 'none' : 'translateY(14px)'; }); },
  pop:          (el, p) => { el.style.transform = `scale(${ease.back(p)})`; el.style.opacity = Math.min(1, p*3); },
  bubblePop:    (el, p) => { el.style.transform = `scale(${ease.back(p)}) translateY(${6*(1-p)}px)`; el.style.opacity = p; },
  scrollLoop:   (el, p, t, item) => el.style.transform = `translateX(${-(((t - item.t) * 60) % el.scrollWidth)}px)`,
  fadeUpPulse:  (el, p, t) => { el.style.opacity = p;
                             el.style.transform = `translateY(${10*(1-ease.out(p))}px) scale(${p>=1 ? 1+0.02*Math.sin(t*4) : 1})`; }
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

Headline markup: wrap each word in `<span class="w">` so `wordReveal` works.
Video viewport is 1080×1920 with `body { zoom: 2.571; }` injected in video mode (420×740 → 1080×1903, letterbox the 17px with background color). Fonts: Bebas Neue + DM Sans via Google Fonts CDN.

## STEP 3 — Render both assets

**PNG (Playwright):** viewport 420×740, `deviceScaleFactor: 2` (crisp 840×1480 export), goto `?mode=static`, wait for `window.READY` + fonts (`document.fonts.ready`), screenshot → `market-ranch-<slug>.png`. Use `node scripts/render.js <input.html> <output.png>`.

**MP4 (Puppeteer → FFmpeg stdin):** Use `node scripts/render_video.js <template.html> <design-spec.json> <output.mp4>`.

```js
// render_video.js — core loop
const total = SPEC.format.video.fps * SPEC.format.video.duration;
for (let f = 0; f < total; f++) {
  await page.evaluate(t => window.seekTo(t), f / SPEC.format.video.fps);
  ffmpeg.stdin.write(await page.screenshot({ type: 'jpeg', quality: 90 }));
}
```

Puppeteer flags (always, low-spec): `--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu --disable-software-rasterizer --disable-extensions --single-process`

FFmpeg (always): `-r 30 -vcodec libx264 -pix_fmt yuv420p -preset ultrafast -crf 28 -movflags +faststart -shortest`
Optional audio: add `-i audio.wav` if a track is supplied.

## STEP 4 — Verification pass (mandatory, before delivery)

Like Fable re-transcribing its own cut — check the actual output, not the intention:

```bash
ffmpeg -i market-ranch-<slug>.mp4 -vf "select='eq(t\,0.5)+eq(t\,4)+eq(t\,8)+eq(t\,11.5)'" -vsync 0 check_%d.jpg
```

View `check_*.jpg` AND the PNG. Walk the spec's `verification.checklist`. Any failure → fix `design-spec.json` or the engine → re-render → re-verify. Write results into `render-manifest.json` (spec + pass/fail per check + what was fixed). Never deliver an unverified render.

## STEP 5 — Deliver

1. `market-ranch-<slug>.png` (first), 2. `market-ranch-<slug>.mp4`, 3. `design-spec.json`, 4. template + render scripts, 5. Instagram caption printed in the response (format: punchy 2-line opener → contrast line → positioning statement → 📩 CTA → #MarketRanch #BrandActivation #FieldMarketing + relevant tags).

`npm install puppeteer playwright fluent-ffmpeg` · `node scripts/render_video.js design-spec.json`

---

## Figma / design-tool sync (optional layer)

`design-spec.json` IS the Figma file for this pipeline. When a design tool is connected:
- **Figma MCP (Claude Code):** export the composed static frame into a Figma frame for client/team review; import refined tokens or layout tweaks back into the spec. Tokens flow one way at a time — the spec stays the source of truth.
- **Canva MCP (claude.ai):** same idea for client-facing variants.
Never let tool output bypass the spec — edit the spec, re-render.

## Claude Code routine integration

This skill is loop-ready:
```
/loop market-ranch-daily:
  read content calendar / today's theme
  → write design-spec.json (with "why" on every timing choice)
  → render PNG + MP4 → verification pass → fix until green
  → save to content/market-ranch/YYYY-MM-DD/ (png, mp4, spec, manifest, caption.txt)

/goal do not stop until both PNG and MP4 exist AND every verification check passes
```
Effort: xhigh. For batch days, fan out one subagent per post (each owns its own spec → render → verify), one verifier subagent doing a fresh-eyes pass on all manifests — one subagent per scene, verifiers double-checking.

## Output Checklist

- [ ] design-spec.json written first, with reasoning on timing choices
- [ ] PNG end-state == MP4 final frame (same composed poster)
- [ ] All 7 structural zones present; diagonal split, grain, inverted bubbles
- [ ] No CSS animations — all motion via seekTo(t)
- [ ] MP4: 1080×1920, 30fps, yuv420p, faststart, 8–15s
- [ ] Spot frames extracted, viewed, checklist passed, manifest written
- [ ] PNG + MP4 + spec + caption delivered
