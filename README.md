# 🎓 VivaGuru — The Adaptive AI Socratic Examiner

> **The Oral Defense & Viva Voce Simulator**  
> *Everyone builds tools to help students learn. VivaGuru helps them survive being examined — the part nobody practices for.*

---

## 📸 Overview

VivaGuru is an AI academic examiner. You paste your notes, research paper abstracts, or syllabus topics, or upload a PDF. VivaGuru doesn't lecture or teach — it **interrogates you on your material live**, using Socratic redirection on weak answers, conceptual escalation on strong answers, and real-time metacognitive self-assessment calibration. At the end of the viva, candidate performance is compiled into a formal **Examiner's Assessment Dossier**.

---

## ✨ Key Features

- **Android-First & Mobile PWA**: Built with Material Design 3 bottom navigation pills, 48px+ touch targets, and safe area gesture inset support (`env(safe-area-inset-bottom)`).
- **3 Examiner Demeanor Protocols**:
  - **Advisor Viva (Gentle)**: Encouraging mentor offering gentle guidance.
  - **Standard Board (Formal)**: Objective academic board with zero filler.
  - **Hostile External (Strict)**: Critical reviewer probing edge cases, questioning assumptions, and demanding proofs.
- **Adaptive Socratic Engine**: Real-time evaluation (`weak`, `adequate`, `strong`) with automatic Socratic redirection or escalation.
- **Voice Defense Terminal**: Integrated Web Speech-to-Text (STT) and Text-to-Speech (TTS) with real-time audio volume wave visualizers.
- **Metacognitive Self-Assessment**: Candidate confidence chips (Tentative, Moderate, Certain) compared against actual score telemetry.
- **Examiner's Final Report Dossier**: Interactive D3.js concept mastery pie matrix, Recharts score progression curve, knowledge gaps breakdown, and client-side PDF export (`html2canvas` + `jspdf`).
- **Offline PWA Capability**: Automatic local rule-based Socratic fallback engine when disconnected from the internet.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 (`react`, `react-dom`)
- **Build Tool & Styling**: Vite, Tailwind CSS v4, custom CSS variables, Material Design 3 guidelines.
- **Data Visualization**: D3 (`d3`) & Recharts (`recharts`)
- **Document Processing**: PDF.js (`pdfjs-dist`), html2canvas (`html2canvas`), jsPDF (`jspdf`)
- **Backend Runtime**: Node.js & Express (`express`, `tsx`)
- **AI SDK**: Google Gen AI SDK (`@google/genai`) powered by `gemini-3.8-flash`

---

## 📚 Documentation & Presentation Package (`docs/`)

All core project specifications, pitch decks, architectural documents, and presentation dossiers are consolidated in the [`docs/`](file:///c:/Users/susan/Vivaguru/Vivaguru/docs) directory:

- 🎯 [**Executive Summary & Pitch Deck**](file:///c:/Users/susan/Vivaguru/Vivaguru/docs/Executive_Summary_and_Pitch.md) — Pitch deck, core problem, solution, market gap, and key differentiators.
- 📋 [**Product Requirements Document (PRD)**](file:///c:/Users/susan/Vivaguru/Vivaguru/docs/Product_Requirements_Document.md) — Product vision, personas, and feature specifications.
- 🏗️ [**System Architecture Document**](file:///c:/Users/susan/Vivaguru/Vivaguru/docs/System_Architecture.md) — Frontend/backend flow, session state machine, and offline fallback engine.
- 🔒 [**Security & Privacy Policy**](file:///c:/Users/susan/Vivaguru/Vivaguru/docs/Security_and_Privacy_Policy.md) — Security boundaries, zero-persistence model, and threat mitigations.
- 🎨 [**UI/UX Specification**](file:///c:/Users/susan/Vivaguru/Vivaguru/docs/UI_UX_Specification.md) — Android-first touch targets, safe areas, glassmorphism, and theme scales.
- 🔌 [**REST API Specifications**](file:///c:/Users/susan/Vivaguru/Vivaguru/docs/API_Specification.md) — Detailed backend endpoint requests and response schemas.
- 📝 [**Prompt Engineering Specification**](file:///c:/Users/susan/Vivaguru/Vivaguru/docs/Prompt_Engineering_Specification.md) — Complete specification of LLM system prompts, JSON schemas, and demeanor modifiers.
- 📊 [**Presentation Dossier (.docx)**](file:///c:/Users/susan/Vivaguru/Vivaguru/docs/VivaGuru_Presentation_Dossier.docx) — Formal consolidated presentation document package for pitching.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key (`GEMINI_API_KEY`)

### Setup Instructions

1. **Clone the Repository & Install Dependencies**:
   ```bash
   git clone https://github.com/Pramesh-Bhurtel/Vivaguru.git
   cd Vivaguru
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and set your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Application**:
   Open browser at `http://localhost:3000`.

---

## 📄 License

Distributed under the MIT License.
