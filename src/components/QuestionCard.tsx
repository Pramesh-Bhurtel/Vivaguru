import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Square, RotateCcw, Radio } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge.js';
import { ScoreType } from '../types/exam.js';
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';

interface QuestionCardProps {
  question: string;
  conceptTag: string;
  turnCount: number;
  isEvaluating: boolean;
  lastScore?: ScoreType;
  lastNote?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  conceptTag,
  turnCount,
  isEvaluating,
  lastScore,
  lastNote,
}) => {
  const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(true);
  const prevQuestionRef = useRef<string>('');

  const {
    isSupported,
    isPlaying,
    speak,
    stop,
  } = useTextToSpeech({
    rate: 0.95,
  });

  // Auto-play new questions when they arrive if autoPlay is enabled
  useEffect(() => {
    if (!question || isEvaluating) return;

    if (autoPlayEnabled && prevQuestionRef.current !== question) {
      prevQuestionRef.current = question;
      // Delay to ensure DOM renders before speech commences
      const timer = setTimeout(() => {
        speak(question);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [question, autoPlayEnabled, isEvaluating, speak]);

  // Stop TTS if user proceeds to evaluation
  useEffect(() => {
    if (isEvaluating && isPlaying) {
      stop();
    }
  }, [isEvaluating, isPlaying, stop]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(question);
    }
  };

  const handleReplay = () => {
    stop();
    speak(question);
  };

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative shadow-2xl space-y-5">
      {/* Top Meta & Audio Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs uppercase tracking-[0.15em] font-mono text-indigo-400 font-bold">
            INQUIRY #{String(turnCount).padStart(2, '0')}
          </span>
          {conceptTag && (
            <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              TAG: <span className="text-indigo-300 font-semibold">{conceptTag}</span>
            </span>
          )}
        </div>

        {/* Text-to-Speech Action Buttons */}
        {isSupported && (
          <div className="flex items-center gap-2 font-mono text-xs">
            {/* Live Speaking Equalizer */}
            {isPlaying && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">
                  SPEAKING
                </span>
                <div className="flex items-center gap-0.5 h-3 ml-1">
                  <span className="w-0.5 h-3 bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-2 bg-indigo-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-3.5 bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Play / Stop Primary Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={isEvaluating}
              className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider text-[11px] font-bold active:scale-95 ${
                isPlaying
                  ? 'bg-rose-500/20 border border-rose-500 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-indigo-500 hover:text-white'
              }`}
              title={isPlaying ? 'Stop audio narration' : 'Listen to question via Text-to-Speech'}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 text-rose-400 fill-current" />
                  <span>STOP AUDIO</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>LISTEN</span>
                </>
              )}
            </button>

            {/* Replay Button */}
            <button
              type="button"
              onClick={handleReplay}
              disabled={isEvaluating}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
              title="Replay question narration from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Auto-Read Toggle */}
            <button
              type="button"
              onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
              className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer text-[10px] min-h-[44px] ${
                autoPlayEnabled
                  ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300 font-semibold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-400'
              }`}
              title="Toggle automatic question narration on new inquiries"
            >
              {autoPlayEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AUTO-READ</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span>MUTED</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Spoken Question in Fraunces serif */}
      <div className="pt-2">
        <h2 className="font-serif-examiner text-xl sm:text-2xl lg:text-3xl text-slate-100 leading-relaxed tracking-normal font-normal">
          &ldquo;{question}&rdquo;
        </h2>
      </div>

      {/* Thinking state: progress line */}
      {isEvaluating && (
        <div className="mt-8 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span className="flex items-center gap-2 text-indigo-400 font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              EXAMINER WEIGHING DEFENSE...
            </span>
            <span className="text-slate-500 text-[10px]">EVALUATING INVARIANTS</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 thinking-pulse-line rounded-full" />
          </div>
        </div>
      )}

      {/* Last evaluation micro-feedback */}
      {!isEvaluating && lastScore && lastNote && (
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <ScoreBadge score={lastScore} size="sm" />
            <span className="text-slate-300 italic font-serif-examiner text-sm sm:text-base">
              &ldquo;{lastNote}&rdquo;
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
