# Product Requirements Document (PRD) — VivaGuru

**Product Name:** VivaGuru  
**Version:** 1.0.0  
**Tagline:** The Adaptive AI Socratic Examiner & Oral Defense Simulator  
**Target Platform:** Mobile-First (Android / PWA), Desktop Responsive Web Application  

---

## 1. Product Vision & Goals

### 1.1 Executive Summary
Most educational technology tools assist students with passive content consumption (reading notes, watching lectures, generating flashcards). VivaGuru addresses the critical missing phase of academic preparation: **live oral defense and interrogation**. 

VivaGuru simulates a real-time academic viva voce examination board. It ingests student notes, research papers, or syllabus materials, then actively interrogates the candidate with adaptive Socratic questions, metacognitive self-assessment tracking, and real-time voice feedback.

### 1.2 Core Objectives
- **Simulate Board Demeanors**: Allow candidates to practice against various examiner personalities (Advisor, Standard Board, Hostile External).
- **Adaptive Socratic Interrogation**: Automatically branch questions based on student mastery (Socratic redirection on weak answers, conceptual escalation on strong answers).
- **Metacognitive Calibration**: Measure candidate self-confidence against actual examiner scores to detect overconfidence drift or unwarranted hesitation.
- **Android-First Touch & Offline Capability**: Provide 100% responsive Android PWA operation with offline local Socratic engine fallback when disconnected.

---

## 2. Target Audience & User Personas

| Persona | Role | Primary Goal | Key Pain Point |
|---|---|---|---|
| **Aarav (Graduate Student)** | Thesis candidate | Preparing for master's defense | Fears hostile grilling on methodology & invariants |
| **Priya (Medical Student)** | Clinical viva candidate | Rapid diagnostic questioning under pressure | Struggles with concise oral articulation under time limits |
| **David (Computer Science Senior)** | Capstone defense | Proving algorithm complexity & edge cases | Overconfident in theory but stumbles on boundary condition proofs |

---

## 3. Feature Breakdown & Specifications

### 3.1 Source Material Ingestion
- **Text Area Input**: Direct copy-pasting of lecture notes, transcripts, or abstracts.
- **PDF Document Processing**: In-browser PDF text extraction (`pdfjs-dist`) with automatic topic title inference.
- **Curated Academic Topics**: 1-tap benchmark syllabus presets (Quantum Computing, Neural Network Architectures, Bio-Medical Ethics).

### 3.2 Examiner Demeanor Protocol
- **Advisor Viva (Gentle)**: Supportive academic mentor providing encouraging hints and gentle redirection.
- **Standard Board (Formal)**: Objective, scholarly viva board with zero conversational filler.
- **Hostile External (Strict)**: Critical external reviewer probing edge cases, questioning assumptions, and demanding formal proofs.

### 3.3 Candidate Interrogation Terminal
- **Fraunces Serif Question Presentation**: Authoritative, legible typography for examiner inquiries.
- **Voice-to-Text (STT) & Text-to-Speech (TTS)**: Hands-free oral defense capability with real-time speech equalizer and microphone audio visualizer.
- **Metacognitive Self-Assessment**: 3-state confidence selector chips (Tentative, Moderate, Certain) and fine-grained range slider.
- **Viva Countdown Timer**: Configurable response window (60s to 180s) with auto-submission on timeout.

### 3.4 Examiner Assessment Dossier
- **Visual Confidence Score (D3 Pie Chart)**: Visual breakdown of strong, adequate, and weak responses.
- **Score Progression Chart (Recharts)**: Round-by-round trajectory visualization.
- **Metacognitive Alignment Matrix**: Quantified calibration metrics identifying overconfidence drift or excessive caution.
- **Knowledge Gaps Section**: Deep analysis of recurring weak spots cross-referenced across inquiry history.
- **PDF Report Dossier Export**: Client-side PDF generation (`html2canvas` + `jspdf`) for print/offline archiving.

### 3.5 Android PWA & Offline Engine
- **Edge-to-Edge Material Design 3**: Android bottom navigation bar with 48px touch targets and safe area inset handling (`env(safe-area-inset-bottom)`).
- **Local Fallback Engine**: Pure client-side rule-based Socratic engine that maintains viva continuity when offline or disconnected.

---

## 4. Non-Functional Requirements

- **Performance**: Sub-1.5s response latency for Socratic question generation.
- **Accessibility**: WCAG 2.1 AA compliant color contrast (≥4.5:1 text-to-background), 48px minimum touch targets, visible keyboard focus indicators, and `prefers-reduced-motion` support.
- **Security & Privacy**: Zero server-side persistence of source material. All active sessions stored in isolated local browser storage.
