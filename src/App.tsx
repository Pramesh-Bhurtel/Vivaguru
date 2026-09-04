import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { InputScreen } from './components/InputScreen.js';
import { ExamRoom } from './components/ExamRoom.js';
import { ReportCard } from './components/ReportCard.js';
import { ThemeProvider, useTheme } from './context/ThemeContext.js';
import { ThemeSelectorModal } from './components/ThemeSelectorModal.js';
import { AndroidBottomNav } from './components/AndroidBottomNav.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import { WifiOff, AlertTriangle } from 'lucide-react';
import {
  ActiveSession,
  ExaminerReport,
  ScoreType,
  DifficultyLevel,
  ConfidenceLevel,
} from './types/exam.js';
import { startExamSession, submitExamAnswer, fetchExaminerReport, fetchPromptLog } from './services/api.js';
import {
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
} from './utils/sessionStorageManager.js';
import { syncFallbackSession } from './services/fallbackEngine.js';

function VivaGuruAppContent() {
  const { themeDef } = useTheme();
  const isOnline = useOnlineStatus();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Load initial auto-saved session from localStorage
  const initialSaved = loadActiveSession();

  const [session, setSession] = useState<ActiveSession | null>(() => {
    if (initialSaved?.session) {
      if (initialSaved.session.sessionId.startsWith('local-')) {
        syncFallbackSession(initialSaved.session);
      }
      return initialSaved.session;
    }
    return null;
  });

  const [report, setReport] = useState<ExaminerReport | null>(() => {
    return initialSaved?.report || null;
  });

  const [currentScreen, setCurrentScreen] = useState<'input' | 'exam' | 'report'>(() => {
    if (initialSaved?.session) {
      return initialSaved.currentScreen || 'exam';
    }
    return 'input';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [lastScore, setLastScore] = useState<ScoreType | undefined>(() => {
    return initialSaved?.lastScore;
  });
  const [lastNote, setLastNote] = useState<string | undefined>(() => {
    return initialSaved?.lastNote;
  });
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(() => {
    return !!initialSaved?.isSessionComplete;
  });

  const [hasRestoredBanner, setHasRestoredBanner] = useState<boolean>(() => {
    return !!(initialSaved?.session && initialSaved.currentScreen === 'exam');
  });

  // Auto-save session state to localStorage on every change
  useEffect(() => {
    if (session) {
      saveActiveSession({
        currentScreen,
        session,
        report,
        lastScore,
        lastNote,
        isSessionComplete,
      });
      if (session.sessionId.startsWith('local-')) {
        syncFallbackSession(session);
      }
    } else {
      clearActiveSession();
    }
  }, [session, report, currentScreen, lastScore, lastNote, isSessionComplete]);

  // Ensure state is flushed synchronously before tab unload or reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session) {
        saveActiveSession({
          currentScreen,
          session,
          report,
          lastScore,
          lastNote,
          isSessionComplete,
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session, report, currentScreen, lastScore, lastNote, isSessionComplete]);

  // 1. Begin Viva
  const handleBeginViva = async (
    sourceMaterial: string,
    difficulty: DifficultyLevel,
    topicTitle?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await startExamSession(sourceMaterial, difficulty, topicTitle);
      const promptLogs = await fetchPromptLog(response.sessionId).catch(() => []);

      setSession({
        sessionId: response.sessionId,
        sourceMaterial,
        difficulty: response.difficulty,
        topicTitle: response.topicTitle || 'Custom Material',
        currentQuestion: response.question,
        currentConceptTag: response.conceptTag,
        turnCount: 1,
        history: [],
        promptLog: promptLogs,
      });

      setLastScore(undefined);
      setLastNote(undefined);
      setIsSessionComplete(false);
      setCurrentScreen('exam');
    } catch (err: any) {
      console.error('Error starting viva:', err);
      setErrorMessage(err.message || 'Failed to start viva session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Answer
  const handleSubmitAnswer = async (answer: string, confidence?: ConfidenceLevel) => {
    if (!session || isEvaluating) return;

    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const result = await submitExamAnswer(session.sessionId, answer, confidence);
      const updatedPromptLogs = await fetchPromptLog(session.sessionId).catch(() => session.promptLog);

      const newHistoryItem = {
        question: session.currentQuestion,
        answer,
        score: result.score,
        note: result.examinerNote,
        conceptTag: session.currentConceptTag,
        timestamp: Date.now(),
        confidence,
      };

      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          history: [...prev.history, newHistoryItem],
          currentQuestion: result.nextQuestion,
          currentConceptTag: result.conceptTag,
          turnCount: result.turnCount,
          promptLog: updatedPromptLogs,
        };
      });

      setLastScore(result.score);
      setLastNote(result.examinerNote);

      if (result.isSessionComplete) {
        setIsSessionComplete(true);
      }
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      setErrorMessage(err.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // 3. Conclude Exam and view report
  const handleFinishExam = async () => {
    if (!session) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const finalReport = await fetchExaminerReport(session.sessionId);
      const finalPromptLogs = await fetchPromptLog(session.sessionId).catch(() => session.promptLog);

      setSession((prev) => (prev ? { ...prev, promptLog: finalPromptLogs } : null));
      setReport(finalReport);
      setCurrentScreen('report');
    } catch (err: any) {
      console.error('Error concluding exam:', err);
      setErrorMessage(err.message || 'Failed to generate examiner report.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Reset / New Viva
  const handleResetSession = () => {
    clearActiveSession();
    setSession(null);
    setReport(null);
    setLastScore(undefined);
    setLastNote(undefined);
    setIsSessionComplete(false);
    setErrorMessage(null);
    setHasRestoredBanner(false);
    setCurrentScreen('input');
  };

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-indigo-500/30 selection:text-white font-sans transition-colors duration-300"
      style={{
        backgroundColor: themeDef.bgHex,
        color: themeDef.textHex,
      }}
    >
      <Header
        currentScreen={currentScreen}
        topicTitle={session?.topicTitle}
        difficulty={session?.difficulty}
        turnCount={session?.turnCount}
        onResetSession={handleResetSession}
        onConcludeEarly={
          currentScreen === 'exam' && session && session.history.length >= 2
            ? handleFinishExam
            : undefined
        }
        onOpenThemeSelector={() => setIsThemeModalOpen(true)}
      />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-950/80 border-b border-amber-600/40 px-4 sm:px-8 py-2 flex items-center justify-between gap-3 text-xs font-mono text-amber-200 shadow-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>OFFLINE MODE:</strong> Disconnected from internet. Local Socratic engine is keeping your session active and responsive.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
            Offline PWA
          </span>
        </div>
      )}

      {/* Restored Session Notification */}
      {hasRestoredBanner && session && (
        <div className="bg-indigo-950/80 border-b border-indigo-500/40 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3 text-xs font-mono shadow-sm">
          <div className="flex items-center gap-2 text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>
              <strong>SESSION RECOVERED:</strong> Your active viva for &ldquo;{session.topicTitle}&rdquo; (Round {session.turnCount}) was auto-restored.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasRestoredBanner(false)}
            className="text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 transition-colors uppercase text-[10px] shrink-0 active:scale-95"
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {currentScreen === 'input' && (
          <InputScreen
            onBeginViva={handleBeginViva}
            isLoading={isLoading}
            errorMessage={errorMessage}
            savedSession={
              session
                ? {
                    topicTitle: session.topicTitle,
                    turnCount: session.turnCount,
                    difficulty: session.difficulty,
                    currentScreen,
                    savedAt: initialSaved?.savedAt || Date.now(),
                  }
                : null
            }
            onResumeSavedSession={() => setCurrentScreen(report ? 'report' : 'exam')}
            onDiscardSavedSession={handleResetSession}
          />
        )}

        {currentScreen === 'exam' && session && (
          <ExamRoom
            session={session}
            onSubmitAnswer={handleSubmitAnswer}
            onFinishExam={handleFinishExam}
            isEvaluating={isEvaluating}
            errorMessage={errorMessage}
            lastScore={lastScore}
            lastNote={lastNote}
            isSessionComplete={isSessionComplete}
          />
        )}

        {currentScreen === 'report' && report && session && (
          <ReportCard
            report={report}
            session={session}
            onRestart={handleResetSession}
          />
        )}
      </main>

      {/* Android Bottom Navigation Bar on Mobile */}
      <AndroidBottomNav
        currentView={currentScreen}
        onNavigateHome={handleResetSession}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        hasSavedSession={!!session}
        onResumeSession={() => setCurrentScreen(report ? 'report' : 'exam')}
      />

      {/* Theme Customization Dialog */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <VivaGuruAppContent />
    </ThemeProvider>
  );
}
