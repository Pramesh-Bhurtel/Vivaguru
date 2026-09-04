import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { ScoreType } from '../types/exam.js';

interface ScoreBadgeProps {
  score: ScoreType;
  size?: 'sm' | 'md';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'md' }) => {
  if (score === 'strong') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono uppercase font-semibold rounded-sm border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 tracking-wider ${
          size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2.5 py-1'
        }`}
      >
        <CheckCircle2 className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        DEFENSE_STRONG
      </span>
    );
  }

  if (score === 'adequate') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono uppercase font-semibold rounded-sm border border-amber-400/30 bg-amber-400/10 text-amber-400 tracking-wider ${
          size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2.5 py-1'
        }`}
      >
        <AlertTriangle className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        DEFENSE_ADEQUATE
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase font-semibold rounded-sm border border-rose-400/30 bg-rose-400/10 text-rose-400 tracking-wider ${
        size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2.5 py-1'
      }`}
    >
      <XCircle className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      DEFENSE_WEAK_REDIRECTED
    </span>
  );
};
