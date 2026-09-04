import React, { useState } from 'react';
import { Sparkles, AlertCircle, Shield, Flame, Smile, ArrowRight, BookOpen, Smartphone, FileText } from 'lucide-react';
import { SAMPLE_TOPICS, SampleTopic } from '../data/sampleTopics.js';
import { DifficultyLevel } from '../types/exam.js';
import { PdfUploader } from './PdfUploader.js';
import { ExtractedPdfResult } from '../utils/pdfExtractor.js';
import { VivaGuruLogo } from './VivaGuruLogo.js';
import { PWAInstallButton } from './PWAInstallButton.js';

interface InputScreenProps {
  onBeginViva: (sourceMaterial: string, difficulty: DifficultyLevel, topicTitle?: string) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  savedSession?: {
    topicTitle: string;
    turnCount: number;
    difficulty: DifficultyLevel;
    currentScreen: 'input' | 'exam' | 'report';
    savedAt: number;
  } | null;
  onResumeSavedSession?: () => void;
  onDiscardSavedSession?: () => void;
}

export const InputScreen: React.FC<InputScreenProps> = ({
  onBeginViva,
  isLoading,
  errorMessage,
  savedSession,
  onResumeSavedSession,
  onDiscardSavedSession,
}) => {
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('standard');
  const [activeTopicTitle, setActiveTopicTitle] = useState<string>('');

  const handleSelectSample = (sample: SampleTopic) => {
    setSourceMaterial(sample.notes);
    setActiveTopicTitle(sample.title);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceMaterial.trim() || isLoading) return;
    onBeginViva(sourceMaterial.trim(), difficulty, activeTopicTitle || undefined);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-5 sm:py-8 px-3.5 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-24 sm:pb-12">
      {/* Brand Hero with Official Logo & Tagline */}
      <div className="flex flex-col items-center text-center mb-5 sm:mb-8">
        <VivaGuruLogo variant="full" size="lg" className="mb-3 sm:mb-4" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-indigo-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-2.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span>Adaptive Socratic Examination Protocol</span>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-sans leading-relaxed px-2">
          Oral defense simulator testing conceptual understanding through real-time interrogation, metacognitive calibration, and rigorous voice feedback.
        </p>
      </div>

      {/* PWA Mobile Quick Install Banner */}
      <div className="mb-5 sm:hidden">
        <PWAInstallButton variant="banner" />
      </div>

      {/* Auto-Saved Active Session Resume Card */}
      {savedSession && (
        <div className="mb-5 bg-gradient-to-r from-slate-950 via-indigo-950/50 to-slate-950 border border-indigo-500/40 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
                  ACTIVE DEFENSE SESSION DETECTED
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
                  RESTORE READY
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                {savedSession.topicTitle || 'Oral Examination Session'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Round {savedSession.turnCount} &bull; Demeanor: {savedSession.difficulty.toUpperCase()} &bull; Auto-saved at {new Date(savedSession.savedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {onDiscardSavedSession && (
              <button
                type="button"
                onClick={onDiscardSavedSession}
                className="text-xs font-mono text-slate-400 hover:text-rose-400 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900/90 transition-colors uppercase tracking-wider active:scale-95 min-h-[44px]"
              >
                Discard
              </button>
            )}
            {onResumeSavedSession && (
              <button
                type="button"
                onClick={onResumeSavedSession}
                className="flex items-center gap-2 text-xs font-mono font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-md transition-all uppercase tracking-wider active:scale-95 min-h-[44px]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Resume Viva</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Curated Academic Sample Topics */}
      <div className="mb-5 bg-slate-950/80 backdrop-blur-md border border-slate-800/90 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              01
            </span>
            <span className="text-xs font-bold font-mono uppercase tracking-[0.12em] text-indigo-300">
              Curated Academic Topics
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">1-TAP BENCHMARK LOADER</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_TOPICS.map((topic, idx) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => handleSelectSample(topic)}
              className={`text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between active:scale-[0.98] min-h-[56px] ${
                activeTopicTitle === topic.title
                  ? 'border-indigo-500 bg-indigo-950/50 shadow-sm ring-1 ring-indigo-500/60 text-white'
                  : 'border-slate-800/90 bg-slate-900/70 hover:bg-slate-800/70 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-mono text-[10px] text-slate-400 font-semibold">
                  TOPIC-0{idx + 1}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-semibold">
                  {topic.category}
                </span>
              </div>
              <div className="font-semibold text-slate-100 text-sm line-clamp-1">{topic.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-6">
          {/* Syllabus / Notes Area & PDF Ingestion */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  02
                </span>
                <label
                  htmlFor="source-material-input"
                  className="text-xs font-bold font-mono uppercase tracking-[0.12em] text-indigo-300"
                >
                  Syllabus Material / Core Concepts
                </label>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {sourceMaterial.length.toLocaleString()} CHARS
              </span>
            </div>

            {/* PDF Upload Component */}
            <PdfUploader
              onTextExtracted={(result: ExtractedPdfResult) => {
                setSourceMaterial(result.text);
                setActiveTopicTitle(result.suggestedTitle);
              }}
              disabled={isLoading}
            />

            <div className="relative">
              <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>RAW SYLLABUS TEXT</span>
                </span>
                {activeTopicTitle && (
                  <span className="text-indigo-400 font-medium truncate max-w-[200px]">
                    {activeTopicTitle}
                  </span>
                )}
              </div>
              <textarea
                id="source-material-input"
                rows={6}
                value={sourceMaterial}
                onChange={(e) => {
                  setSourceMaterial(e.target.value);
                  if (activeTopicTitle && e.target.value !== SAMPLE_TOPICS.find(t => t.title === activeTopicTitle)?.notes) {
                    setActiveTopicTitle('');
                  }
                }}
                placeholder="Paste your exam notes, lecture transcript, research paper abstract, or upload a PDF above. The AI board will probe your reasoning directly against this material..."
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 sm:p-4 text-slate-200 placeholder-slate-500 text-sm sm:text-base leading-relaxed font-sans resize-y transition-all min-h-[140px]"
              />
            </div>
          </div>

          {/* Difficulty / Examiner Demeanor Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  03
                </span>
                <span className="text-xs font-bold font-mono uppercase tracking-[0.12em] text-indigo-300">
                  Examiner Demeanor Protocol
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">BOARD RIGOR</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Advisor / Friendly */}
              <button
                type="button"
                onClick={() => setDifficulty('friendly')}
                className={`p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] min-h-[68px] ${
                  difficulty === 'friendly'
                    ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">Advisor Viva</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 rounded-full font-bold">
                    GENTLE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Supportive academic mentor. Redirects gently and probes without confrontation.
                </p>
              </button>

              {/* Standard Board */}
              <button
                type="button"
                onClick={() => setDifficulty('standard')}
                className={`p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] min-h-[68px] ${
                  difficulty === 'standard'
                    ? 'border-indigo-500 bg-indigo-950/50 ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-white">Standard Board</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-full font-bold">
                    FORMAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Objective, scholarly viva board. Zero conversational filler or hints.
                </p>
              </button>

              {/* Hostile External */}
              <button
                type="button"
                onClick={() => setDifficulty('hostile')}
                className={`p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] min-h-[68px] ${
                  difficulty === 'hostile'
                    ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500/50'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold text-white">Hostile External</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full font-bold">
                    STRICT
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Critical external reviewer. Questions assumptions, identifies flaws, demands proofs.
                </p>
              </button>
            </div>
          </div>

          {/* Error notification */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Android-First Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!sourceMaterial.trim() || isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 active:scale-[0.98] text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-[0.15em] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer min-h-[54px]"
            >
              <span>{isLoading ? 'CONVENING EXAMINERS...' : 'INITIALIZE VIVA VOCE DEFENSE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
