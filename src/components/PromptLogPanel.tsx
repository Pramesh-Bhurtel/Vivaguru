import React, { useState } from 'react';
import { Terminal, Copy, Check, ChevronRight, ChevronLeft, Cpu, Clock, Layers } from 'lucide-react';
import { PromptLogEntry } from '../types/exam.js';

interface PromptLogPanelProps {
  logs: PromptLogEntry[];
  isOpen: boolean;
  onToggle: () => void;
}

export const PromptLogPanel: React.FC<PromptLogPanelProps> = ({ logs, isOpen, onToggle }) => {
  const [selectedLogIndex, setSelectedLogIndex] = useState<number>(Math.max(0, logs.length - 1));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (logs.length > 0) {
      setSelectedLogIndex(logs.length - 1);
    }
  }, [logs.length]);

  const activeLog = logs[selectedLogIndex] || logs[logs.length - 1];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside
      className={`border-l border-slate-800 bg-[#0f172a] flex flex-col transition-all duration-200 z-20 shrink-0 ${
        isOpen ? 'w-full lg:w-[380px] xl:w-[440px]' : 'w-12'
      }`}
    >
      {/* Header / Toggle Button */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors w-full cursor-pointer"
          title={isOpen ? 'Collapse Prompt Log' : 'Expand Prompt Log'}
        >
          {isOpen ? <ChevronRight className="w-4 h-4 text-indigo-400" /> : <ChevronLeft className="w-4 h-4 text-indigo-400" />}
          {isOpen ? (
            <div className="flex items-center justify-between w-full pr-2">
              <span className="flex items-center gap-1.5 font-bold tracking-wider text-slate-200 text-xs">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                PROMPT_TELEMETRY ({logs.length})
              </span>
              <span className="text-[9px] font-mono bg-indigo-500/10 px-2 py-0.5 rounded-sm text-indigo-300 border border-indigo-500/20 uppercase tracking-widest">
                CHAIN_SYNC
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-[9px] [writing-mode:vertical-lr] tracking-[0.2em] uppercase text-slate-500 font-mono">
                TELEMETRY
              </span>
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Turn selector tabs */}
          {logs.length > 0 && (
            <div className="px-3 py-2 border-b border-slate-800 bg-[#0a0f1d]/70 flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[9px] font-mono uppercase text-slate-500 shrink-0 mr-1 tracking-wider">
                CYCLES:
              </span>
              {logs.map((log, index) => (
                <button
                  key={log.id || index}
                  onClick={() => setSelectedLogIndex(index)}
                  className={`px-2 py-1 rounded-sm text-[10px] font-mono shrink-0 transition-colors uppercase tracking-wider ${
                    selectedLogIndex === index
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  #{index + 1} {log.stage === 'opening_question' ? 'OPEN' : log.stage === 'final_report' ? 'REPORT' : 'SCORE'}
                </button>
              ))}
            </div>
          )}

          {activeLog ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
              {/* Telemetry info */}
              <div className="grid grid-cols-2 gap-2 bg-[#0a0f1d] p-2.5 rounded-sm border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-500">STAGE:</span>
                  <span className="text-slate-200 font-semibold uppercase">{activeLog.stage}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 justify-end">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-500">LATENCY:</span>
                  <span className="text-emerald-400">{activeLog.durationMs}ms</span>
                </div>
              </div>

              {/* Exact Prompt Sent */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> PROMPT_PAYLOAD_DISPATCHED
                  </span>
                  <button
                    onClick={() => handleCopy(activeLog.prompt, `prompt-${activeLog.id}`)}
                    className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded-sm bg-slate-900 border border-slate-800 cursor-pointer"
                  >
                    {copiedId === `prompt-${activeLog.id}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> COPIED
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> COPY PROMPT
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-sm text-slate-300 whitespace-pre-wrap break-words text-[11px] max-h-56 overflow-y-auto leading-relaxed font-mono">
                  {activeLog.prompt}
                </pre>
              </div>

              {/* Parsed Model Decision */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
                    STRUCTURED_JSON_RESPONSE
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        JSON.stringify(activeLog.parsedResponse, null, 2),
                        `res-${activeLog.id}`
                      )
                    }
                    className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded-sm bg-slate-900 border border-slate-800 cursor-pointer"
                  >
                    {copiedId === `res-${activeLog.id}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> COPIED
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> COPY JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-sm text-slate-200 whitespace-pre-wrap break-words text-[11px] max-h-48 overflow-y-auto leading-relaxed font-mono">
                  {JSON.stringify(activeLog.parsedResponse, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-500 text-xs font-mono">
              Prompt execution logs will stream here as the viva progresses.
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
