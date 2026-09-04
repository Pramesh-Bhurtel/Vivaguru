# Android-First UI/UX & Design System Specification — VivaGuru

This document provides the design system specifications, responsive layout guidelines, Material Design 3 alignment rules, and typography choices for VivaGuru.

---

## 1. Design Philosophy

VivaGuru is designed around the concept of an **Authoritative Academic Examination Room**. Unlike generic chat applications or playful learning tools, VivaGuru enforces visual focus, solemnity, and clear metacognitive feedback.

### Key Design Pillars
- **Android-First Responsiveness**: Mobile viewports (360px to 412px) receive top priority with Material Design 3 bottom navigation, 48px minimum touch targets, and gesture safe-area padding.
- **Glassmorphic Layering**: Translucent card backgrounds (`glass-card`), subtle metallic borders (`border-slate-800/90`), and ambient glow effects creating spatial depth.
- **High-Contrast Typographic Hierarchy**: Authoritative serif typography (`Fraunces`) for examiner questions contrasted against technical sans-serif (`Inter`) and monospace (`JetBrains Mono`) for metrics.

---

## 2. Color System & Themes

VivaGuru provides 5 visual themes configured via CSS Custom Properties (`index.css`) and managed dynamically via `ThemeContext.tsx`:

| Theme Name | Primary Background | Surface Accent | Accent Color | Ideal Use Case |
|---|---|---|---|---|
| **Midnight (Default)** | `#0a0f1d` | `#0f172a` | `#6366f1` (Indigo) | Focused night study & standard oral defense |
| **OLED Dark** | `#000000` | `#09090b` | `#a855f7` (Purple) | High contrast, battery-saving AMOLED displays |
| **Cyber Deck** | `#060d1f` | `#0b1736` | `#38bdf8` (Cyan) | Modern tech & computer science defense |
| **Sepia Study** | `#151210` | `#221c18` | `#f59e0b` (Amber) | Warm vintage library aesthetic |
| **Academic Light** | `#f8fafc` | `#ffffff` | `#4f46e5` (Deep Indigo) | Daylight reading & formal presentation |

---

## 3. Touch Targets & Safe Area Guidelines

### 3.1 Minimum Touch Dimensions
- **Action Buttons & Navigation Items**: All clickable buttons maintain a minimum touch target size of **48px × 48px** (`min-h-[48px] min-w-[48px]` or `touch-target` class).
- **Tactile Active Feedback**: Buttons feature micro-scale feedback (`active:scale-[0.98]` or `active:scale-95`) to provide immediate physical touch validation on Android devices.

### 3.2 Safe Area Inset Management
- Top headers integrate `safe-area-top` (`padding-top: env(safe-area-inset-top, 0px)`).
- Android bottom navigation and fixed action bars integrate `safe-area-bottom` (`padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px)`).

---

## 4. Typography Scale

```css
/* Primary Typography Families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-serif-examiner: 'Fraunces', Georgia, serif;
--font-mono-code: 'JetBrains Mono', monospace;
```

- **Examiner Inquiry**: `Fraunces` serif, 20px–30px, line-height 1.6, regular weight.
- **UI Labels & Body Text**: `Inter` sans-serif, 12px–16px, medium weight.
- **Metrics, Round Badges & Timers**: `JetBrains Mono` monospace, 10px–12px, bold uppercase with tracking `0.15em`.
