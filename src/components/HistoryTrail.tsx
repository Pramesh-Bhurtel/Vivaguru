import React, { useState } from 'react';
import { ChevronDown, ChevronUp, History } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge.js';
import { ExamExchange } from '../types/exam.js';

interface HistoryTrailProps {
  history: ExamExchange[];
}

export const HistoryTrail: React.FC<HistoryTrailProps> = ({ history }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="border border-slate-800 bg-[#0f172a] rounded-sm overflow-hidden mb-6 transition-all shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] hover:bg-slate-900 text-xs font-mono text-slate-400 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <History className="w-3.5 h-3.5 text-indigo-400" />
          <span className="uppercase tracking-wider">
            Prior Defense Ledger ({history.length} {history.length === 1 ? 'record' : 'records'})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {history.map((h, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-xs ${
                  h.score === 'strong'
                    ? 'bg-emerald-400'
                    : h.score === 'adequate'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
                title={`Turn ${i + 1}: ${h.score}`}
              />
            ))}
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4 max-h-96 overflow-y-auto divide-y divide-slate-800 bg-[#0a0f1d]">
          {history.map((exchange, idx) => (
            <div key={idx} className="pt-4 first:pt-0 space-y-3 font-mono text-[12px]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 text-[11px]">
                    0{idx + 1}
                  </span>
                  <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[11px]">
                    {exchange.conceptTag}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {exchange.confidence && (
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-xs border ${
                        exchange.confidence === 'certain'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : exchange.confidence === 'moderate'
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      Self: {exchange.confidence}
                    </span>
                  )}
                  <ScoreBadge score={exchange.score} size="sm" />
                </div>
              </div>

              {/* Question */}
              <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-sm border border-slate-800">
                <span className="text-indigo-400 font-mono uppercase text-[9px] tracking-widest block mb-1">
                  EXAMINER_INQUIRY:
                </span>
                <p className="font-serif-examiner text-sm text-slate-200 italic font-sans">
                  &ldquo;{exchange.question}&rdquo;
                </p>
              </div>

              {/* Student Answer */}
              <div className="text-xs text-slate-200 p-2.5 bg-slate-900/30 border-l-2 border-indigo-500 rounded-r-sm">
                <span className="text-slate-500 font-mono uppercase text-[9px] tracking-widest block mb-0.5">
                  CANDIDATE_RESPONSE:
                </span>
                <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {exchange.answer}
                </p>
              </div>

              {/* Examiner Note */}
              {exchange.note && (
                <div className="text-xs font-serif-examiner italic text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-sm border border-slate-800/60">
                  Assessment Note: &ldquo;{exchange.note}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
