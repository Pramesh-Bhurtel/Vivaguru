import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Timer,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Plus,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export type TimerPreset = 60 | 90 | 120 | 0; // 0 means untimed

interface VivaTimerProps {
  turnCount: number;
  currentQuestion: string;
  isEvaluating: boolean;
  isSessionComplete?: boolean;
  onTimeout: () => void;
}

export const VivaTimer: React.FC<VivaTimerProps> = ({
  turnCount,
  currentQuestion,
  isEvaluating,
  isSessionComplete = false,
  onTimeout,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<TimerPreset>(90);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [extensionsUsed, setExtensionsUsed] = useState<number>(0);
  const [audioCueEnabled, setAudioCueEnabled] = useState<boolean>(true);
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);

  const prevQuestionRef = useRef<string>(currentQuestion);
  const prevTurnRef = useRef<number>(turnCount);

  // Soft audible tick for final 5 seconds
  const playCountdownBeep = useCallback((freq = 520, duration = 0.08) => {
    if (!audioCueEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime); // gentle volume
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore in restricted audio environments
    }
  }, [audioCueEnabled]);

  // Reset timer whenever a new question or turn begins
  useEffect(() => {
    if (
      currentQuestion !== prevQuestionRef.current ||
      turnCount !== prevTurnRef.current
    ) {
      prevQuestionRef.current = currentQuestion;
      prevTurnRef.current = turnCount;
      setTimeLeft(selectedDuration);
      setIsPaused(false);
      setExtensionsUsed(0);
      setHasTimedOut(false);
    }
  }, [currentQuestion, turnCount, selectedDuration]);

  // Countdown interval loop
  useEffect(() => {
    // If untimed (0), evaluating, session complete, paused, or already timed out: don't tick
    if (
      selectedDuration === 0 ||
      isEvaluating ||
      isSessionComplete ||
      isPaused ||
      hasTimedOut
    ) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHasTimedOut(true);
          playCountdownBeep(330, 0.25); // Lower alert pitch on timeout
          onTimeout();
          return 0;
        }

        // Warning sound on 5, 4, 3, 2, 1
        if (prev <= 6 && prev > 1) {
          playCountdownBeep(580, 0.06);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    selectedDuration,
    isEvaluating,
    isSessionComplete,
    isPaused,
    hasTimedOut,
    onTimeout,
    playCountdownBeep,
  ]);

  // Request 30-second defense extension
  const handleRequestExtension = () => {
    setTimeLeft((prev) => prev + 30);
    setExtensionsUsed((prev) => prev + 1);
    if (hasTimedOut) {
      setHasTimedOut(false);
    }
  };

  const handleResetTimer = () => {
    setTimeLeft(selectedDuration);
    setHasTimedOut(false);
    setIsPaused(false);
  };

  const handleDurationChange = (preset: TimerPreset) => {
    setSelectedDuration(preset);
    setTimeLeft(preset);
    setHasTimedOut(false);
    setIsPaused(false);
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage calculation
  const totalAllocated = selectedDuration + extensionsUsed * 30;
  const progressPercent = selectedDuration > 0
    ? Math.max(0, Math.min(100, (timeLeft / totalAllocated) * 100))
    : 100;

  // Visual urgency classification
  const isCritical = selectedDuration > 0 && timeLeft <= 15;
  const isWarning = selectedDuration > 0 && timeLeft > 15 && timeLeft <= 30;

  return (
    <div
      className={`rounded-sm border transition-all duration-300 p-3.5 sm:p-4 shadow-lg ${
        hasTimedOut
          ? 'bg-rose-950/30 border-rose-500/60'
          : isCritical
          ? 'bg-[#1a0f1d] border-rose-500/50 shadow-rose-950/20 animate-pulse-subtle'
          : isWarning
          ? 'bg-[#1a1712] border-amber-500/40'
          : 'bg-[#0f172a] border-slate-800'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Clock Display & Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-sm flex items-center justify-center font-mono transition-colors ${
              hasTimedOut
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : isCritical
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : isWarning
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
            }`}
          >
            {hasTimedOut ? (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            ) : (
              <Timer className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400">
                Viva Defense Clock
              </span>

              {/* Urgency Status Pill */}
              {selectedDuration === 0 ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-slate-800 text-slate-400 border border-slate-700">
                  UNTIMED_MODE
                </span>
              ) : hasTimedOut ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase tracking-wider">
                  DEFENSE_WINDOW_EXPIRED
                </span>
              ) : isCritical ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase tracking-wider animate-pulse">
                  TIME_CRITICAL (&le;15S)
                </span>
              ) : isWarning ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  TIME_CAUTION (&le;30S)
                </span>
              ) : (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
                  ACTIVE_WINDOW
                </span>
              )}
            </div>

            {/* Large Digital Counter */}
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono font-bold tracking-tight text-xl sm:text-2xl ${
                  selectedDuration === 0
                    ? 'text-slate-400'
                    : hasTimedOut
                    ? 'text-rose-400'
                    : isCritical
                    ? 'text-rose-400'
                    : isWarning
                    ? 'text-amber-400'
                    : 'text-white'
                }`}
              >
                {selectedDuration === 0 ? '--:--' : formattedTime}
              </span>

              {extensionsUsed > 0 && selectedDuration > 0 && (
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-xs border border-indigo-500/20">
                  +{extensionsUsed * 30}s EXTENDED
                </span>
              )}

              {isPaused && selectedDuration > 0 && !hasTimedOut && (
                <span className="text-[10px] font-mono text-amber-400 italic">
                  [PAUSED]
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls & Presets */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Preset Buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-sm p-0.5">
            {([60, 90, 120] as TimerPreset[]).map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => handleDurationChange(dur)}
                className={`px-2 py-1 text-[10px] rounded-xs transition-colors cursor-pointer uppercase ${
                  selectedDuration === dur
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Set countdown to ${dur} seconds per question`}
              >
                {dur}s
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleDurationChange(0)}
              className={`px-2 py-1 text-[10px] rounded-xs transition-colors cursor-pointer uppercase ${
                selectedDuration === 0
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Disable time pressure (untimed defense)"
            >
              OFF
            </button>
          </div>

          {selectedDuration > 0 && (
            <>
              {/* Pause / Resume Button */}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                disabled={isEvaluating || hasTimedOut}
                className="p-1.5 bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white rounded-sm transition-colors cursor-pointer disabled:opacity-40"
                title={isPaused ? 'Resume countdown' : 'Pause countdown'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              {/* Request +30s Extension Button */}
              <button
                type="button"
                onClick={handleRequestExtension}
                disabled={isEvaluating || extensionsUsed >= 3}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white rounded-sm text-[11px] transition-colors cursor-pointer disabled:opacity-40"
                title="Request +30s deliberation extension from the examiner"
              >
                <Plus className="w-3 h-3 text-indigo-400" />
                <span>+30s</span>
              </button>

              {/* Reset Clock */}
              <button
                type="button"
                onClick={handleResetTimer}
                disabled={isEvaluating}
                className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-sm transition-colors cursor-pointer disabled:opacity-40"
                title="Reset question timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Toggle Audio Beeper */}
              <button
                type="button"
                onClick={() => setAudioCueEnabled(!audioCueEnabled)}
                className={`p-1.5 rounded-sm border transition-colors cursor-pointer ${
                  audioCueEnabled
                    ? 'bg-slate-900 border-slate-800 text-indigo-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-600'
                }`}
                title={audioCueEnabled ? 'Mute final 5s countdown audio cue' : 'Enable final 5s countdown audio cue'}
              >
                {audioCueEnabled ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {selectedDuration > 0 && (
        <div className="mt-3 w-full bg-slate-800/80 h-1.5 rounded-xs overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              hasTimedOut
                ? 'bg-rose-500 w-full'
                : isCritical
                ? 'bg-rose-500'
                : isWarning
                ? 'bg-amber-400'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${hasTimedOut ? 100 : progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
