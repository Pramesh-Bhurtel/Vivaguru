# Vivaguru — Design Document

## 1. Design Philosophy

The product's emotional core is **tension and focus** — the feeling of sitting across from an examiner. The UI should feel like a premium, quiet, serious room. Not playful, not "startup gradient blob," not another generic chatbot skin.

Reference feel: a mix of a modern courtroom/interview room and a minimalist exam hall. Calm but weighted. Confidence-inspiring, not intimidating-to-the-point-of-unusable.

**Avoid at all costs (judges have seen these 1000 times):**
- Purple/blue gradient hero + "Powered by AI ✨" badge
- Generic chat bubble UI (this is not a chatbot, don't make it look like one)
- Emoji-heavy copy
- Default shadcn look with zero customization

---

## 2. Visual System

### Color Palette
Dark, focused, exam-room mood — not corporate SaaS light theme.

```
--bg-primary:      #0E0F13   (near-black, warm undertone)
--bg-surface:      #16181D   (card/panel background)
--bg-elevated:      #1E2128   (modals, active exam card)
--border-subtle:    #2A2D35
--text-primary:     #F2F1ED   (warm off-white, not pure white)
--text-secondary:   #9A9CA5
--accent-gold:       #C9A24B  (the "examiner" accent — used sparingly, for authority)
--accent-red-flag:   #C4544A  (weak answer indicator)
--accent-green-ok:   #6FA97E  (strong answer indicator)
--accent-amber:      #D3A73C  (adequate answer indicator)
```

Gold is the signature accent — think brass nameplate / examiner's pen, not neon.

### Typography
- **Headings:** A serif with authority — "Fraunces" or "Newsreader" (Google Fonts, free).
- **Body/UI:** "Inter" — clean, readable.
- **Examiner's spoken questions:** Render in the serif, larger size — it should feel like it's being *said to you*, not printed in a UI label.

### Motion
- Minimal. One meaningful animation: when the AI is "thinking" between your answer and its follow-up, show a slow single-line pulse (like a thinking pause), not a spinning loader.
- Screen transitions: simple fade, 200ms. No bouncy/playful easing.

---

## 3. Screens

### Screen 1 — Input / "Enter the Exam Room"
- Centered, minimal. A single large text area: *"Paste your notes, chapter, or topic."*
- Preset topics for instant 1-click testing.
- Subtle difficulty selector: Friendly / Standard / Hostile Examiner.
- One button: **"Begin Viva"** — deliberate, formal wording.

### Screen 2 — The Exam Room
- **Left/main pane (70%):** the live exchange — examiner's question in serif at top, your answer input below it. Previous Q&A collapse into a subtle scrollable trail above, dimmed.
- **Right pane (30%), collapsible:** the **Prompt Log** — real-time feed of what's being sent to the AI and the structured scoring it returns.
- Progress indicator: "Question 3 of ~6".
- Color-coded micro-feedback after each answer.

### Screen 3 — Examiner's Report
- Styled like a formal report card / certificate.
- Big **Confidence Score** (0–100) top center, in gold serif numerals.
- Two columns: "Concepts You Defended Well" / "Concepts to Revisit"
- In-character examiner feedback & concrete study suggestions.
- CTA: "Start a New Viva"
