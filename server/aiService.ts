import { GoogleGenAI } from "@google/genai";
import {
  DifficultyLevel,
  OpeningQuestionResult,
  AnswerEvaluationResult,
  ExaminerReportResult,
  SessionState,
  PromptLogEntry,
} from './types.js';
import {
  getTopicOpeningQuestion,
  getAdaptiveEvaluation,
  generateStructuredReport,
} from './mockData.js';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

function cleanJsonResponse(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

function getPersonaTone(difficulty: DifficultyLevel = 'standard'): string {
  switch (difficulty) {
    case 'friendly':
      return 'Encouraging but probing. Like an advisor who wants you to succeed, but insists on conceptual clarity and will gently redirect when you waver.';
    case 'hostile':
      return 'Sharp, skeptical, and demanding. Like an external defense examiner who assumes you memorized buzzwords and will aggressively expose every vague statement or logical gap.';
    case 'standard':
    default:
      return 'Rigorous, objective, formal, and unflinching. Neutral academic composure. Does not sugarcoat flaws and does not provide answers.';
  }
}

// Recommended production models per Gemini API skill:
// gemini-2.5-flash (default balanced) & gemini-2.5-flash-lite (fast lightweight), avoiding exhausted experimental preview quotas
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

async function callWithTimeout<T>(promise: Promise<T>, timeoutMs: number = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI generation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

async function callGeminiWithFallback(
  promptText: string,
  timeoutPerModelMs: number = 6000
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('GEMINI_API_KEY is not set or empty. Using adaptive engine.');
  }

  const ai = getAI();
  let lastError: Error | null = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await callWithTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: promptText,
        }),
        timeoutPerModelMs
      );

      const rawText = response.text || '';
      if (rawText.trim().length > 0) {
        return { text: rawText, model: modelName };
      }
    } catch (err: any) {
      lastError = err as Error;
      const isQuota =
        err.message?.includes('resource_exhausted') ||
        err.message?.includes('RESOURCE_EXHAUSTED') ||
        err.status === 429;
      console.warn(
        `[aiService] Model ${modelName} ${isQuota ? 'rate-limited/quota exhausted' : 'unavailable'} (${(err as Error).message?.slice(0, 90)}). Trying next candidate...`
      );
    }
  }

  throw lastError || new Error('All candidate models exhausted or rate-limited');
}

export async function generateOpeningQuestion(
  sourceMaterial: string,
  difficulty: DifficultyLevel = 'standard'
): Promise<{ result: OpeningQuestionResult; logEntry: PromptLogEntry }> {
  const startTime = Date.now();
  const difficultyTone = getPersonaTone(difficulty);

  const promptText = `SYSTEM:
You are a rigorous but fair academic examiner conducting a live oral exam (viva voce).
Your job is to test genuine understanding, not memorization.

Examiner Persona Tone: ${difficultyTone}

Source material the student will be examined on:
"""
${sourceMaterial.slice(0, 8000)}
"""

Generate ONE opening question that:
- Tests conceptual understanding, not simple recall
- Is answerable in 2-4 sentences by a well-prepared student
- Is at MEDIUM difficulty (this is the first question of the viva)

Respond ONLY in this JSON shape, no other text or commentary:
{
  "question": "...",
  "conceptTag": "short label for what concept this tests"
}`;

  try {
    const { text: rawResponse, model: modelUsed } = await callGeminiWithFallback(promptText, 6000);
    const cleaned = cleanJsonResponse(rawResponse);
    const parsed = JSON.parse(cleaned) as OpeningQuestionResult;

    if (!parsed.question) throw new Error('Missing question in model response');

    const validatedResult: OpeningQuestionResult = {
      question: parsed.question,
      conceptTag: parsed.conceptTag || 'Core Topic & Architecture',
    };

    const logEntry: PromptLogEntry = {
      id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      turnNumber: 1,
      stage: 'opening_question',
      prompt: promptText,
      rawResponse,
      parsedResponse: { ...validatedResult, _model: modelUsed } as unknown as Record<string, unknown>,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    return { result: validatedResult, logEntry };
  } catch (error) {
    console.warn('[aiService] generateOpeningQuestion engaged adaptive engine fallback:', (error as Error).message);
    const fallbackResult = getTopicOpeningQuestion(sourceMaterial);
    const logEntry: PromptLogEntry = {
      id: `prompt-log-${Date.now()}`,
      turnNumber: 1,
      stage: 'opening_question',
      prompt: promptText,
      rawResponse: JSON.stringify(fallbackResult, null, 2),
      parsedResponse: { ...fallbackResult, _engine: 'adaptive_offline_fallback' } as unknown as Record<string, unknown>,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
    return { result: fallbackResult, logEntry };
  }
}

export async function scoreAndFollowUp(
  session: SessionState,
  studentAnswer: string
): Promise<{ result: AnswerEvaluationResult; logEntry: PromptLogEntry }> {
  const startTime = Date.now();
  const difficultyTone = getPersonaTone(session.difficulty);

  const formattedHistory = session.history
    .map(
      (h, idx) =>
        `Exchange #${idx + 1}:\nExaminer: "${h.question}"\nStudent: "${h.answer}"\nExaminer Score: [${h.score.toUpperCase()}] | Note: "${h.note}"`
    )
    .join('\n\n');

  const promptText = `SYSTEM:
You are the same academic examiner, mid-viva. Stay in character — formal, precise, fair.
Examiner Persona Tone: ${difficultyTone}

Source material:
"""
${session.sourceMaterial.slice(0, 8000)}
"""

Exam history so far:
${formattedHistory || '(Opening exchange)'}

The student was just asked:
"${session.lastQuestion}"

They answered:
"${studentAnswer}"

Do the following:
1. Silently evaluate the answer against the source material for accuracy and depth.
2. Classify it as exactly one of: "weak", "adequate", "strong"
3. Decide the next move using this logic:
   - If weak: do NOT reveal the correct answer. Ask a narrower, easier sub-question
     on the SAME concept (Socratic redirection).
   - If adequate: ask a follow-up that probes one specific gap or asks for an example.
   - If strong: escalate — ask a harder question, ideally connecting this concept
     to another one in the source material.
4. Write a one-line, in-character examiner note (max 20 words) — the kind of thing
   a real examiner mutters, e.g. "Good start, but you're missing the mechanism."

Respond ONLY in this JSON shape, no other text:
{
  "score": "weak" | "adequate" | "strong",
  "examinerNote": "...",
  "nextQuestion": "...",
  "conceptTag": "..."
}`;

  try {
    const { text: rawResponse, model: modelUsed } = await callGeminiWithFallback(promptText, 6500);
    const cleaned = cleanJsonResponse(rawResponse);
    const parsed = JSON.parse(cleaned) as AnswerEvaluationResult;

    let validScore: 'weak' | 'adequate' | 'strong' = 'adequate';
    if (parsed.score === 'weak' || parsed.score === 'strong' || parsed.score === 'adequate') {
      validScore = parsed.score;
    }

    const validatedResult: AnswerEvaluationResult = {
      score: validScore,
      examinerNote: parsed.examinerNote || 'Candidate defense noted.',
      nextQuestion: parsed.nextQuestion,
      conceptTag: parsed.conceptTag || session.lastConceptTag || 'Core Topic',
    };

    if (!validatedResult.nextQuestion) throw new Error('Missing nextQuestion in model response');

    const logEntry: PromptLogEntry = {
      id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      turnNumber: session.turnCount + 1,
      stage: 'scoring_and_followup',
      prompt: promptText,
      rawResponse,
      parsedResponse: { ...validatedResult, _model: modelUsed } as unknown as Record<string, unknown>,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    return { result: validatedResult, logEntry };
  } catch (error) {
    console.warn('[aiService] scoreAndFollowUp engaged adaptive engine fallback:', (error as Error).message);
    const fallbackResult = getAdaptiveEvaluation(session, studentAnswer);
    const logEntry: PromptLogEntry = {
      id: `prompt-log-${Date.now()}`,
      turnNumber: session.turnCount + 1,
      stage: 'scoring_and_followup',
      prompt: promptText,
      rawResponse: JSON.stringify(fallbackResult, null, 2),
      parsedResponse: { ...fallbackResult, _engine: 'adaptive_offline_fallback' } as unknown as Record<string, unknown>,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
    return { result: fallbackResult, logEntry };
  }
}

export async function generateReport(
  session: SessionState
): Promise<{ result: ExaminerReportResult; logEntry: PromptLogEntry }> {
  const startTime = Date.now();
  const difficultyTone = getPersonaTone(session.difficulty);

  const formattedHistory = session.history
    .map(
      (h, idx) =>
        `Exchange #${idx + 1} (${h.conceptTag}):\nQuestion: "${h.question}"\nStudent Answer: "${h.answer}"\nEvaluation: ${h.score.toUpperCase()} ("${h.note}")`
    )
    .join('\n\n');

  const promptText = `SYSTEM:
You are the academic examiner concluding a viva. Write the final assessment.
Examiner Persona Tone: ${difficultyTone}

Source material:
"""
${session.sourceMaterial.slice(0, 8000)}
"""

Full exam history:
${formattedHistory || '(No exchanges recorded)'}

Based on the full session, produce:
1. A confidence score 0-100 reflecting overall command of the material
   (weight later answers slightly more — they reflect adaptation under pressure)
2. 2-3 concepts (from conceptTag values) the student defended well
3. 2-3 concepts the student struggled with
4. A short in-character closing note (2-3 sentences), honest but constructive —
   the tone of a strict-but-fair examiner giving real feedback, not generic praise
5. 2-3 concrete "study this next" suggestions tied to the weak concepts specifically

Respond ONLY in this JSON shape, no other text:
{
  "confidenceScore": 0-100,
  "strengths": ["...", "..."],
  "weakSpots": ["...", "..."],
  "examinerFeedback": "...",
  "studySuggestions": ["...", "..."]
}`;

  try {
    const { text: rawResponse, model: modelUsed } = await callGeminiWithFallback(promptText, 7000);
    const cleaned = cleanJsonResponse(rawResponse);
    const parsed = JSON.parse(cleaned) as ExaminerReportResult;

    if (typeof parsed.confidenceScore !== 'number') throw new Error('Invalid confidence score in model response');

    const validatedResult: ExaminerReportResult = {
      confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore)),
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length ? parsed.strengths : ['Fundamental Terminology'],
      weakSpots: Array.isArray(parsed.weakSpots) && parsed.weakSpots.length ? parsed.weakSpots : ['Edge Failure Scenarios'],
      examinerFeedback: parsed.examinerFeedback || 'Assessment concluded.',
      studySuggestions: Array.isArray(parsed.studySuggestions) && parsed.studySuggestions.length ? parsed.studySuggestions : ['Review core mechanisms.'],
    };

    const logEntry: PromptLogEntry = {
      id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      turnNumber: session.turnCount,
      stage: 'final_report',
      prompt: promptText,
      rawResponse,
      parsedResponse: { ...validatedResult, _model: modelUsed } as unknown as Record<string, unknown>,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    return { result: validatedResult, logEntry };
  } catch (error) {
    console.warn('[aiService] generateReport engaged structured engine fallback:', (error as Error).message);
    const fallbackResult = generateStructuredReport(session);
    const logEntry: PromptLogEntry = {
      id: `prompt-log-${Date.now()}`,
      turnNumber: session.turnCount,
      stage: 'final_report',
      prompt: promptText,
      rawResponse: JSON.stringify(fallbackResult, null, 2),
      parsedResponse: { ...fallbackResult, _engine: 'adaptive_offline_fallback' } as unknown as Record<string, unknown>,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
    return { result: fallbackResult, logEntry };
  }
}
