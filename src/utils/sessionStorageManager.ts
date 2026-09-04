import { PersistedVivaSession, ActiveSession, ExaminerReport, ScoreType } from '../types/exam.js';

export const VIVA_STORAGE_KEY = 'vivaguru_active_viva_session_v1';
const CURRENT_VERSION = 1;

/**
 * Persists the entire active viva session to browser localStorage.
 */
export function saveActiveSession(state: {
  currentScreen: 'input' | 'exam' | 'report';
  session: ActiveSession;
  report: ExaminerReport | null;
  lastScore?: ScoreType;
  lastNote?: string;
  isSessionComplete: boolean;
}): boolean {
  try {
    if (!state.session) {
      clearActiveSession();
      return true;
    }

    const payload: PersistedVivaSession = {
      version: CURRENT_VERSION,
      savedAt: Date.now(),
      currentScreen: state.currentScreen,
      session: state.session,
      report: state.report,
      lastScore: state.lastScore,
      lastNote: state.lastNote,
      isSessionComplete: state.isSessionComplete,
    };

    localStorage.setItem(VIVA_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('[LocalStorage] Failed to auto-save viva session state:', error);
    return false;
  }
}

/**
 * Loads and validates any auto-saved viva session from browser localStorage.
 */
export function loadActiveSession(): PersistedVivaSession | null {
  try {
    const raw = localStorage.getItem(VIVA_STORAGE_KEY);
    if (!raw) return null;

    const data: PersistedVivaSession = JSON.parse(raw);

    // Basic structure validation
    if (
      !data ||
      !data.session ||
      !data.session.sessionId ||
      !data.session.currentQuestion ||
      !Array.isArray(data.session.history)
    ) {
      clearActiveSession();
      return null;
    }

    // Discard sessions older than 7 days
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - (data.savedAt || 0) > SEVEN_DAYS_MS) {
      clearActiveSession();
      return null;
    }

    return data;
  } catch (error) {
    console.warn('[LocalStorage] Failed to parse or load saved viva session:', error);
    clearActiveSession();
    return null;
  }
}

/**
 * Clears the active saved session from localStorage.
 */
export function clearActiveSession(): void {
  try {
    localStorage.removeItem(VIVA_STORAGE_KEY);
  } catch (error) {
    console.warn('[LocalStorage] Failed to clear saved viva session:', error);
  }
}

/**
 * Checks if a saved session exists without loading/parsing all fields.
 */
export function hasActiveSession(): boolean {
  try {
    return !!localStorage.getItem(VIVA_STORAGE_KEY);
  } catch {
    return false;
  }
}
