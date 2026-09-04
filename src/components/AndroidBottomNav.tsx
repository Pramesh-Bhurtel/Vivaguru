import React from 'react';
import { Home, Palette, Wifi, WifiOff, Smartphone, BookOpen } from 'lucide-react';
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
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
      aria-label="Mobile Android Navigation"
    >
      {/* Home / Setup */}
      <button
        type="button"
        onClick={onNavigateHome}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl active:scale-95 transition-all ${
          currentView === 'input'
            ? 'text-indigo-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-sans">Home</span>
      </button>

      {/* Resume Session Button if available */}
      {hasSavedSession && onResumeSession && currentView === 'input' && (
        <button
          type="button"
          onClick={onResumeSession}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl active:scale-95 transition-all text-emerald-400 font-bold animate-pulse"
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-sans">Resume</span>
        </button>
      )}

      {/* Theme Customizer */}
      <button
        type="button"
        onClick={onOpenThemeModal}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl active:scale-95 transition-all text-slate-400 hover:text-slate-200"
      >
        <Palette className="w-5 h-5 mb-0.5 text-purple-400" />
        <span className="text-[10px] font-sans">Themes</span>
      </button>

      {/* PWA Install Button (if not yet standalone) */}
      {!isInstalled && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl active:scale-95 transition-all text-blue-400 hover:text-white"
        >
          <Smartphone className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-sans">Install</span>
        </button>
      )}

      {/* Network Status Badge */}
      <div className="flex flex-col items-center justify-center py-1 px-2 text-[10px] font-mono text-slate-400 select-none">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-emerald-400 mb-0.5" />
            <span className="text-emerald-400/90 text-[9px]">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-amber-400/90 text-[9px]">Offline</span>
          </>
        )}
      </div>
    </nav>
  );
};
