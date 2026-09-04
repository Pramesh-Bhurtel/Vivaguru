import {
  ActiveSession,
  AnswerResponse,
  ExaminerReport,
  PromptLogEntry,
  DifficultyLevel,
  ConfidenceLevel,
} from '../types/exam.js';
import {
  createFallbackSession,
  evaluateFallbackAnswer,
  generateFallbackReport,
} from './fallbackEngine.js';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries: number = 2,
  delayMs: number = 400
): Promise<Response> {
  let lastErr: any;
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err) {
      lastErr = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
  throw lastErr;
}

export async function startExamSession(
  sourceMaterial: string,
  difficulty: DifficultyLevel = 'standard',
  topicTitle?: string
): Promise<{ sessionId: string; question: string; conceptTag: string; difficulty: DifficultyLevel; topicTitle: string }> {
  try {
    const response = await fetchWithRetry('/api/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceMaterial, difficulty, topicTitle }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.error || 'Failed to start viva session', response.status);
    }

    return await response.json();
  } catch (err) {
    console.warn('[api] Server unavailable or failed to fetch, initializing resilient offline adaptive session:', err);
    return createFallbackSession(sourceMaterial, difficulty, topicTitle);
  }
}

export async function submitExamAnswer(
  sessionId: string,
  answer: string,
  confidence?: ConfidenceLevel
): Promise<AnswerResponse> {
  if (sessionId.startsWith('local-')) {
    return evaluateFallbackAnswer(sessionId, answer, confidence);
  }

  try {
    const response = await fetchWithRetry(`/api/session/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer, confidence }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.error || 'Failed to evaluate answer', response.status);
    }

    return await response.json();
  } catch (err) {
    console.warn('[api] Server unavailable for answer evaluation, falling back to local engine:', err);
    return evaluateFallbackAnswer(sessionId, answer, confidence);
  }
}

export async function fetchExaminerReport(sessionId: string): Promise<ExaminerReport> {
  if (sessionId.startsWith('local-')) {
    return generateFallbackReport(sessionId);
  }

  try {
    const response = await fetchWithRetry(`/api/session/${sessionId}/report`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.error || 'Failed to generate examiner report', response.status);
    }

    return await response.json();
  } catch (err) {
    console.warn('[api] Server unavailable for final report, generating local assessment:', err);
    return generateFallbackReport(sessionId);
  }
}

export async function fetchPromptLog(sessionId: string): Promise<PromptLogEntry[]> {
  if (sessionId.startsWith('local-')) {
    return [
      {
        id: `local-log-${Date.now()}`,
        turnNumber: 1,
        stage: 'opening_question',
        prompt: 'Offline Resilient Engine initialized.',
        rawResponse: 'Using browser-level adaptive oral examiner heuristics.',
        parsedResponse: { mode: 'resilient_offline_mode' },
        durationMs: 15,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  try {
    const response = await fetchWithRetry(`/api/session/${sessionId}/prompt-log`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.error || 'Failed to retrieve prompt log', response.status);
    }

    const data = await response.json();
    return data.promptLog || [];
  } catch {
    return [];
  }
}

export async function fetchSessionState(sessionId: string): Promise<ActiveSession> {
  const response = await fetchWithRetry(`/api/session/${sessionId}/state`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(errorData.error || 'Failed to retrieve session state', response.status);
  }

  return response.json();
}
