import React, { useState, useRef, useMemo } from 'react';
import {
  Award,
  CheckCircle,
  AlertOctagon,
  BookOpen,
  RotateCcw,
  Printer,
  PieChart,
  FileDown,
  Loader2,
  Check,
  Sliders,
} from 'lucide-react';
import { ExaminerReport, ActiveSession, SelfAssessmentCalibration } from '../types/exam.js';
import { ConceptMasteryPieChart } from './ConceptMasteryPieChart.js';
import { ScoreProgressionChart } from './ScoreProgressionChart.js';
import { ReportHistoryLedger } from './ReportHistoryLedger.js';
import { KnowledgeGapsSection } from './KnowledgeGapsSection.js';
import { analyzeKnowledgeGaps } from '../utils/knowledgeGapAnalyzer.js';
import { exportReportCardToPdf } from '../utils/pdfExport.js';

interface ReportCardProps {
  report: ExaminerReport;
  session: ActiveSession;
  onRestart: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, session, onRestart }) => {
  const reportCardRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportStage, setExportStage] = useState<string>('');
  const [isExportSuccess, setIsExportSuccess] = useState(false);

  const getScoreVerdict = (score: number) => {
    if (score >= 85) return 'DISTINCTION_CONFIDENT_DEFENSE';
    if (score >= 70) return 'PASS_COMPETENT_DEFENSE';
    if (score >= 50) return 'PROVISIONAL_INCONSISTENT_DEFENSE';
    return 'UNSATISFACTORY_REVISION_MANDATED';
  };

  // Metacognitive Calibration telemetry
  const calibration: SelfAssessmentCalibration = report.calibration || (() => {
    let calibratedCount = 0;
    let overconfidentCount = 0;
    let underconfidentCount = 0;
    let totalRated = 0;

    for (const item of session.history) {
      if (!item.confidence) continue;
      totalRated++;
      const s = item.score;
      const c = item.confidence;
      if (
        (c === 'certain' && s === 'strong') ||
        (c === 'moderate' && s === 'adequate') ||
        (c === 'tentative' && s === 'weak')
      ) {
        calibratedCount++;
      } else if (
        (c === 'certain' && (s === 'adequate' || s === 'weak')) ||
        (c === 'moderate' && s === 'weak')
      ) {
        overconfidentCount++;
      } else {
        underconfidentCount++;
      }
    }

    const alignmentPercentage = totalRated > 0 ? Math.round((calibratedCount / totalRated) * 100) : 100;
    let overallCalibration: 'well_calibrated' | 'overconfident' | 'underconfident' | 'prudent' = 'well_calibrated';
    let calibrationNote = 'High metacognitive calibration: Candidate accurately identifies the boundaries of their mastery under examiner pressure.';

    if (totalRated > 0) {
      if (overconfidentCount > calibratedCount && overconfidentCount >= underconfidentCount) {
        overallCalibration = 'overconfident';
        calibrationNote = 'Candidate reported high certainty on questions that suffered from boundary lapses or incomplete invariant proofs.';
      } else if (underconfidentCount > calibratedCount) {
        overallCalibration = 'underconfident';
        calibrationNote = 'Candidate exhibited unwarranted hesitation on topics where their oral defense was technically sound and rigorous.';
      } else if (alignmentPercentage >= 65) {
        overallCalibration = 'well_calibrated';
        calibrationNote = 'High metacognitive calibration: Candidate accurately identifies the boundaries of their mastery under examiner pressure.';
      } else {
        overallCalibration = 'prudent';
        calibrationNote = 'Balanced self-calibration across standard and hostile examiner challenges.';
      }
    }

    return {
      overallCalibration,
      calibrationNote,
      alignmentPercentage,
      calibratedCount,
      overconfidentCount,
      underconfidentCount,
      totalRated,
    };
  })();

  // Cross-reference session history for persistent lower-scoring concepts
  const knowledgeGaps = useMemo(() => {
    return analyzeKnowledgeGaps(session.history, report.weakSpots);
  }, [session.history, report.weakSpots]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!reportCardRef.current || isExportingPdf) return;

    setIsExportingPdf(true);
    setIsExportSuccess(false);

    try {
      await exportReportCardToPdf(reportCardRef.current, {
        topicTitle: session.topicTitle || 'Oral_Defense',
        onProgress: (stage) => setExportStage(stage),
      });
      setIsExportSuccess(true);
      setTimeout(() => setIsExportSuccess(false), 4000);
    } catch (err) {
      console.error('[ReportCard] Failed to export PDF dossier:', err);
    } finally {
      setIsExportingPdf(false);
      setExportStage('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-28 sm:pb-12">
      {/* Report Container */}
      <div
        ref={reportCardRef}
        className="bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden"
      >
        {/* Geometric Circular Balance Accent Motif */}
        <div className="absolute -top-12 -right-12 w-64 h-64 border border-slate-800/80 rounded-full pointer-events-none opacity-40 flex items-center justify-center">
          <div className="w-48 h-48 border border-slate-800 rounded-full flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin-slow" />
          </div>
        </div>

        {/* Certificate Formal Heading */}
        <div className="text-center space-y-2.5 pb-6 border-b border-slate-800/80 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-[10px] font-mono uppercase tracking-[0.2em] shadow-xs">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>Formal Examination Ledger &bull; DOSSIER-RECORD</span>
          </div>
          <h1 className="text-2xl sm:text-4xl text-slate-100 font-bold tracking-tight font-sans">
            Examiner's Final Assessment Dossier
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            TOPIC: <span className="text-slate-200 font-semibold">{session.topicTitle || 'Custom Syllabus Material'}</span> &bull; {session.history.length} EXCHANGES EVALUATED
          </p>
        </div>

        {/* Visual Confidence Score & Concept Mastery Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.15em] text-indigo-400">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <span>Historical Evaluation &bull; Visual Confidence Matrix</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
              {getScoreVerdict(report.confidenceScore)}
            </span>
          </div>

          <ConceptMasteryPieChart
            history={session.history}
            confidenceScore={report.confidenceScore}
            strengths={report.strengths}
            weakSpots={report.weakSpots}
          />
        </div>

        {/* Score Progression Across Individual Questions */}
        {session.history && session.history.length > 0 && (
          <ScoreProgressionChart
            history={session.history}
            finalConfidenceScore={report.confidenceScore}
          />
        )}

        {/* In-character Examiner Feedback */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border-l-4 border-indigo-500 border-t border-r border-b border-slate-800 space-y-2 shadow-inner">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-indigo-400 font-bold">
            EXAMINER_CONCLUDING_REMARKS
          </div>
          <p className="font-serif-examiner text-base sm:text-lg text-slate-200 italic leading-relaxed font-sans">
            &ldquo;{report.examinerFeedback}&rdquo;
          </p>
        </div>

        {/* Metacognitive Self-Assessment Calibration Section */}
        {calibration && calibration.totalRated > 0 && (
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.15em] text-indigo-400">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Metacognitive Calibration &bull; Self-Assessment vs. Examiner Evaluation</span>
              </div>
              <span
                className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border font-bold ${
                  calibration.overallCalibration === 'well_calibrated'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : calibration.overallCalibration === 'overconfident'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : calibration.overallCalibration === 'underconfident'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                }`}
              >
                {calibration.overallCalibration.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-semibold">
                  Metarating Accuracy
                </span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-indigo-400">
                  {calibration.alignmentPercentage}%
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-semibold">
                  Calibrated Exchanges
                </span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
                  {calibration.calibratedCount} / {calibration.totalRated}
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-semibold">
                  Overconfident Drift
                </span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-rose-400">
                  {calibration.overconfidentCount}
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-semibold">
                  Excessive Caution
                </span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-cyan-400">
                  {calibration.underconfidentCount}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex items-start gap-2.5">
              <span className="text-indigo-400 font-bold shrink-0 mt-0.5">METARATING ASSESSMENT:</span>
              <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
                {calibration.calibrationNote}
              </p>
            </div>
          </div>
        )}

        {/* Two Columns: Concepts Defended Well vs Concepts to Revisit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Strengths */}
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-[0.15em] font-mono border-b border-emerald-500/20 pb-2">
              <CheckCircle className="w-4 h-4" />
              <span>CONCEPTS DEFENDED RIGOROUSLY</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-sans">
              {report.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-mono text-xs font-bold">0{idx + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weak Spots */}
          <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-[0.15em] font-mono border-b border-rose-500/20 pb-2">
              <AlertOctagon className="w-4 h-4" />
              <span>BOUNDARY CONCEPTS TO REVISIT</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-sans">
              {report.weakSpots.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-mono text-xs font-bold">0{idx + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Knowledge Gaps Analysis */}
        <KnowledgeGapsSection knowledgeGaps={knowledgeGaps} />

        {/* Chronological Expandable History */}
        <ReportHistoryLedger history={session.history} />

        {/* Concrete Study Suggestions */}
        {report.studySuggestions && report.studySuggestions.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.15em] text-indigo-400">
              <BookOpen className="w-4 h-4" />
              <span>DIRECTIVES FOR SYSTEM DEFENSE PREPARATION</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {report.studySuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed font-sans"
                >
                  <span className="font-mono text-indigo-400 font-bold block mb-1">
                    PROTOCOL 0{idx + 1}
                  </span>
                  <span className="text-slate-300">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Action Bar (Excluded from exported PDF) */}
        <div className="pdf-exclude-export pt-4 hidden sm:flex flex-row items-center justify-between gap-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Export Report PDF Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className={`flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider px-5 py-3 rounded-xl border transition-all cursor-pointer font-bold shadow-md min-h-[48px] active:scale-95 ${
                isExportSuccess
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : isExportingPdf
                  ? 'bg-slate-800 border-indigo-500/60 text-indigo-300 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
              }`}
              title="Convert visual summary, charts, and feedback into a downloadable PDF report"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>{exportStage || 'GENERATING PDF DOSSIER...'}</span>
                </>
              ) : isExportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>DOSSIER DOWNLOADED!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>EXPORT REPORT (PDF)</span>
                </>
              )}
            </button>

            {/* Print Record Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isExportingPdf}
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white px-4 py-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer min-h-[48px] active:scale-95"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>PRINT RECORD</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onRestart}
            disabled={isExportingPdf}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-mono font-bold text-xs uppercase tracking-[0.15em] transition-all cursor-pointer min-h-[48px] active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>INITIALIZE NEW VIVA</span>
          </button>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-3 shadow-2xl safe-area-bottom flex items-center gap-2">
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isExportingPdf}
          className="flex-1 flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider py-3 rounded-xl bg-indigo-600 active:bg-indigo-700 text-white font-bold min-h-[48px]"
        >
          <FileDown className="w-4 h-4" />
          <span>{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          disabled={isExportingPdf}
          className="flex-1 flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-bold min-h-[48px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New Viva</span>
        </button>
      </div>
    </div>
  );
};
