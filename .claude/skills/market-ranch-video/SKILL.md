---
name: market-ranch-video
description: Design and export daily branded Instagram content for Market Ranch. Produces a 420×740px HTML file rendered to PNG via scripts/render.js. Everything changes daily (headline, bubbles, CTA, emoji characters) but the structural layout and brand tokens stay fixed.
---

# Market Ranch Daily Post Skill

## Brand Tokens
- Background: #0A0A0A (near black)
- Primary: #FFD600 (yellow — dominant accent)
- Text on dark: #FFFFFF / Text on yellow: #0A0A0A
- Fonts: Bebas Neue (headlines, labels, ticker) + DM Sans (body, bubbles, CTA)
- Layout: Diagonal split background (dark top / yellow bottom-right)
- Texture: SVG grain overlay on all panels

## Fixed Structural Layout (420×740px) — all 7 zones on every post
1. TOP BRAND BAR — "MARKET RANCH" wordmark left ("RANCH" in yellow), small label right
2. DIAGONAL SPLIT — dark top-left / yellow bottom-right, clip-path cut at ~55-60% down
3. GRAIN OVERLAY — SVG feTurbulence, opacity 0.18–0.25
4. EMOJI CHARACTERS — two large emoji (80–100px) facing each other across the diagonal
5. SPEECH BUBBLES — one per character; bubble color always inverted from its background
6. HEADLINE BLOCK — Bebas Neue 48–56px, 1–3 lines, upper area of dark panel; one key word in yellow
7. YELLOW TICKER + CTA — full-width yellow strip (black Bebas text) above a black CTA bar (DM Sans 13–14px)

## Content Fields (change daily)
headline · bubble_left · bubble_right · emoji_left · emoji_right ·
ticker_text · cta_text · caption

Defaults if unspecified: emoji 🎯/🐄, ticker "Brand Activation · Field
Marketing · Branded Merch · Creative Solutions", CTA "📩 DM us to
activate your brand today".

## Caption Format (always generate alongside)
[Punchy 2-line opener]
[Contrast or tension line]
[Brand positioning statement]
📩 [CTA]
#MarketRanch #BrandActivation #FieldMarketing [relevant hashtags]

## Tone
Cinematic, premium, activation-agency energy. Not startup-casual.
Not corporate-stiff. Audience: Nigerian business owners and brand
managers.

## Layout safety rules (learned from production)
- Headline at 48–52px max; verify no overlap with subhead/bubbles
- Keep bubbles clear of the diagonal seam and each other
- Use the local @font-face block (Step 5), never Google Fonts CDN
