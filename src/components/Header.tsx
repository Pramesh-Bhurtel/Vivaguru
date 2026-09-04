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
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 uppercase tracking-wider">
            ADVISOR
          </span>
        );
      case 'hostile':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 uppercase tracking-wider">
            HOSTILE
          </span>
        );
      case 'standard':
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 uppercase tracking-wider">
            STANDARD
          </span>
        );
    }
  };

  const getStatusLabel = () => {
    if (currentScreen === 'input') return 'STANDBY';
    if (currentScreen === 'exam') return 'INTERROGATING';
    return 'COMPLETED';
  };

  return (
    <header className="h-16 sm:h-20 border-b border-slate-800/80 bg-[#0f172a]/95 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30 shadow-sm">
      {/* Brand Identity - VivaGuru with Official Emblem and Tagline */}
      <div className="flex items-center gap-3">
        <VivaGuruLogo variant="horizontal" size="sm" showTagline={true} />
      </div>

      {/* Center Topic State Info (When in exam or report) */}
      {currentScreen !== 'input' && (
        <div className="hidden md:flex items-center gap-2.5 text-xs text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
          <span className="max-w-[180px] lg:max-w-[260px] truncate text-slate-200 font-medium">
            {topicTitle || 'Oral Examination'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          {getDifficultyBadge()}
          {turnCount !== undefined && currentScreen === 'exam' && (
            <span className="text-indigo-400 font-mono text-[11px] pl-1 font-semibold">
              ROUND {turnCount}
            </span>
          )}
        </div>
      )}

      {/* Right Controls: Themes, PWA Install, Auto-save status, Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Auto-save indicator */}
        {currentScreen !== 'input' && isAutoSaved && (
          <div
            className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full"
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
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
            title="Customize visual theme"
            aria-label="Theme settings"
          >
            <Palette className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline text-xs font-mono">Theme</span>
          </button>
        )}

        {/* Exam in-progress actions */}
        {currentScreen === 'exam' && onConcludeEarly && (
          <button
            type="button"
            onClick={onConcludeEarly}
            className="text-xs font-mono font-semibold text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 transition-colors uppercase tracking-wider active:scale-95 shadow-xs"
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
            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-indigo-300 hover:text-white px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 transition-colors uppercase tracking-wider active:scale-95 shadow-xs"
            title="Start new examination"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">New Viva</span>
          </button>
        )}
      </div>
    </header>
  );
};
