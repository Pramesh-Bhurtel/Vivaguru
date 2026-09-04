# API Specification & Endpoints — VivaGuru

This document provides the REST API documentation for VivaGuru's backend server.

---

## Base URL
```
http://localhost:3000/api
```

---

## 1. Endpoints

### 1.1 `POST /api/session/start`
Initializes a new examination session and generates the initial examiner Socratic inquiry.

#### Request Body
```json
{
  "sourceMaterial": "Quantum superposition allows qubits to exist in combinations of |0> and |1>...",
  "difficulty": "standard",
  "topicTitle": "Quantum Computing Fundamentals"
}
```

#### Response (200 OK)
```json
{
  "sessionId": "viva-session-1725438900-a1b2",
  "question": "Explain how measurement causes wave-function collapse in a 2-qubit register.",
  "conceptTag": "Quantum Measurement & Collapse",
  "turnCount": 1,
  "difficulty": "standard",
  "topicTitle": "Quantum Computing Fundamentals"
}
```

---

### 1.2 `POST /api/session/:id/answer`
Submits candidate's oral/written defense for evaluation and retrieves the next Socratic question.

#### Request Path Parameter
- `id` — Active session ID string.

#### Request Body
```json
{
  "answer": "When measurement occurs, the state vector projects onto one of the eigenbasis states...",
  "confidence": "certain"
}
```

#### Response (200 OK)
```json
{
  "sessionId": "viva-session-1725438900-a1b2",
  "score": "strong",
  "examinerNote": "Rigorous explanation of state vector projection. Let us probe entanglement next.",
  "nextQuestion": "How does entanglement impact local measurement results under the EPR paradox?",
  "conceptTag": "Quantum Entanglement & EPR",
  "turnCount": 2,
  "isSessionComplete": false
}
```

---

### 1.3 `GET /api/session/:id/report`
Concludes the examination and generates the formal Examiner's Report Dossier.

#### Response (200 OK)
```json
{
  "confidenceScore": 88,
  "strengths": [
    "Quantum Measurement & Collapse",
    "State Vector Projection"
  ],
  "weakSpots": [
    "EPR Paradox Boundary Proofs"
  ],
  "examinerFeedback": "The candidate demonstrated strong conceptual grasp of state collapse. Further review of Bell's inequalities is recommended.",
  "studySuggestions": [
    "Revisit Bell test experiments and local hidden variable proofs.",
    "Practice articulating density matrix representations under partial trace."
  ]
}
```

---

### 1.4 `GET /api/session/:id/prompt-log`
Retrieves live system prompt transparency log for debugging and verification.

#### Response (200 OK)
```json
[
  {
    "timestamp": 1725438905000,
    "stage": "Opening Question Generator",
    "systemPrompt": "You are a rigorous academic examiner...",
    "rawResponse": "{\"question\":\"...\",\"conceptTag\":\"...\"}"
  }
]
```

---

### 1.5 `GET /api/health`
Health check endpoint verifying server uptime and Google Gemini API connectivity.

#### Response (200 OK)
```json
{
  "status": "online",
  "service": "VivaGuru Socratic API",
  "timestamp": "2026-09-04T14:25:00.000Z"
}
```
