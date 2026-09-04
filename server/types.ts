export type ScoreType = 'weak' | 'adequate' | 'strong';

export type DifficultyLevel = 'friendly' | 'standard' | 'hostile';

export type ConfidenceLevel = 'tentative' | 'moderate' | 'certain';

export interface ExamTurn {
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

export interface SessionState {
  sessionId: string;
  sourceMaterial: string;
  difficulty: DifficultyLevel;
  topicTitle?: string;
  history: ExamTurn[];
  lastQuestion: string;
  lastConceptTag: string;
  turnCount: number;
  promptLog: PromptLogEntry[];
  createdAt: number;
}

export interface OpeningQuestionResult {
  question: string;
  conceptTag: string;
}

export interface AnswerEvaluationResult {
  score: ScoreType;
  examinerNote: string;
  nextQuestion: string;
  conceptTag: string;
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

export interface ExaminerReportResult {
  confidenceScore: number;
  strengths: string[];
  weakSpots: string[];
  examinerFeedback: string;
  studySuggestions: string[];
  calibration?: SelfAssessmentCalibration;
}
