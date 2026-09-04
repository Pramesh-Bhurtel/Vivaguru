export type ScoreType = 'weak' | 'adequate' | 'strong';

export type DifficultyLevel = 'friendly' | 'standard' | 'hostile';

export type ConfidenceLevel = 'tentative' | 'moderate' | 'certain';

export interface ExamExchange {
  question: string;
  answer: string;
  score: ScoreType;
  note: string;
  conceptTag: string;
  timestamp: number;
  confidence?: ConfidenceLevel;
}

export interface PromptLogEntry {
  id: string;
  turnNumber: number;
  stage: 'opening_question' | 'scoring_and_followup' | 'final_report';
  prompt: string;
  rawResponse: string;
  parsedResponse: Record<string, unknown>;
  durationMs: number;
  timestamp: string;
}

export interface ActiveSession {
  sessionId: string;
  sourceMaterial: string;
  difficulty: DifficultyLevel;
  topicTitle: string;
  currentQuestion: string;
  currentConceptTag: string;
  turnCount: number;
  history: ExamExchange[];
  promptLog: PromptLogEntry[];
}

export interface AnswerResponse {
  score: ScoreType;
  examinerNote: string;
  nextQuestion: string;
  conceptTag: string;
  isSessionComplete: boolean;
  turnCount: number;
  historyLength: number;
}

export interface SelfAssessmentCalibration {
  overallCalibration: 'well_calibrated' | 'overconfident' | 'underconfident' | 'prudent';
  calibrationNote: string;
  alignmentPercentage: number;
  calibratedCount: number;
  overconfidentCount: number;
  underconfidentCount: number;
  totalRated: number;
}

export interface ExaminerReport {
  confidenceScore: number;
  strengths: string[];
  weakSpots: string[];
  examinerFeedback: string;
  studySuggestions: string[];
  calibration?: SelfAssessmentCalibration;
}

export interface KnowledgeGapItem {
  conceptTag: string;
  severity: 'critical' | 'high' | 'moderate';
  totalAttempts: number;
  weakCount: number;
  adequateCount: number;
  strongCount: number;
  averageScorePercentage: number;
  lowScoreRate: number;
  lapses: Array<{
    question: string;
    answer: string;
    score: ScoreType;
    examinerCritique: string;
    confidence?: ConfidenceLevel;
  }>;
  metacognitiveMismatch: boolean;
  remediationAdvice: string;
}

export interface PersistedVivaSession {
  version: number;
  savedAt: number;
  currentScreen: 'input' | 'exam' | 'report';
  session: ActiveSession;
  report: ExaminerReport | null;
  lastScore?: ScoreType;
  lastNote?: string;
  isSessionComplete: boolean;
}
