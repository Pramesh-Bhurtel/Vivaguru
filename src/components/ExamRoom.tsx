import React, { useState } from 'react';
import { ActiveSession, ScoreType, ConfidenceLevel } from '../types/exam.js';
import { QuestionCard } from './QuestionCard.js';
import { AnswerBox } from './AnswerBox.js';
import { HistoryTrail } from './HistoryTrail.js';
import { PromptLogPanel } from './PromptLogPanel.js';
import { VivaTimer } from './VivaTimer.js';
import { Award, ArrowRight, AlertCircle } from 'lucide-react';

interface ExamRoomProps {
  session: ActiveSession;
  onSubmitAnswer: (answer: string, confidence?: ConfidenceLevel) => void;
  onFinishExam: () => void;
  isEvaluating: boolean;
  errorMessage?: string | null;
  lastScore?: ScoreType;
  lastNote?: string;
  isSessionComplete?: boolean;
}

export const ExamRoom: React.FC<ExamRoomProps> = ({
  session,
  onSubmitAnswer,
  onFinishExam,
  isEvaluating,
  errorMessage,
  lastScore,
  lastNote,
  isSessionComplete,
}) => {
  const [isPromptLogOpen, setIsPromptLogOpen] = useState(true);
  const [timeExpiredTrigger, setTimeExpiredTrigger] = useState<number>(0);

  const handleTimeout = () => {
    setTimeExpiredTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-80px)] overflow-hidden bg-[#0a0f1d]">
      {/* Main Examination Exchange Pane (70%) */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 max-w-4xl mx-auto w-full flex flex-col justify-between">
        <div className="space-y-6">
          {/* Collapsible Previous Turns History Trail */}
          <HistoryTrail history={session.history} />

          {/* Prominent Current Question Card */}
          <QuestionCard
            question={session.currentQuestion}
            conceptTag={session.currentConceptTag}
            turnCount={session.turnCount}
            isEvaluating={isEvaluating}
            lastScore={lastScore}
            lastNote={lastNote}
          />

          {/* Session Complete Notice */}
          {isSessionComplete && (
            <div className="p-6 rounded-sm border border-indigo-500/50 bg-[#0f172a] text-center space-y-4 shadow-2xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight font-sans">
                  Examination Threshold Satisfied
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed mt-1">
                  The board has accumulated sufficient telemetry to assess your conceptual invariants and failure boundaries.
                </p>
              </div>
              <button
                onClick={onFinishExam}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs uppercase tracking-[0.15em] font-semibold transition-colors cursor-pointer shadow-lg"
              >
                <span>GENERATE EXAMINER'S DOSSIER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error notice if API call had an issue */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-sm text-rose-400 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Question Defense Countdown Timer */}
          {!isSessionComplete && (
            <VivaTimer
              turnCount={session.turnCount}
              currentQuestion={session.currentQuestion}
              isEvaluating={isEvaluating}
              isSessionComplete={isSessionComplete}
              onTimeout={handleTimeout}
            />
          )}

          {/* Answer Submission Box */}
          {!isSessionComplete && (
            <AnswerBox
              onSubmit={onSubmitAnswer}
              isEvaluating={isEvaluating}
              timeExpiredTrigger={timeExpiredTrigger}
            />
          )}
        </div>

        {/* Geometric Balance Examination Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase tracking-wider">LIVE_VIVA &bull; {session.difficulty.toUpperCase()} DEMEANOR &bull; SPEECH_INPUT_ENABLED</span>
          </div>
          <span className="text-indigo-400">EXCHANGE_CYCLE {String(session.turnCount).padStart(2, '0')}</span>
        </div>
      </main>

      {/* Right Pane (30%) - Collapsible Prompt Log */}
      <PromptLogPanel
        logs={session.promptLog}
        isOpen={isPromptLogOpen}
        onToggle={() => setIsPromptLogOpen(!isPromptLogOpen)}
      />
    </div>
  );
};
