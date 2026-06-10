---
name: moyacode-poster
description: Design and export branded posters for MoyaCode programs, events, and daily content. Produces 420×740px HTML rendered to PNG via scripts/render.js.
---

# MoyaCode Poster Skill

## Brand Tokens — Deep Ocean Bioluminescence
- Background: #0A0F1E (Deep Ocean dark)
- Teal #00E5A0 (primary CTA, logo, highlights)
- Coral #FF5C7A (eyebrow labels, secondary badges)
- Amber #FFD166 (tertiary stats, warm pops)
- Fonts: Bebas Neue (labels) + Space Grotesk (body/UI) + Syne 800 (hero display)
- Grid overlay: rgba(0,229,160,0.06) dots at 28px
- Grain: SVG feTurbulence, opacity 0.35
- Top bar: 5px gradient teal → coral → amber

## Layout (420×740px, top to bottom)
1. 5px gradient top bar
2. HEADER — "MOYACODE" wordmark (MOYA white + CODE teal), year/edition badge right
3. HERO — coral eyebrow (uppercase, 3px tracking, 24px line prefix),
   3-line Syne 800 headline: line 1 white · line 2 teal · line 3
   hollow stroke (-webkit-text-stroke), then subheadline body copy
4. DIVIDER — teal→coral gradient line
5. TRACKS — exactly 3 pills: teal / coral / amber
6. STATS — exactly 3 cards, Bebas Neue numerals colored teal/coral/amber
7. CTA BOX — teal-tinted bg + teal border, info left, solid-teal button right
8. FOOTER — location left, hashtag right (teal)

## Background layers (always stack): .bg-grid → .bg-glow-teal
(top-right radial) → .bg-glow-coral (bottom-left radial) → .bg-grain
Decorative: concentric circles top-right, vertical code tag like </bootcamp>

## Tone
Cinematic, premium, gamified — never generic or flat. Characters when
relevant: Archie (HTML), Aura (CSS), Logic (JS).

## Layout safety rules (learned from production)
- Syne renders WIDE: hero headline 42–46px max or it wraps/overflows
- After sizing, verify hero + subhead don't collide with tracks/stats
- Use the local @font-face block (Step 5), never Google Fonts CDN

## Caption (always generate alongside)
Hook line → value line(s) → CTA → #MoyaCode + relevant hashtags.
Audience: Owo/Ondo parents and students. Venue default: Owo, Ondo State.
