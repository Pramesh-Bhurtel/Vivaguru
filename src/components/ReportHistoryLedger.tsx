import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  History,
  MessageSquare,
  Clock,
  User,
  HelpCircle,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { ExamExchange, ScoreType } from '../types/exam.js';
import { ScoreBadge } from './ScoreBadge.js';

interface ReportHistoryLedgerProps {
  history: ExamExchange[];
}

export const ReportHistoryLedger: React.FC<ReportHistoryLedgerProps> = ({ history }) => {
  const [isSectionOpen, setIsSectionOpen] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | ScoreType>('all');
  const [expandedTurns, setExpandedTurns] = useState<Record<number, boolean>>(() => {
    // Expand all items by default for quick review
    const initial: Record<number, boolean> = {};
    history.forEach((_, idx) => {
      initial[idx] = true;
    });
    return initial;
  });

  if (history.length === 0) {
    return (
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-sm p-5 text-center text-xs font-mono text-slate-500">
        No recorded Q&A defense history for this accelerated session.
      </div>
    );
  }

  const toggleTurn = (index: number) => {
    setExpandedTurns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleAll = (expand: boolean) => {
    const next: Record<number, boolean> = {};
    history.forEach((_, idx) => {
      next[idx] = expand;
    });
    setExpandedTurns(next);
  };

  const filteredHistory = history
    .map((exchange, originalIndex) => ({ exchange, originalIndex }))
    .filter(({ exchange }) => {
      if (filter === 'all') return true;
      return exchange.score === filter;
    });

  const strongCount = history.filter((h) => h.score === 'strong').length;
  const adequateCount = history.filter((h) => h.score === 'adequate').length;
  const weakCount = history.filter((h) => h.score === 'weak').length;

  return (
    <div className="bg-[#0a0f1d] border border-slate-800 rounded-sm overflow-hidden shadow-xl">
      {/* Master Toggle Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0f172a] flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setIsSectionOpen(!isSectionOpen)}
          className="flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-sm bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-[0.15em] text-white">
                Chronological Oral Defense Transcript
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {history.length} {history.length === 1 ? 'EXCHANGE' : 'EXCHANGES'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Review all questions posed by the examiner, your spoken/typed defenses, and in-turn assessment marks.
            </p>
          </div>
        </button>

        {/* Action Controls & Minimize Toggle */}
        <div className="flex items-center gap-3">
          {isSectionOpen && (
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
              <button
                onClick={() => toggleAll(true)}
                className="px-2 py-1 rounded-sm border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer uppercase"
              >
                Expand All
              </button>
              <button
                onClick={() => toggleAll(false)}
                className="px-2 py-1 rounded-sm border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer uppercase"
              >
                Collapse All
              </button>
            </div>
          )}

          <button
            onClick={() => setIsSectionOpen(!isSectionOpen)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isSectionOpen ? 'Collapse transcript section' : 'Expand transcript section'}
          >
            {isSectionOpen ? <ChevronUp className="w-5 h-5 text-indigo-400" /> : <ChevronDown className="w-5 h-5 text-indigo-400" />}
          </button>
        </div>
      </div>

      {isSectionOpen && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* Sub-Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
              <span className="text-slate-500 uppercase mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-500" /> FILTER:
              </span>

              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-sm border transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'border-indigo-500 bg-indigo-600 text-white font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                ALL ({history.length})
              </button>

              <button
                onClick={() => setFilter('strong')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-sm border transition-colors cursor-pointer ${
                  filter === 'strong'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                STRONG ({strongCount})
              </button>

              <button
                onClick={() => setFilter('adequate')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-sm border transition-colors cursor-pointer ${
                  filter === 'adequate'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                ADEQUATE ({adequateCount})
              </button>

              <button
                onClick={() => setFilter('weak')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-sm border transition-colors cursor-pointer ${
                  filter === 'weak'
                    ? 'border-rose-500 bg-rose-500/20 text-rose-300 font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <XCircle className="w-2.5 h-2.5 text-rose-400" />
                REDIRECTED ({weakCount})
              </button>
            </div>

            <span className="text-[10px] font-mono text-slate-500">
              SHOWING {filteredHistory.length} OF {history.length} EXCHANGES
            </span>
          </div>

          {/* Chronological Exchange Cards */}
          <div className="space-y-4">
            {filteredHistory.map(({ exchange, originalIndex }) => {
              const isExpanded = !!expandedTurns[originalIndex];

              return (
                <div
                  key={originalIndex}
                  className="border border-slate-800 rounded-sm bg-[#0f172a] transition-all overflow-hidden"
                >
                  {/* Card Header Accordion Trigger */}
                  <button
                    onClick={() => toggleTurn(originalIndex)}
                    className="w-full p-4 flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] hover:bg-slate-900/60 transition-colors text-left cursor-pointer border-b border-slate-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded-sm bg-slate-900 border border-slate-800 text-indigo-400">
                        TURN #{String(originalIndex + 1).padStart(2, '0')}
                      </span>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <span className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
                          {exchange.conceptTag || 'Core Topic Defense'}
                        </span>
                        <span className="hidden sm:inline text-slate-600 text-xs">&bull;</span>
                        <span className="text-[11px] text-slate-500 max-w-[280px] sm:max-w-md truncate">
                          &ldquo;{exchange.question}&rdquo;
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      {exchange.confidence && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-xs border uppercase ${
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
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Body Details */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 space-y-4 bg-[#0a0f1d]/60 font-sans">
                      {/* 1. Examiner Question */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-sm p-4 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                          <span>EXAMINER_INQUIRY</span>
                        </div>
                        <p className="font-serif-examiner text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                          &ldquo;{exchange.question}&rdquo;
                        </p>
                      </div>

                      {/* 2. Candidate Defense */}
                      <div className="border-l-2 border-indigo-500 bg-slate-900/30 p-3.5 sm:p-4 rounded-r-sm space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span className="uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                            <User className="w-3 h-3 text-indigo-400" />
                            <span>CANDIDATE_ORAL_DEFENSE</span>
                          </span>
                          <span className="text-slate-500">
                            {exchange.answer.trim().split(/\s+/).length} words
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                          {exchange.answer}
                        </p>
                      </div>

                      {/* 3. In-Character Examiner Assessment Feedback */}
                      {exchange.note && (
                        <div className="bg-slate-900/60 border border-slate-800/90 rounded-sm p-3.5 flex items-start gap-3 text-xs">
                          <div className="p-1 rounded-sm bg-slate-800 text-indigo-400 shrink-0 mt-0.5">
                            <MessageSquare className="w-3 h-3" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-0.5">
                              BOARD_EVALUATION_NOTE:
                            </span>
                            <p className="font-serif-examiner italic text-slate-200 text-xs sm:text-sm">
                              &ldquo;{exchange.note}&rdquo;
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 4. Self-Assessment Metacognitive Calibration */}
                      {exchange.confidence && (
                        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-sm bg-slate-900/50 border border-slate-800 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                              CANDIDATE SELF-APPRAISAL:
                            </span>
                            <span className="font-semibold text-slate-300 uppercase">
                              [{exchange.confidence}]
                            </span>
                          </div>
                          <div>
                            {(exchange.confidence === 'certain' && exchange.score === 'strong') ||
                            (exchange.confidence === 'moderate' && exchange.score === 'adequate') ||
                            (exchange.confidence === 'tentative' && exchange.score === 'weak') ? (
                              <span className="text-emerald-400 text-[11px] font-semibold">
                                ✓ METARATING CALIBRATED
                              </span>
                            ) : exchange.confidence === 'certain' &&
                              (exchange.score === 'weak' || exchange.score === 'adequate') ? (
                              <span className="text-rose-400 text-[11px] font-semibold">
                                ⚠ OVERCONFIDENT DRIFT
                              </span>
                            ) : (
                              <span className="text-indigo-400 text-[11px] font-semibold">
                                ℹ EXCESSIVELY TENTATIVE / CAUTIOUS
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
