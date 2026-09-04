import React from 'react';
import { Palette, Check, X, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme, ThemeId } from '../context/ThemeContext.js';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, availableThemes } = useTheme();

  if (!isOpen) return null;

  const handleSelect = (id: ThemeId) => {
    // Tactile haptic feedback for Android devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // ignore
      }
    }
    setTheme(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#0f172a] border border-slate-700/80 p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[88vh] overflow-y-auto"
        role="dialog"
        aria-label="Theme Customization"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sans text-white">Theme Customizer</h3>
              <p className="text-[11px] text-slate-400 font-sans">Android Material You & OLED Modes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme List */}
        <div className="py-4 space-y-2.5">
          {availableThemes.map((th) => {
            const isSelected = th.id === theme;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => handleSelect(th.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 active:scale-[0.98] ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-md ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Swatch preview circle */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner border border-white/10"
                    style={{ backgroundColor: th.bgHex }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: th.accentHex }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-sans text-white">{th.name}</span>
                      {th.isDark ? (
                        <Moon className="w-3 h-3 text-slate-400" />
                      ) : (
                        <Sun className="w-3 h-3 text-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{th.tagline}</p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-slate-700 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" /> Auto-saved in browser
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider text-xs active:scale-95 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
