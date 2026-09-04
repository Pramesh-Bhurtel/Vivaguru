import React, { useState } from 'react';
import { Download, Check, Share2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';

interface PWAInstallButtonProps {
  variant?: 'header' | 'bottom-bar' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed in standalone mode, suppress button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 3000);
      }
    } else {
      // Direct user to browser menu on Android/Chrome
      alert('To install VivaGuru on your Android device, tap your browser menu (⋮) and select "Add to Home screen" or "Install App".');
    }
  };

  if (variant === 'bottom-bar') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-2 rounded-xl active:scale-95 transition-all text-indigo-400 hover:text-white ${className}`}
          aria-label="Install VivaGuru App"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-0.5">
            {installSuccess ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4 text-indigo-400" />
            )}
          </div>
          <span className="text-[10px] font-mono tracking-wider font-semibold">Install</span>
        </button>

        {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
      </>
    );
  }

  if (variant === 'banner') {
    return (
      <>
        <div className={`bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-blue-950/70 border border-indigo-500/30 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white font-sans">
                Install VivaGuru on Android / Mobile
              </h4>
              <p className="text-[11px] text-slate-400 font-sans">
                Fast offline access, zero browser frame, full-screen exam mode.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold shrink-0 shadow-md active:scale-95 transition-all uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>

        {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
      </>
    );
  }

  // Header pill variant
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all text-xs font-mono font-medium active:scale-95 shadow-sm ${className}`}
        title="Install VivaGuru PWA on your device"
        aria-label="Install App"
      >
        {installSuccess ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Download className="w-3.5 h-3.5 text-indigo-400" />
        )}
        <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-semibold">
          {installSuccess ? 'Installed' : 'Install PWA'}
        </span>
      </button>

      {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
    </>
  );
};

const IOSInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#0f172a] border border-slate-700 p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>Install on iOS / Safari</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          To run VivaGuru as an installed standalone mobile app on your iPhone or iPad:
        </p>

        <ol className="space-y-3 text-xs text-slate-300 font-sans mb-6">
          <li className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <span>
              Tap the <Share2 className="w-3.5 h-3.5 inline text-indigo-400 mx-1" /> <strong>Share</strong> button in Safari toolbar.
            </span>
          </li>
          <li className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <span>
              Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
            </span>
          </li>
          <li className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <span>Launch from your home screen for pure full-screen mode.</span>
          </li>
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-mono text-xs font-bold text-white uppercase tracking-wider transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
