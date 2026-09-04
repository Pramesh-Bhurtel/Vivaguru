# System Architecture & Technical Specifications — VivaGuru

This document details the software architecture, data flow, state management, and offline fallback mechanisms powering VivaGuru.

---

## 1. System Overview & Technology Stack

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                           CLIENT LAYER (PWA)                            │
 │  React 19 • Tailwind CSS v4 • D3.js & Recharts • Web Speech STT/TTS      │
 │  Android Bottom Navigation • Safe Area Inset Manager • LocalStorage     │
 └────────────────────┬──────────────────────────────▲────────────────────┘
                      │ HTTP / JSON API              │ Socratic Fallback
                      ▼                              │ Stream
 ┌───────────────────────────────────────────────────┴─────────────────────┐
 │                         SERVER LAYER (EXPRESS)                          │
 │  Node.js / Express • Session State Machine • Gemini 3.8 Flash SDK      │
 │  Prompt Logger • Error Middleware • CORS & Health Check                 │
 └────────────────────┬────────────────────────────────────────────────────┘
                      │ SDK Invocation
                      ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                      LLM ENGINE (GOOGLE GEMINI 3.8)                     │
 │  Structured JSON Schema Generation • Demeanor Protocol Tuning          │
 └─────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Core Stack Specifications
- **Frontend Framework**: React 19 (`react`, `react-dom`)
- **Styling & Design Token System**: Tailwind CSS v4 (`@tailwindcss/vite`), custom CSS variables, Material Design 3 guidelines.
- **Charts & Data Visualization**: D3 (`d3`, `@types/d3`) for Concept Mastery Pie Matrix; Recharts (`recharts`) for Score Progression Trajectory.
- **Iconography**: Lucide React (`lucide-react`)
- **Document Processing**: PDF.js (`pdfjs-dist`) for client-side PDF text extraction; html2canvas (`html2canvas`) and jsPDF (`jspdf`) for report exporting.
- **Backend Runtime**: Node.js + Express (`express`, `tsx`).
- **AI SDK**: Google Gen AI SDK (`@google/genai`) using model `gemini-3.8-flash`.

---

## 2. Component Hierarchy & Layout Architecture

```
App.tsx (ThemeProvider, Active Session Storage, Online Status Hook)
 ├── Header.tsx (Brand Emblem, Difficulty Badge, Turn Count, Theme Modal Trigger)
 ├── Main Screen Switcher
 │    ├── InputScreen.tsx (Source Notes, PDF Ingester, Sample Topics, Demeanor Selector)
 │    ├── ExamRoom.tsx (QuestionCard, AnswerBox, Audio Visualizer, VivaTimer, Prompt Log)
 │    └── ReportCard.tsx (Score Verdict, D3 Mastery Chart, Recharts Progression, Metacognition, Knowledge Gaps)
 ├── AndroidBottomNav.tsx (Material 3 Navigation Pills, PWA Install Trigger, Network Status)
 └── ThemeSelectorModal.tsx (Visual Palette Switcher: Midnight, OLED, Cyber, Sepia, Academic)
```

---

## 3. Session State Machine & Adaptive Socratic Engine

### 3.1 State Transitions
1. `INPUT` — Candidate inputs syllabus text or PDF and selects examiner demeanor.
2. `EXAM` — Candidate undergoes Socratic interrogation rounds (1 through 6).
3. `REPORT` — Examiner concludes viva and generates formal assessment dossier.

### 3.2 Socratic Adaptive Branching Rules
- **Weak Defense**: Examiner does not reveal the correct answer. Instead, the engine initiates **Socratic Redirection**, issuing a narrower sub-question on the same concept.
- **Adequate Defense**: Engine probes specific boundary conditions or requests real-world examples.
- **Strong Defense**: Engine initiates **Conceptual Escalation**, introducing harder invariants or connecting current topics to adjacent domain subjects.

---

## 4. Local Socratic Fallback & PWA Offline Engine

When network connectivity is interrupted (`isOnline === false`), VivaGuru automatically activates `fallbackEngine.ts`:

- **Rule-Based Question Generation**: Extracts concept keyphrases directly from candidate material and issues pre-calibrated Socratic prompts.
- **Local Scoring**: Analyzes word density, technical terminology match, and confidence self-assessment to produce temporary evaluation states.
- **Seamless Re-Synchronization**: When internet connection is re-established, local offline rounds are merged back into the session history ledger.
