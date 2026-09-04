import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  Sliders,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  BookOpen,
} from 'lucide-react';
import { KnowledgeGapItem, ScoreType } from '../types/exam.js';
import { ScoreBadge } from './ScoreBadge.js';

interface KnowledgeGapsSectionProps {
  knowledgeGaps: KnowledgeGapItem[];
}

export const KnowledgeGapsSection: React.FC<KnowledgeGapsSectionProps> = ({ knowledgeGaps }) => {
  const [expandedGapIndices, setExpandedGapIndices] = useState<Record<number, boolean>>({
    0: true, // Expand first gap by default
  });

  const toggleExpand = (idx: number) => {
    setExpandedGapIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const criticalCount = knowledgeGaps.filter((g) => g.severity === 'critical').length;
  const highCount = knowledgeGaps.filter((g) => g.severity === 'high').length;
  const mismatchCount = knowledgeGaps.filter((g) => g.metacognitiveMismatch).length;

  if (knowledgeGaps.length === 0) {
    return (
      <div
        id="knowledge-gaps-section"
        className="bg-[#0a0f1d] border border-emerald-500/30 rounded-sm p-5 sm:p-6 space-y-3"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.15em] text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>KNOWLEDGE GAPS EVALUATION &bull; HISTORICAL CROSS-REFERENCE</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            ZERO SYSTEMIC GAPS
          </span>
        </div>
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-sm text-xs sm:text-sm text-emerald-200/90 font-sans leading-relaxed">
          <p className="font-semibold text-emerald-300 mb-1">
            ✓ Comprehensive Invariant Mastery Confirmed
          </p>
          Cross-referencing all turns in your exam session history revealed no persistent lower-scoring concepts. Every tested theorem and operational boundary was defended with sufficient or strong conceptual rigor.
        </div>
      </div>
    );
  }

  return (
    <div
      id="knowledge-gaps-section"
      className="bg-[#0a0f1d] border border-rose-500/30 rounded-sm p-5 sm:p-6 space-y-5 shadow-lg"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.15em] text-rose-400">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>IDENTIFIED KNOWLEDGE GAPS &bull; CROSS-REFERENCED HISTORICAL DEFICITS</span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Synthesized by cross-referencing concepts that consistently resulted in lower scores across the exam session.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold">
            {knowledgeGaps.length} {knowledgeGaps.length === 1 ? 'GAP' : 'GAPS'} FLAGGED
          </span>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
            Systemic Gaps
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-rose-400">
            {knowledgeGaps.length}
          </span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
            Critical Invariant Lapses
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-rose-500">
            {criticalCount}
          </span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
            High Priority Deficits
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
            {highCount}
          </span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
            Metacognitive Blindspots
          </span>
          <span className="text-xl sm:text-2xl font-mono font-bold text-indigo-400">
            {mismatchCount}
          </span>
        </div>
      </div>

      {/* Knowledge Gap Cards */}
      <div className="space-y-4">
        {knowledgeGaps.map((gap, idx) => {
          const isExpanded = !!expandedGapIndices[idx];

          const severityColor =
            gap.severity === 'critical'
              ? 'border-rose-500/40 bg-rose-950/10'
              : gap.severity === 'high'
              ? 'border-amber-500/40 bg-amber-950/10'
              : 'border-indigo-500/30 bg-slate-900/60';

          const badgeClass =
            gap.severity === 'critical'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : gap.severity === 'high'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';

          return (
            <div
              key={idx}
              className={`border rounded-sm transition-all overflow-hidden ${severityColor}`}
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(idx)}
                className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02]"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 font-bold">
                      GAP 0{idx + 1}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white font-sans">
                      {gap.conceptTag}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-xs border uppercase tracking-wider font-semibold ${badgeClass}`}
                    >
                      {gap.severity === 'critical'
                        ? 'CRITICAL DEFICIT'
                        : gap.severity === 'high'
                        ? 'HIGH PRIORITY'
                        : 'MODERATE LAPSE'}
                    </span>
                  </div>

                  {/* Quantitative Mini-Bar & History Rate */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">MASTERY SCORE:</span>
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            gap.averageScorePercentage < 40
                              ? 'bg-rose-500'
                              : gap.averageScorePercentage < 65
                              ? 'bg-amber-500'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${gap.averageScorePercentage}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-200">
                        {gap.averageScorePercentage}%
                      </span>
                    </div>

                    <span className="hidden sm:inline text-slate-600">&bull;</span>

                    <div>
                      <span className="text-slate-500">LOWER-SCORE RATE: </span>
                      <span className="text-rose-400 font-semibold">
                        {gap.lowScoreRate}% ({gap.weakCount + gap.adequateCount}/{gap.totalAttempts} turns)
                      </span>
                    </div>

                    {gap.weakCount > 0 && (
                      <span className="text-[10px] bg-rose-500/15 border border-rose-500/30 text-rose-300 px-1.5 py-0.5 rounded-xs">
                        {gap.weakCount} WEAK
                      </span>
                    )}

                    {gap.adequateCount > 0 && (
                      <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-xs">
                        {gap.adequateCount} ADEQUATE
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1">
                    {isExpanded ? 'Hide Details' : 'Analyze Deficit'}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </span>
                </div>
              </div>

              {/* Card Expanded Body */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-800/80 bg-[#070b14]">
                  {/* Metacognitive Mismatch Callout */}
                  {gap.metacognitiveMismatch && (
                    <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-xs flex items-center gap-2 text-xs font-mono text-amber-300">
                      <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        <strong>Metacognitive Blindspot:</strong> Candidate expressed high or moderate certainty on inquiries where the examiner flagged flawed invariants.
                      </span>
                    </div>
                  )}

                  {/* Cross-Referenced Inquiries & Examiner Critiques */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Cross-Referenced Exam Inquiries & Flawed Defenses:
                    </span>

                    <div className="space-y-2.5">
                      {gap.lapses.map((lapse, lIdx) => (
                        <div
                          key={lIdx}
                          className="p-3 bg-slate-900/90 border border-slate-800 rounded-sm space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2 text-xs">
                            <span className="font-mono text-slate-400 font-semibold">
                              Inquiry: &ldquo;{lapse.question}&rdquo;
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {lapse.confidence && (
                                <span className="text-[9px] font-mono text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded-xs">
                                  Self: {lapse.confidence}
                                </span>
                              )}
                              <ScoreBadge score={lapse.score} size="sm" />
                            </div>
                          </div>

                          {lapse.answer && (
                            <div className="text-xs text-slate-400 bg-[#0a0f1d] p-2 rounded-xs font-mono border border-slate-800/60">
                              <span className="text-slate-500 uppercase text-[10px] block mb-0.5">
                                Candidate Defense:
                              </span>
                              <p className="line-clamp-2 text-slate-300">
                                {lapse.answer}
                              </p>
                            </div>
                          )}

                          <div className="text-xs text-rose-300/90 bg-rose-950/20 p-2.5 rounded-xs border border-rose-500/20 flex items-start gap-2">
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-mono text-[10px] uppercase tracking-wider text-rose-400 font-bold block">
                                Examiner Critique & Gap Root Cause:
                              </span>
                              <span className="font-sans leading-relaxed">
                                {lapse.examinerCritique}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Remediation Protocol */}
                  <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xs flex items-start gap-2.5 text-xs text-slate-300">
                    <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-400 font-bold block mb-0.5">
                        Targeted Invariant Remediation Protocol:
                      </span>
                      <p className="font-sans leading-relaxed text-slate-300">
                        {gap.remediationAdvice}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
