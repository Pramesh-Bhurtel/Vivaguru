# 🎓 Vivaguru — The AI Oral Examiner

**Prompt Wars Hackathon | Theme: Edu-Tech**

> Everyone builds tools to help students *learn*. Vivaguru helps them survive being *examined* — the part nobody practices for.

---

## 1. Overview
Vivaguru is an AI academic examiner. You paste your notes, chapter, or topic. It doesn't lecture or teach you — it interrogates you on them, live, with Socratic redirection and adaptive follow-ups based on how well you defend your answers. At the end of the viva, you receive a formal Examiner's Report with a confidence score and targeted study directives.

## 2. Architecture
- **Frontend:** React 19 + Tailwind CSS + Framer Motion. Distinctive exam-room visual language (Fraunces serif typography, dark focused palette, minimal distraction).
- **Backend:** Express + Node.js with Gemini 3.8 Flash SDK (`@google/genai`), in-memory session state machine, and live prompt transparency logging.
- **Key Mechanism:** 3-stage adaptive prompt chain with real-time scoring (Weak, Adequate, Strong) and pedagogical branching (Socratic narrowing on weak answers, conceptual escalation on strong answers).
