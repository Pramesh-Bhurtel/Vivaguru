import { ScoreType, DifficultyLevel, ConfidenceLevel, SelfAssessmentCalibration } from '../types/exam.js';

export interface LocalFallbackSession {
  sessionId: string;
  sourceMaterial: string;
  difficulty: DifficultyLevel;
  topicTitle: string;
  currentQuestion: string;
  currentConceptTag: string;
  turnCount: number;
  history: Array<{
    question: string;
    answer: string;
    score: ScoreType;
    note: string;
    conceptTag: string;
    timestamp: number;
    confidence?: ConfidenceLevel;
  }>;
}

const localSessions: Record<string, LocalFallbackSession> = {};

export function createFallbackSession(
  sourceMaterial: string,
  difficulty: DifficultyLevel = 'standard',
  topicTitle?: string
): {
  sessionId: string;
  question: string;
  conceptTag: string;
  difficulty: DifficultyLevel;
  topicTitle: string;
} {
  const sessionId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const lower = sourceMaterial.toLowerCase();

  let question = `Looking closely at your source material: What is the primary structural invariant of this system, and under what exact operating constraints does it break down?`;
  let conceptTag = 'Foundational Invariants & Core Mechanism';

  if (lower.includes('raft') || lower.includes('consensus') || lower.includes('leader election')) {
    question = 'In Raft, why are election timeouts randomized between 150ms and 300ms, and what catastrophic failure state does this prevent?';
    conceptTag = 'Leader Election & Split Votes';
  } else if (lower.includes('virtual memory') || lower.includes('page fault') || lower.includes('tlb')) {
    question = 'Walk me through the exact hardware and OS sequence when a valid virtual address suffers a TLB miss followed by a Page Fault.';
    conceptTag = 'Paging & Hardware Trap Mechanics';
  } else if (lower.includes('transformer') || lower.includes('attention') || lower.includes('softmax')) {
    question = 'Why is the dot product scaled by the square root of the key dimension d_k before computing the softmax in self-attention?';
    conceptTag = 'Softmax Saturation & Gradient Dynamics';
  } else {
    const sentences = sourceMaterial
      .split(/[.!?\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);
    if (sentences.length > 0) {
      const topicSnippet = sentences[0].slice(0, 45);
      question = `Regarding your statement on "${topicSnippet}": what is the direct mechanism guaranteeing correctness, and where are its boundary limitations?`;
    }
  }

  const title = topicTitle || (sourceMaterial.trim().split('\n')[0]?.slice(0, 40) || 'Custom Syllabus Material');

  const session: LocalFallbackSession = {
    sessionId,
    sourceMaterial,
    difficulty,
    topicTitle: title,
    currentQuestion: question,
    currentConceptTag: conceptTag,
    turnCount: 1,
    history: [],
  };

  localSessions[sessionId] = session;

  return {
    sessionId,
    question,
    conceptTag,
    difficulty,
    topicTitle: title,
  };
}

export function syncFallbackSession(session: {
  sessionId: string;
  sourceMaterial: string;
  difficulty: DifficultyLevel;
  topicTitle: string;
  currentQuestion: string;
  currentConceptTag: string;
  turnCount: number;
  history: Array<{
    question: string;
    answer: string;
    score: ScoreType;
    note: string;
    conceptTag: string;
    timestamp: number;
    confidence?: ConfidenceLevel;
  }>;
}) {
  localSessions[session.sessionId] = {
    sessionId: session.sessionId,
    sourceMaterial: session.sourceMaterial,
    difficulty: session.difficulty,
    topicTitle: session.topicTitle,
    currentQuestion: session.currentQuestion,
    currentConceptTag: session.currentConceptTag,
    turnCount: session.turnCount,
    history: [...session.history],
  };
}

export function evaluateFallbackAnswer(
  sessionId: string,
  answer: string,
  confidence?: ConfidenceLevel
): {
  score: ScoreType;
  examinerNote: string;
  nextQuestion: string;
  conceptTag: string;
  isSessionComplete: boolean;
  turnCount: number;
  historyLength: number;
} {
  const session = localSessions[sessionId];
  const words = answer.trim().split(/\s+/);
  const wordCount = words.length;
  const lower = answer.toLowerCase();

  let score: ScoreType = 'adequate';
  let examinerNote = '';
  let nextQuestion = '';
  let conceptTag = session?.currentConceptTag || 'Core Mechanism';

  if (
    wordCount < 10 ||
    lower.includes("don't know") ||
    lower.includes('not sure') ||
    lower.includes('maybe')
  ) {
    score = 'weak';
    examinerNote = 'Vague defense. You avoided stating the underlying mechanism.';
    nextQuestion = `Let us narrow the scope: What is the direct input and immediate invariant violated at that step in ${conceptTag}?`;
    conceptTag = `${conceptTag} (Boundary Case)`;
  } else if (
    wordCount >= 25 &&
    (lower.includes('because') ||
      lower.includes('invariant') ||
      lower.includes('guarantee') ||
      lower.includes('hardware') ||
      lower.includes('kernel') ||
      lower.includes('specifically'))
  ) {
    score = 'strong';
    examinerNote = "Precise defense. You've correctly identified the governing invariant.";
    nextQuestion = `Disciplined explanation. Now escalate: How does this mechanism guarantee safety under concurrent multi-node partitions or heavy contention?`;
    conceptTag = `${conceptTag} (Concurrency & Scale)`;
  } else {
    score = 'adequate';
    examinerNote = 'Reasonable baseline grasp, but you glossed over the edge boundary condition.';
    nextQuestion = `Can you articulate a concrete failure scenario where that assumption fails to hold in production?`;
    conceptTag = `${conceptTag} (Failure Edge Case)`;
  }

  const nextTurn = (session?.turnCount || 1) + 1;
  const isSessionComplete = nextTurn >= 6;

  if (session) {
    session.history.push({
      question: session.currentQuestion,
      answer,
      score,
      note: examinerNote,
      conceptTag: session.currentConceptTag,
      timestamp: Date.now(),
      confidence,
    });
    session.currentQuestion = nextQuestion;
    session.currentConceptTag = conceptTag;
    session.turnCount = nextTurn;
  }

  return {
    score,
    examinerNote,
    nextQuestion,
    conceptTag,
    isSessionComplete,
    turnCount: nextTurn,
    historyLength: session?.history.length || 1,
  };
}

export function generateFallbackReport(sessionId: string) {
  const session = localSessions[sessionId];
  const history = session?.history || [];
  const totalTurns = history.length;

  let weightedSum = 0;
  let weightSum = 0;
  const strengthsSet = new Set<string>();
  const weakSpotsSet = new Set<string>();

  history.forEach((h, idx) => {
    const recencyWeight = 1.0 + (idx / Math.max(1, totalTurns)) * 0.4;
    let baseScore = 70;
    if (h.score === 'strong') {
      baseScore = 95;
      strengthsSet.add(h.conceptTag);
    } else if (h.score === 'weak') {
      baseScore = 45;
      weakSpotsSet.add(h.conceptTag);
    } else {
      baseScore = 72;
      if (idx === 0) strengthsSet.add(h.conceptTag);
      else weakSpotsSet.add(h.conceptTag);
    }
    weightedSum += baseScore * recencyWeight;
    weightSum += recencyWeight;
  });

  const finalScore = weightSum > 0 ? Math.round(weightedSum / weightSum) : 75;
  const strengths = Array.from(strengthsSet).slice(0, 3);
  if (strengths.length === 0) strengths.push('Fundamental architectural invariants');

  const weakSpots = Array.from(weakSpotsSet).slice(0, 3);
  if (weakSpots.length === 0) weakSpots.push('Multi-variable boundary conditions');

  // Metacognitive calibration calculation
  let calibratedCount = 0;
  let overconfidentCount = 0;
  let underconfidentCount = 0;
  let totalRated = 0;

  for (const item of history) {
    if (!item.confidence) continue;
    totalRated++;
    const s = item.score;
    const c = item.confidence;

    if (
      (c === 'certain' && s === 'strong') ||
      (c === 'moderate' && s === 'adequate') ||
      (c === 'tentative' && s === 'weak')
    ) {
      calibratedCount++;
    } else if (
      (c === 'certain' && (s === 'adequate' || s === 'weak')) ||
      (c === 'moderate' && s === 'weak')
    ) {
      overconfidentCount++;
    } else {
      underconfidentCount++;
    }
  }

  const alignmentPercentage = totalRated > 0 ? Math.round((calibratedCount / totalRated) * 100) : 100;

  let overallCalibration: 'well_calibrated' | 'overconfident' | 'underconfident' | 'prudent' = 'well_calibrated';
  let calibrationNote = 'High metacognitive calibration: Candidate accurately identifies the boundaries of their mastery under examiner pressure.';

  if (totalRated > 0) {
    if (overconfidentCount > calibratedCount && overconfidentCount >= underconfidentCount) {
      overallCalibration = 'overconfident';
      calibrationNote = 'Candidate reported high certainty on questions that suffered from boundary lapses or incomplete invariant proofs.';
    } else if (underconfidentCount > calibratedCount) {
      overallCalibration = 'underconfident';
      calibrationNote = 'Candidate exhibited unwarranted hesitation on topics where their oral defense was technically sound and rigorous.';
    } else if (alignmentPercentage >= 65) {
      overallCalibration = 'well_calibrated';
      calibrationNote = 'High metacognitive calibration: Candidate accurately identifies the boundaries of their mastery under examiner pressure.';
    } else {
      overallCalibration = 'prudent';
      calibrationNote = 'Balanced self-calibration across standard and hostile examiner challenges.';
    }
  }

  return {
    confidenceScore: finalScore,
    strengths,
    weakSpots,
    examinerFeedback:
      finalScore >= 80
        ? 'Demonstrated strong conceptual resilience and clarity under examiner probing.'
        : 'Competent baseline defense of core axioms; targeted reinforcement recommended for edge failure modes.',
    studySuggestions: [
      `Formalize the state transitions and edge constraints in: ${weakSpots[0] || 'core mechanisms'}.`,
      'Practice explaining invariants out loud without relying on buzzwords or passive assumptions.',
      'Map out concrete failure scenarios for each theorem before sitting for oral defense.',
    ],
    calibration: {
      overallCalibration,
      calibrationNote,
      alignmentPercentage,
      calibratedCount,
      overconfidentCount,
      underconfidentCount,
      totalRated,
    },
  };
}
