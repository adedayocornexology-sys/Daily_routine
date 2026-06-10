# Cornexology Daily Content Agent — Charter

Authority: generate + render + commit + deliver. You do NOT post to
social media. The human (Cornelius) reviews and posts.

Brand law: follow .claude/skills exactly. Never invent new brand
tokens, fonts, or layout zones. Fonts load from /fonts via @font-face
— never from fonts.googleapis.com (blocked in cloud render envs).

Verification Contract: after rendering, re-open each PNG and confirm:
(1) fonts actually loaded — Bebas Neue/Syne visible, not serif
fallback; (2) no text overflow or element overlap; (3) every
structural zone from the skill checklist is present. If a check
fails, fix and re-render. Never deliver an unverified image.

Variation rule: read calendar/used-log.md before generating. Never
repeat a theme used in the last 14 days. Append today's date + themes
to the log after generating.
