import { OpeningQuestionResult, AnswerEvaluationResult, ExaminerReportResult, SessionState, ScoreType } from './types.js';

export function getTopicOpeningQuestion(sourceMaterial: string): OpeningQuestionResult {
  const lower = sourceMaterial.toLowerCase();

  if (lower.includes('raft') || lower.includes('consensus') || lower.includes('leader election')) {
    return {
      question: "In Raft, why are election timeouts randomized between 150ms and 300ms, and what catastrophic failure state does this prevent?",
      conceptTag: "Leader Election & Split Votes",
    };
  }

  if (lower.includes('virtual memory') || lower.includes('page fault') || lower.includes('tlb')) {
    return {
      question: "Walk me through the exact hardware and OS sequence when a valid virtual address suffers a TLB miss followed by a Page Fault.",
      conceptTag: "Paging & Hardware Trap Mechanics",
    };
  }

  if (lower.includes('transformer') || lower.includes('attention') || lower.includes('softmax')) {
    return {
      question: "Why is the dot product scaled by the square root of the key dimension d_k before computing the softmax in self-attention?",
      conceptTag: "Softmax Saturation & Gradient Dynamics",
    };
  }

  // General notes parsing: extract first substantive sentence or question
  const sentences = sourceMaterial
    .split(/[.!?\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);

  const topicNoun = sentences[0]?.slice(0, 45) || 'this topic';

  return {
    question: `Looking at your notes regarding "${topicNoun}": What is the fundamental invariant governing this system, and under what specific condition does it fail?`,
    conceptTag: 'Foundational Invariants & Core Mechanism',
  };
}

export function getAdaptiveEvaluation(
  session: SessionState,
  studentAnswer: string
): AnswerEvaluationResult {
  const words = studentAnswer.trim().split(/\s+/);
  const wordCount = words.length;
  const lower = studentAnswer.toLowerCase();

  // Evaluate candidate defense depth
  let score: ScoreType = 'adequate';
  let examinerNote = '';
  let nextQuestion = '';
  let conceptTag = session.lastConceptTag || 'Core Mechanism';

  // Weak response heuristics: very brief, non-committal, or lacks technical substance
  if (
    wordCount < 10 ||
    lower.includes("i don't know") ||
    lower.includes("not sure") ||
    lower.includes("maybe") ||
    lower.includes("i think it does something")
  ) {
    score = 'weak';
    examinerNote = "Vague. You avoided stating the underlying mechanism.";

    // Socratic redirection: narrow the question on the same concept per PROMPTS.md
    if (session.lastConceptTag.includes('Leader') || lower.includes('vote')) {
      conceptTag = 'Candidate State & Split Votes';
      nextQuestion = "Let us isolate the failure case: if two candidates request votes simultaneously in an un-randomized cluster, how many votes does each receive?";
    } else if (session.lastConceptTag.includes('Paging') || session.lastConceptTag.includes('Fault')) {
      conceptTag = 'Page Table Entry & Present Bit';
      nextQuestion = "Let us step back: before the OS trap handler is called, what single bit in the Page Table Entry tells the MMU the page is missing?";
    } else if (session.lastConceptTag.includes('Softmax') || session.lastConceptTag.includes('Attention')) {
      conceptTag = 'Softmax Mathematical Derivative';
      nextQuestion = "Let us look strictly at the math: what happens to the gradient of softmax(z) when any component of z becomes very large?";
    } else {
      conceptTag = session.lastConceptTag;
      nextQuestion = `Let us narrow down: what is the direct input and immediate output of that specific step in ${conceptTag}?`;
    }
  } else if (
    wordCount >= 30 &&
    (lower.includes('because') || lower.includes('therefore') || lower.includes('invariant') || lower.includes('guarantee') || lower.includes('specifically') || lower.includes('hardware') || lower.includes('kernel') || lower.includes('gradient'))
  ) {
    // Strong response: rigorous, articulated causality
    score = 'strong';
    examinerNote = "Precise defense. You've correctly identified the governing invariant.";

    if (session.lastConceptTag.includes('Leader') || lower.includes('raft')) {
      conceptTag = 'Leader Completeness & Log Matching';
      nextQuestion = "Correct. Now escalate: how does the Leader Completeness Property guarantee that an entry committed in term T is never overwritten in term T+1?";
    } else if (session.lastConceptTag.includes('Paging') || lower.includes('page')) {
      conceptTag = 'TLB Invalidation & Shootdown Protocol';
      nextQuestion = "Good. Now consider a multi-core SMP environment: how does the kernel ensure other CPU cores do not execute using stale cached TLB translations for that frame?";
    } else if (session.lastConceptTag.includes('Attention') || lower.includes('transformer')) {
      conceptTag = 'Multi-Head Subspace Projections';
      nextQuestion = "Well explained. Now expand: why project Q, K, and V into h multiple lower-dimensional subspaces rather than computing attention directly in d_model space?";
    } else {
      conceptTag = 'Edge Conditions & Scale Constraints';
      nextQuestion = "Disciplined answer. Now defend against scale: how does this mechanism behave under maximum concurrency when resources are saturated?";
    }
  } else {
    // Adequate response: partially correct, probes a specific gap
    score = 'adequate';
    examinerNote = "Reasonable surface grasp, but you glossed over the edge boundary.";

    if (session.lastConceptTag.includes('Leader')) {
      conceptTag = 'Election Timeout Discrepancies';
      nextQuestion = "You mentioned split votes, but what happens if a node experiences a temporary network partition during that election phase?";
    } else if (session.lastConceptTag.includes('Paging')) {
      conceptTag = 'VMA Bounds & SIGSEGV Differentiation';
      nextQuestion = "You stated the page is loaded from disk, but how does the kernel distinguish a legitimate demand paging event from an illegal memory segmentation violation?";
    } else if (session.lastConceptTag.includes('Attention')) {
      conceptTag = 'Residual Highway & LayerNorm Ordering';
      nextQuestion = "You explained the scaling factor, but why must the residual connection bypass the attention layer before layer normalization is applied?";
    } else {
      conceptTag = 'Concrete Failure State';
      nextQuestion = "Can you provide a concrete failure scenario where that assumption breaks down under stress?";
    }
  }

  return {
    score,
    examinerNote,
    nextQuestion,
    conceptTag,
  };
}

export function generateStructuredReport(session: SessionState): ExaminerReportResult {
  const history = session.history;
  const totalTurns = history.length;

  if (totalTurns === 0) {
    return {
      confidenceScore: 50,
      strengths: ['Initial syllabus engagement'],
      weakSpots: ['No defense turns recorded'],
      examinerFeedback: 'Candidate withdrew from examination before defending concepts under inquiry.',
      studySuggestions: ['Complete a full 5-exchange viva session.'],
    };
  }

  // Weight scores: strong = 95, adequate = 70, weak = 45
  // Weight later answers by 1.3x per PROMPTS.md ("weight later answers slightly more — they reflect adaptation under pressure")
  let weightedScoreSum = 0;
  let weightSum = 0;

  const strengthsSet = new Set<string>();
  const weakSpotsSet = new Set<string>();

  history.forEach((h, idx) => {
    const recencyWeight = 1.0 + (idx / Math.max(1, totalTurns)) * 0.4;
    let baseScore = 70;
    if (h.score === 'strong') {
      baseScore = 94;
      strengthsSet.add(h.conceptTag);
    } else if (h.score === 'weak') {
      baseScore = 46;
      weakSpotsSet.add(h.conceptTag);
    } else {
      baseScore = 72;
      if (idx === 0) strengthsSet.add(h.conceptTag);
      else weakSpotsSet.add(h.conceptTag);
    }

    weightedScoreSum += baseScore * recencyWeight;
    weightSum += recencyWeight;
  });

  const finalScore = Math.round(weightedScoreSum / weightSum);

  const strengths = Array.from(strengthsSet).slice(0, 3);
  if (strengths.length === 0) strengths.push('Fundamental terminology and baseline concepts');

  const weakSpots = Array.from(weakSpotsSet).slice(0, 3);
  if (weakSpots.length === 0) weakSpots.push('Deep boundary condition edge cases');

  let examinerFeedback = '';
  if (finalScore >= 85) {
    examinerFeedback = 'Demonstrated exceptional conceptual command and composure. Articulated underlying mechanisms clearly when pressed on edge cases, resisting surface generalizations.';
  } else if (finalScore >= 70) {
    examinerFeedback = 'Competent defense of core concepts with a solid theoretical foundation. However, when probed on multi-variable boundary failures, explanations required Socratic narrowing to reach precision.';
  } else {
    examinerFeedback = 'Candidate relies heavily on memorized definitions rather than structural understanding. Stumbled repeatedly when forced to explain cause-and-effect transitions under questioning.';
  }

  const studySuggestions = [
    `Formalize the state transitions and edge constraints in: ${weakSpots[0] || 'core mechanisms'}.`,
    'Practice explaining invariants out loud without relying on buzzwords or passive assumptions.',
    'Map out concrete failure scenarios for each theorem before sitting for oral defense.',
  ];

  return {
    confidenceScore: finalScore,
    strengths,
    weakSpots,
    examinerFeedback,
    studySuggestions,
  };
}
