import { Router, Request, Response } from 'express';
import { sessionStore } from './sessionStore.js';
import { generateOpeningQuestion, scoreAndFollowUp, generateReport } from './aiService.js';
import { DifficultyLevel } from './types.js';

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start an exam session
apiRouter.post('/session/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sourceMaterial, difficulty = 'standard', topicTitle } = req.body;

    if (!sourceMaterial || typeof sourceMaterial !== 'string' || sourceMaterial.trim().length === 0) {
      res.status(400).json({ error: 'Source material is required to conduct an oral exam.' });
      return;
    }

    const trimmedMaterial = sourceMaterial.trim();
    const validDifficulty: DifficultyLevel = ['friendly', 'standard', 'hostile'].includes(difficulty)
      ? difficulty
      : 'standard';

    const session = sessionStore.create(trimmedMaterial, validDifficulty, topicTitle);

    const { result, logEntry } = await generateOpeningQuestion(trimmedMaterial, validDifficulty);

    session.lastQuestion = result.question;
    session.lastConceptTag = result.conceptTag;
    session.turnCount = 1;
    session.promptLog.push(logEntry);
    sessionStore.update(session);

    res.json({
      sessionId: session.sessionId,
      question: result.question,
      conceptTag: result.conceptTag,
      difficulty: session.difficulty,
      topicTitle: session.topicTitle,
      turnCount: 1,
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to initialize viva session.' });
  }
});

// Submit answer and receive score + adaptive follow-up
apiRouter.post('/session/:id/answer', async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.id;
    const session = sessionStore.get(sessionId);

    if (!session) {
      res.status(404).json({ error: 'Exam session not found or expired.' });
      return;
    }

    const { answer, confidence } = req.body;
    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      res.status(400).json({ error: 'An answer must be submitted.' });
      return;
    }

    const validConfidence = ['tentative', 'moderate', 'certain'].includes(confidence)
      ? confidence
      : undefined;

    const trimmedAnswer = answer.trim();
    const { result, logEntry } = await scoreAndFollowUp(session, trimmedAnswer);

    // Record exchange in history
    session.history.push({
      question: session.lastQuestion,
      answer: trimmedAnswer,
      score: result.score,
      note: result.examinerNote,
      conceptTag: session.lastConceptTag || result.conceptTag,
      timestamp: Date.now(),
      confidence: validConfidence,
    });

    session.promptLog.push(logEntry);
    session.lastQuestion = result.nextQuestion;
    session.lastConceptTag = result.conceptTag;
    session.turnCount += 1;

    // Rule-based deterministic completion check per design.md §6
    const recentScores = session.history.slice(-2).map((h) => h.score);
    const isSessionComplete =
      session.turnCount >= 6 ||
      (session.turnCount >= 4 && recentScores.length >= 2 && recentScores.every((s) => s === 'strong'));

    sessionStore.update(session);

    res.json({
      score: result.score,
      examinerNote: result.examinerNote,
      nextQuestion: result.nextQuestion,
      conceptTag: result.conceptTag,
      isSessionComplete,
      turnCount: session.turnCount,
      historyLength: session.history.length,
    });
  } catch (error) {
    console.error('Error processing answer:', error);
    res.status(500).json({ error: 'Failed to process answer.' });
  }
});

// Generate formal examiner report
apiRouter.get('/session/:id/report', async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.id;
    const session = sessionStore.get(sessionId);

    if (!session) {
      res.status(404).json({ error: 'Exam session not found.' });
      return;
    }

    const { result, logEntry } = await generateReport(session);
    session.promptLog.push(logEntry);

    // Compute metacognitive calibration from self-assessment vs examiner score
    let calibratedCount = 0;
    let overconfidentCount = 0;
    let underconfidentCount = 0;
    let totalRated = 0;

    for (const item of session.history) {
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

    result.calibration = {
      overallCalibration,
      calibrationNote,
      alignmentPercentage,
      calibratedCount,
      overconfidentCount,
      underconfidentCount,
      totalRated,
    };

    sessionStore.update(session);

    res.json(result);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate examiner report.' });
  }
});

// Retrieve live prompt log
apiRouter.get('/session/:id/prompt-log', (req: Request, res: Response): void => {
  const sessionId = req.params.id;
  const session = sessionStore.get(sessionId);

  if (!session) {
    res.status(404).json({ error: 'Exam session not found.' });
    return;
  }

  res.json({
    sessionId: session.sessionId,
    promptLog: session.promptLog,
  });
});

// Retrieve session state
apiRouter.get('/session/:id/state', (req: Request, res: Response): void => {
  const sessionId = req.params.id;
  const session = sessionStore.get(sessionId);

  if (!session) {
    res.status(404).json({ error: 'Exam session not found.' });
    return;
  }

  res.json(session);
});
