import { SessionState, DifficultyLevel } from './types.js';

class SessionStore {
  private sessions: Map<string, SessionState> = new Map();

  create(sourceMaterial: string, difficulty: DifficultyLevel = 'standard', topicTitle?: string): SessionState {
    const sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const session: SessionState = {
      sessionId,
      sourceMaterial,
      difficulty,
      topicTitle: topicTitle || 'Custom Notes',
      history: [],
      lastQuestion: '',
      lastConceptTag: '',
      turnCount: 0,
      promptLog: [],
      createdAt: Date.now(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  get(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  update(session: SessionState): void {
    this.sessions.set(session.sessionId, session);
  }

  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  getAll(): SessionState[] {
    return Array.from(this.sessions.values());
  }
}

export const sessionStore = new SessionStore();
