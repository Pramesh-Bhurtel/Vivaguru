import { ExamExchange, KnowledgeGapItem, ScoreType } from '../types/exam.js';

/**
 * Analyzes exam session history and cross-references concepts that consistently
 * resulted in lower scores (weak/adequate) to identify specific Knowledge Gaps.
 */
export function analyzeKnowledgeGaps(
  history: ExamExchange[],
  reportWeakSpots: string[] = []
): KnowledgeGapItem[] {
  if (!history || history.length === 0) {
    return [];
  }

  // 1. Group exchanges by normalized concept tag
  const conceptMap = new Map<
    string,
    {
      conceptTag: string;
      exchanges: ExamExchange[];
    }
  >();

  for (const exchange of history) {
    const rawTag = exchange.conceptTag?.trim() || 'General Architecture';
    // Normalize key for grouping while preserving display tag
    const key = rawTag.toLowerCase();

    if (!conceptMap.has(key)) {
      conceptMap.set(key, {
        conceptTag: rawTag,
        exchanges: [],
      });
    }
    conceptMap.get(key)!.exchanges.push(exchange);
  }

  const gaps: KnowledgeGapItem[] = [];

  // 2. Cross-reference scores and identify consistent lower scores
  for (const [, { conceptTag, exchanges }] of conceptMap.entries()) {
    const totalAttempts = exchanges.length;
    const weakCount = exchanges.filter((e) => e.score === 'weak').length;
    const adequateCount = exchanges.filter((e) => e.score === 'adequate').length;
    const strongCount = exchanges.filter((e) => e.score === 'strong').length;

    // Numerical score weighting: strong=100, adequate=60, weak=25
    const scoreSum = exchanges.reduce((acc, e) => {
      if (e.score === 'strong') return acc + 100;
      if (e.score === 'adequate') return acc + 60;
      return acc + 25;
    }, 0);

    const averageScorePercentage = Math.round(scoreSum / totalAttempts);
    const lowScoreCount = weakCount + adequateCount;
    const lowScoreRate = Math.round((lowScoreCount / totalAttempts) * 100);

    // Cross-reference with examiner report weakSpots
    const matchesReportWeakSpot = reportWeakSpots.some((ws) => {
      const wsl = ws.toLowerCase();
      const ctl = conceptTag.toLowerCase();
      return (
        wsl.includes(ctl) ||
        ctl.includes(wsl) ||
        ctl.split(' ').some((word) => word.length > 4 && wsl.includes(word))
      );
    });

    // Determine if this concept is a Knowledge Gap:
    // Criteria:
    // 1. Had at least one 'weak' score
    // 2. OR had 'adequate' scores without any 'strong' defense (inability to reach mastery)
    // 3. OR average score < 70%
    // 4. OR cross-referenced with reportWeakSpots and not 100% strong
    const isGap =
      weakCount > 0 ||
      (adequateCount >= 1 && strongCount === 0) ||
      averageScorePercentage < 70 ||
      (matchesReportWeakSpot && strongCount < totalAttempts);

    if (!isGap) {
      continue;
    }

    // Determine Severity
    let severity: 'critical' | 'high' | 'moderate' = 'moderate';
    if (weakCount >= 2 || (weakCount >= 1 && strongCount === 0) || averageScorePercentage <= 40) {
      severity = 'critical';
    } else if (weakCount === 1 || (adequateCount >= 2 && strongCount === 0) || averageScorePercentage <= 60) {
      severity = 'high';
    } else {
      severity = 'moderate';
    }

    // Check for metacognitive mismatch (e.g. asserted "certain" or "moderate" on a weak defense)
    const metacognitiveMismatch = exchanges.some(
      (e) =>
        (e.score === 'weak' && (e.confidence === 'certain' || e.confidence === 'moderate')) ||
        (e.score === 'adequate' && e.confidence === 'certain')
    );

    // Extract specific lapses with examiner critiques
    const lapses = exchanges
      .filter((e) => e.score === 'weak' || e.score === 'adequate')
      .map((e) => ({
        question: e.question,
        answer: e.answer,
        score: e.score,
        examinerCritique: e.note,
        confidence: e.confidence,
      }));

    // Generate specific remediation advice
    let remediationAdvice = '';
    if (severity === 'critical') {
      remediationAdvice = `Fundamental breakdown in ${conceptTag}. Re-derive the invariant properties from first principles without relying on vague operational terminology. Construct explicit counter-examples for edge failures.`;
    } else if (severity === 'high') {
      remediationAdvice = `Unstable boundary defense in ${conceptTag}. While high-level concepts are present, the oral defense faltered on edge state transitions and resource limits under stress.`;
    } else {
      remediationAdvice = `Superficial coverage in ${conceptTag}. Solidify the exact sequence of operations and hardware/system trade-offs to transition from descriptive to rigorous defense.`;
    }

    gaps.push({
      conceptTag,
      severity,
      totalAttempts,
      weakCount,
      adequateCount,
      strongCount,
      averageScorePercentage,
      lowScoreRate,
      lapses,
      metacognitiveMismatch,
      remediationAdvice,
    });
  }

  // Sort: Critical first, then High, then Moderate; then lowest average score percentage
  const severityRank = { critical: 3, high: 2, moderate: 1 };
  return gaps.sort((a, b) => {
    if (severityRank[b.severity] !== severityRank[a.severity]) {
      return severityRank[b.severity] - severityRank[a.severity];
    }
    return a.averageScorePercentage - b.averageScorePercentage;
  });
}
