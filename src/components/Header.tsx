import React from 'react';
import { ChevronRight, RotateCcw, Palette } from 'lucide-react';
import { DifficultyLevel } from '../types/exam.js';
import { VivaGuruLogo } from './VivaGuruLogo.js';
import { PWAInstallButton } from './PWAInstallButton.js';

interface HeaderProps {
  currentScreen: 'input' | 'exam' | 'report';
  topicTitle?: string;
  difficulty?: DifficultyLevel;
  turnCount?: number;
  onResetSession?: () => void;
  onConcludeEarly?: () => void;
  isAutoSaved?: boolean;
  onOpenThemeSelector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  topicTitle,
  difficulty = 'standard',
  turnCount,
  onResetSession,
  onConcludeEarly,
  isAutoSaved = true,
  onOpenThemeSelector,
}) => {
  const getDifficultyBadge = () => {
    switch (difficulty) {
      case 'friendly':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 uppercase tracking-wider font-semibold">
            ADVISOR
          </span>
        );
      case 'hostile':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-400 uppercase tracking-wider font-semibold">
            HOSTILE
          </span>
        );
      case 'standard':
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 uppercase tracking-wider font-semibold">
            STANDARD
          </span>
        );
    }
  };

  return (
    <header className="h-16 sm:h-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30 shadow-md safe-area-top select-none">
      {/* Brand Identity - VivaGuru with Official Emblem */}
      <div className="flex items-center gap-2 sm:gap-3">
        <VivaGuruLogo variant="horizontal" size="sm" showTagline={true} />
      </div>

      {/* Center Topic State Info (When in exam or report) */}
      {currentScreen !== 'input' && (
        <div className="hidden md:flex items-center gap-2.5 text-xs text-slate-300 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800/90 shadow-inner">
          <span className="max-w-[160px] lg:max-w-[240px] truncate font-medium text-slate-100">
            {topicTitle || 'Oral Examination'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {getDifficultyBadge()}
          {turnCount !== undefined && currentScreen === 'exam' && (
            <span className="text-indigo-400 font-mono text-[11px] pl-1 font-bold">
              ROUND {turnCount}
            </span>
          )}
        </div>
      )}

      {/* Right Controls: Themes, PWA Install, Auto-save status, Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Live Auto-save indicator */}
        {currentScreen !== 'input' && isAutoSaved && (
          <div
            className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow-xs"
            title="Auto-saved to device memory"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold tracking-wider">SAVED</span>
          </div>
        )}

        {/* PWA Install Button */}
        <PWAInstallButton variant="header" />

        {/* Theme Customizer Trigger */}
        {onOpenThemeSelector && (
          <button
            type="button"
            onClick={onOpenThemeSelector}
            className="min-h-[44px] sm:min-h-[40px] px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
            title="Customize visual theme"
            aria-label="Theme settings"
          >
            <Palette className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="hidden md:inline text-xs font-mono">Theme</span>
          </button>
        )}

        {/* Exam in-progress actions */}
        {currentScreen === 'exam' && onConcludeEarly && (
          <button
            type="button"
            onClick={onConcludeEarly}
            className="min-h-[44px] sm:min-h-[40px] text-xs font-mono font-semibold text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 transition-all uppercase tracking-wider active:scale-95 shadow-xs"
            title="Conclude viva and generate assessment report"
          >
            Conclude
          </button>
        )}

        {/* Reset / New Viva */}
        {currentScreen !== 'input' && onResetSession && (
          <button
            type="button"
            onClick={onResetSession}
            className="min-h-[44px] sm:min-h-[40px] flex items-center gap-1.5 text-xs font-mono font-semibold text-indigo-300 hover:text-white px-3 py-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/60 hover:bg-indigo-900/70 transition-all uppercase tracking-wider active:scale-95 shadow-xs"
            title="Start new examination"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">New Viva</span>
          </button>
        )}
      </div>
    </header>
  );
};
