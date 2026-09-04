import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { ExamExchange, ScoreType } from '../types/exam.js';

interface ScoreProgressionChartProps {
  history: ExamExchange[];
  finalConfidenceScore: number;
}

interface ProgressionPoint {
  turn: string;
  turnNumber: number;
  concept: string;
  score: number; // 35, 70, 100
  cumulativeScore: number;
  scoreType: ScoreType;
  question: string;
  note: string;
}

const SCORE_NUMERICAL: Record<ScoreType, number> = {
  strong: 100,
  adequate: 70,
  weak: 35,
};

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data: ProgressionPoint = payload[0].payload;

  const getBadge = (type: ScoreType) => {
    switch (type) {
      case 'strong':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            STRONG DEFENSE (100)
          </span>
        );
      case 'adequate':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
            ADEQUATE (70)
          </span>
        );
      case 'weak':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-sm bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-2.5 h-2.5 text-rose-400" />
            REDIRECTED (35)
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-sm p-3.5 shadow-2xl max-w-xs space-y-2 text-xs font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-mono">
        <span className="text-indigo-400 font-bold">{data.turn}</span>
        {getBadge(data.scoreType)}
      </div>

      <div>
        <span className="text-[10px] font-mono uppercase text-slate-500 block">CONCEPT TESTED:</span>
        <span className="text-slate-200 font-semibold">{data.concept}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 py-1 bg-slate-900/60 p-2 rounded-sm border border-slate-800 font-mono text-[11px]">
        <div>
          <span className="text-slate-500 text-[10px] block">TURN SCORE</span>
          <span className="text-white font-bold">{data.score}/100</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">RUNNING CONFIDENCE</span>
          <span className="text-indigo-300 font-bold">{data.cumulativeScore}%</span>
        </div>
      </div>

      {data.note && (
        <div className="text-[11px] text-slate-300 italic border-t border-slate-800 pt-1.5 font-serif-examiner">
          &ldquo;{data.note}&rdquo;
        </div>
      )}
    </div>
  );
};

export const ScoreProgressionChart: React.FC<ScoreProgressionChartProps> = ({
  history,
  finalConfidenceScore,
}) => {
  if (!history || history.length === 0) {
    return null;
  }

  // Generate progression dataset
  let runningSum = 0;
  const data: ProgressionPoint[] = history.map((item, idx) => {
    const scoreVal = SCORE_NUMERICAL[item.score] || 70;
    runningSum += scoreVal;
    const runningAvg = Math.round(runningSum / (idx + 1));

    return {
      turn: `Q${idx + 1}`,
      turnNumber: idx + 1,
      concept: item.conceptTag || `Question ${idx + 1}`,
      score: scoreVal,
      cumulativeScore: runningAvg,
      scoreType: item.score,
      question: item.question,
      note: item.note,
    };
  });

  // Calculate score trajectory trend
  const firstScore = data[0]?.score || 70;
  const lastScore = data[data.length - 1]?.score || 70;
  const isUpwardTrend = lastScore >= firstScore;

  return (
    <div className="bg-[#0a0f1d] border border-slate-800 rounded-sm p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header telemetry and indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-[0.15em] text-white">
                Oral Defense Trajectory
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-slate-900 border border-slate-800 text-slate-400">
                RECHARTS_TIMELINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Score performance and cumulative confidence index across individual examination turns.
            </p>
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-400 rounded-full" />
            <span className="text-indigo-300">Turn Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 border-b border-dashed border-emerald-400" />
            <span className="text-emerald-400">Running Mastery</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-sm bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">
            <Activity className="w-3 h-3 text-indigo-400" />
            <span>
              {isUpwardTrend ? 'ADAPTATION: POSITIVE' : 'STRESS_LEVEL: ELEVATED'}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Line Chart Container */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 15, right: 25, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />

            <XAxis
              dataKey="turn"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 35, 70, 100]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Threshold Reference Lines */}
            <ReferenceLine
              y={70}
              stroke="#334155"
              strokeDasharray="4 4"
              label={{
                value: 'PASS_BENCHMARK (70)',
                fill: '#475569',
                fontSize: 9,
                fontFamily: 'monospace',
                position: 'right',
              }}
            />

            {/* Turn Score Line */}
            <Line
              type="monotone"
              dataKey="score"
              name="Turn Score"
              stroke="#818cf8"
              strokeWidth={2.5}
              activeDot={{ r: 6, fill: '#6366f1', stroke: '#c7d2fe', strokeWidth: 2 }}
              dot={{ r: 4, fill: '#4f46e5', stroke: '#818cf8', strokeWidth: 1.5 }}
            />

            {/* Cumulative Mastery Trajectory Line */}
            <Line
              type="monotone"
              dataKey="cumulativeScore"
              name="Running Mastery"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              activeDot={{ r: 5, fill: '#10b981', stroke: '#a7f3d0' }}
              dot={{ r: 3, fill: '#059669', stroke: '#34d399' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 uppercase">Trajectory Outcome:</span>
          <span className="text-slate-200">
            {finalConfidenceScore >= 75
              ? 'Ascending confidence curve — candidate successfully stabilized under examiner probing.'
              : finalConfidenceScore >= 50
              ? 'Variable defense stability — core ideas held, but gap probes produced score fluctuations.'
              : 'Declining trajectory under Socratic pressure — fundamental mechanisms require reinforcement.'}
          </span>
        </div>
        <span className="text-indigo-400 font-bold">
          TOTAL_TURNS: {data.length}
        </span>
      </div>
    </div>
  );
};
