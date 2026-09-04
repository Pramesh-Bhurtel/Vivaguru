import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, CornerDownLeft, Mic, MicOff, AlertCircle, X, RotateCcw, Sliders, ShieldCheck } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText.js';
import { ConfidenceLevel } from '../types/exam.js';
import { AudioVolumeVisualizer } from './AudioVolumeVisualizer.js';

interface AnswerBoxProps {
  onSubmit: (answer: string, confidence?: ConfidenceLevel) => void;
  isEvaluating: boolean;
  timeExpiredTrigger?: number;
}

export const AnswerBox: React.FC<AnswerBoxProps> = ({ onSubmit, isEvaluating, timeExpiredTrigger }) => {
  const [answer, setAnswer] = useState('');
  const [confidence, setConfidence] = useState<ConfidenceLevel>('moderate');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle final speech transcripts appended to existing text
  const handleFinalTranscript = useCallback((newText: string) => {
    setAnswer((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) {
        return newText.charAt(0).toUpperCase() + newText.slice(1);
      }
      return `${trimmed} ${newText}`;
    });
  }, []);

  const {
    isSupported,
    isListening,
    interimTranscript,
    error: speechError,
    audioLevel,
    analyserNode,
    toggleListening,
    stopListening,
    clearError,
  } = useSpeechToText({
    onFinalTranscript: handleFinalTranscript,
  });

  // Auto focus when ready for new answer
  useEffect(() => {
    if (!isEvaluating && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEvaluating]);

  // Stop microphone if session transitions to evaluating
  useEffect(() => {
    if (isEvaluating && isListening) {
      stopListening();
    }
  }, [isEvaluating, isListening, stopListening]);

  // Handle auto-submission when question countdown timer expires
  useEffect(() => {
    if (!timeExpiredTrigger || isEvaluating) return;
    const defenseToSubmit = answer.trim()
      ? answer.trim()
      : '[Time window elapsed: Candidate was unable to formulate defense before the examiner called time.]';
    if (isListening) {
      stopListening();
    }
    onSubmit(defenseToSubmit, confidence);
    setAnswer('');
    setConfidence('moderate');
  }, [timeExpiredTrigger, isEvaluating, answer, confidence, isListening, stopListening, onSubmit]);

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const isTooShort = wordCount < 5;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answer.trim() || isEvaluating) return;
    if (isListening) {
      stopListening();
    }
    onSubmit(answer.trim(), confidence);
    setAnswer('');
    setConfidence('moderate');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClearAnswer = () => {
    setAnswer('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
      {/* Top Header & Mode Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <label
            htmlFor="viva-answer-input"
            className="text-xs uppercase tracking-[0.15em] font-mono text-indigo-400 flex items-center gap-2 font-bold"
          >
            <span>Candidate Defense Terminal</span>
          </label>
          <span className="hidden sm:inline text-[10px] font-mono text-slate-500 font-semibold">
            [VOICE_OR_TEXT]
          </span>
        </div>

        {/* Right Controls: Microphone Mode & Word Metrics */}
        <div className="flex items-center gap-3">
          {/* Audio level meter bars when speaking */}
          {isListening && (
            <div className="flex items-center gap-1 h-6 px-2.5 bg-slate-900 border border-rose-500/40 rounded-full">
              <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest mr-1 font-bold">
                REC
              </span>
              {[...Array(5)].map((_, i) => {
                const threshold = (i + 1) * 18;
                const active = audioLevel >= threshold;
                return (
                  <span
                    key={i}
                    className={`w-1 transition-all duration-75 rounded-xs ${
                      active ? 'bg-rose-400 h-4' : 'bg-slate-700 h-1.5'
                    }`}
                  />
                );
              })}
            </div>
          )}

          {/* Microphone Action Toggle Button */}
          {isSupported && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={isEvaluating}
              className={`min-h-[44px] flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
                isListening
                  ? 'border border-rose-500 bg-rose-500/20 text-rose-300 shadow-sm font-bold'
                  : 'border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-indigo-500 text-slate-300 font-semibold'
              }`}
              title={isListening ? 'Stop voice recording' : 'Speak your oral defense'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>STOP RECORDING</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-indigo-400" />
                  <span>SPEAK DEFENSE</span>
                </>
              )}
            </button>
          )}

          {/* Word Count Metric */}
          <span
            className={`text-xs font-mono font-semibold ${
              wordCount > 0 && isTooShort ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {wordCount} WORDS {isTooShort && wordCount > 0 && '[BRIEF]'}
          </span>
        </div>
      </div>

      {/* Microphone Error Alert */}
      {speechError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{speechError}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="p-1 hover:text-white transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real-Time Audio Volume Visualizer */}
      {isListening && (
        <AudioVolumeVisualizer
          analyserNode={analyserNode}
          isListening={isListening}
          audioLevel={audioLevel}
        />
      )}

      {/* Live Interim Speech Stream Preview Banner */}
      {isListening && (
        <div className="p-3.5 bg-slate-900/90 border border-indigo-500/40 rounded-xl flex items-start gap-2.5 font-mono text-xs shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping mt-1 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block mb-0.5">
              LIVE_SPEECH_STREAM:
            </span>
            <p className="text-slate-200 italic font-sans text-sm break-words">
              {interimTranscript || 'Speaking... (your spoken words append directly here)'}
              <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-1 animate-pulse" />
            </p>
          </div>
        </div>
      )}

      {/* Main Defense Textarea */}
      <div className="relative">
        <textarea
          id="viva-answer-input"
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isEvaluating}
          rows={4}
          placeholder="Speak into your microphone or type your defense here. Articulate invariants, mechanics, and transition states directly..."
          className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 sm:p-4 text-slate-200 placeholder-slate-500 text-sm sm:text-base resize-y transition-all disabled:opacity-50 font-sans leading-relaxed min-h-[120px]"
        />
      </div>

      {/* Self-Assessment Confidence Appraisal */}
      <div
        id="self-assessment-panel"
        className="pt-3 pb-2 border-t border-slate-800/80 space-y-2.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
              Self-Assessment
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold">
              METACOGNITION
            </span>
          </div>

          <div className="text-[11px] font-mono flex items-center gap-1.5">
            <span className="text-slate-400">CONFIDENCE:</span>
            {confidence === 'tentative' && (
              <span className="text-amber-400 font-bold uppercase tracking-wider">
                Tentative (Hypothesizing)
              </span>
            )}
            {confidence === 'moderate' && (
              <span className="text-indigo-400 font-bold uppercase tracking-wider">
                Moderate (Core Invariant)
              </span>
            )}
            {confidence === 'certain' && (
              <span className="text-emerald-400 font-bold uppercase tracking-wider">
                Certain (Rigorous Proof)
              </span>
            )}
          </div>
        </div>

        {/* 3-State Segmented Toggle Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setConfidence('tentative')}
            disabled={isEvaluating}
            className={`p-3 rounded-xl border text-left font-mono transition-all cursor-pointer active:scale-[0.98] min-h-[56px] ${
              confidence === 'tentative'
                ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm ring-1 ring-amber-500/40'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">1. Tentative</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                UNCERTAIN
              </span>
            </div>
            <p className="text-[10px] font-sans text-slate-400 mt-1 leading-snug">
              Unsure about edge cases; exploring hypothesis.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setConfidence('moderate')}
            disabled={isEvaluating}
            className={`p-3 rounded-xl border text-left font-mono transition-all cursor-pointer active:scale-[0.98] min-h-[56px] ${
              confidence === 'moderate'
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200 shadow-sm ring-1 ring-indigo-500/40'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">2. Moderate</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                BALANCED
              </span>
            </div>
            <p className="text-[10px] font-sans text-slate-400 mt-1 leading-snug">
              Solid understanding of primary concepts.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setConfidence('certain')}
            disabled={isEvaluating}
            className={`p-3 rounded-xl border text-left font-mono transition-all cursor-pointer active:scale-[0.98] min-h-[56px] ${
              confidence === 'certain'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-sm ring-1 ring-emerald-500/40'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">3. Certain</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                CONFIDENT
              </span>
            </div>
            <p className="text-[10px] font-sans text-slate-400 mt-1 leading-snug">
              Rigorous invariant defense; ready for counter-cases.
            </p>
          </button>
        </div>

        {/* Range Slider for Metacognition */}
        <div className="flex items-center gap-3 pt-1 px-1">
          <label
            htmlFor="confidence-slider"
            className="text-[10px] font-mono text-slate-400 whitespace-nowrap flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>CONFIDENCE SLIDER:</span>
          </label>
          <input
            id="confidence-slider"
            type="range"
            min="1"
            max="3"
            step="1"
            value={confidence === 'tentative' ? 1 : confidence === 'moderate' ? 2 : 3}
            onChange={(e) => {
              const val = Number(e.target.value);
              setConfidence(val === 1 ? 'tentative' : val === 2 ? 'moderate' : 'certain');
            }}
            disabled={isEvaluating}
            className="flex-1 accent-indigo-500 h-2 bg-slate-900 rounded-lg cursor-pointer disabled:opacity-40"
            title="Slide to adjust self-assessment confidence"
          />
          <span className="text-[11px] font-mono text-indigo-300 uppercase w-24 text-right font-bold">
            [{confidence}]
          </span>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <CornerDownLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Press</span>
            <kbd className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-semibold">
              ⌘ + Enter
            </kbd>
            <span>to submit</span>
          </span>

          {answer.trim().length > 0 && (
            <button
              type="button"
              onClick={handleClearAnswer}
              className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors cursor-pointer min-h-[44px]"
              title="Clear current text"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>CLEAR</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!answer.trim() || isEvaluating}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg cursor-pointer min-h-[48px] active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          <span>{isEvaluating ? 'EVALUATING DEFENSE...' : 'SUBMIT DEFENSE'}</span>
        </button>
      </div>
    </div>
  );
};
