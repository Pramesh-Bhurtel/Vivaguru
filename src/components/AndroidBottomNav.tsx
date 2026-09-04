import React from 'react';
import { Home, Palette, Wifi, WifiOff, Smartphone, BookOpen, MessageSquareText, Award } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import { usePWAInstall } from '../hooks/usePWAInstall.js';

interface AndroidBottomNavProps {
  currentView: 'input' | 'exam' | 'report';
  onNavigateHome: () => void;
  onOpenThemeModal: () => void;
  hasSavedSession?: boolean;
  onResumeSession?: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentView,
  onNavigateHome,
  onOpenThemeModal,
  hasSavedSession,
  onResumeSession,
}) => {
  const isOnline = useOnlineStatus();
  const { isInstalled, isInstallable, isIOS, install } = usePWAInstall();

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      alert('Tap the Share button in Safari, then select "Add to Home Screen" to install.');
    } else {
      alert('Tap browser menu (⋮) and select "Install App" or "Add to Home screen".');
    }
  };

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom select-none"
      aria-label="Android Bottom Navigation"
    >
      {/* Setup / Home */}
      <button
        type="button"
        onClick={onNavigateHome}
        className="flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1 rounded-2xl active:scale-95 transition-all duration-150 group"
        aria-label="Navigate to Home setup"
      >
        <div
          className={`px-3 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
            currentView === 'input'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-xs'
              : 'text-slate-400 group-hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
        </div>
        <span
          className={`text-[10px] font-sans mt-0.5 ${
            currentView === 'input' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          Setup
        </span>
      </button>

      {/* Exam / Active Viva View Indicator or Resume button */}
      {currentView === 'exam' ? (
        <div className="flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1">
          <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-xs">
            <MessageSquareText className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-[10px] font-sans font-bold text-emerald-400 mt-0.5">Viva</span>
        </div>
      ) : currentView === 'report' ? (
        <div className="flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1">
          <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-sans font-bold text-purple-400 mt-0.5">Report</span>
        </div>
      ) : (
        hasSavedSession &&
        onResumeSession && (
          <button
            type="button"
            onClick={onResumeSession}
            className="flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1 rounded-2xl active:scale-95 transition-all duration-150 group"
            aria-label="Resume saved viva session"
          >
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-pulse shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-sans font-bold text-emerald-400 mt-0.5">Resume</span>
          </button>
        )
      )}

      {/* Theme Customizer */}
      <button
        type="button"
        onClick={onOpenThemeModal}
        className="flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1 rounded-2xl active:scale-95 transition-all duration-150 group"
        aria-label="Open visual themes"
      >
        <div className="px-3 py-1 rounded-full text-slate-400 group-hover:text-slate-200 transition-colors">
          <Palette className="w-5 h-5 text-purple-400" />
        </div>
        <span className="text-[10px] font-sans text-slate-400 mt-0.5">Themes</span>
      </button>

      {/* PWA Install Button (if installable) */}
      {!isInstalled && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1 rounded-2xl active:scale-95 transition-all duration-150 group"
          aria-label="Install App to device"
        >
          <div className="px-3 py-1 rounded-full text-blue-400 transition-colors">
            <Smartphone className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-sans text-blue-400 mt-0.5">Install</span>
        </button>
      )}

      {/* Network Status Badge */}
      <div className="flex flex-col items-center justify-center min-h-[48px] px-2 py-1 text-[10px] font-mono text-slate-400">
        {isOnline ? (
          <>
            <div className="p-1">
              <Wifi className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-emerald-400/90 text-[9px] font-bold">Online</span>
          </>
        ) : (
          <>
            <div className="p-1">
              <WifiOff className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-amber-400/90 text-[9px] font-bold">Offline</span>
          </>
        )}
      </div>
    </nav>
  );
};
