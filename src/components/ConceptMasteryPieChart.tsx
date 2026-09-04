import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ExamExchange, ScoreType } from '../types/exam.js';

interface ConceptMasteryPieChartProps {
  history: ExamExchange[];
  confidenceScore: number;
  strengths: string[];
  weakSpots: string[];
}

interface ChartSliceData {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  accentBorder: string;
  scoreType: ScoreType | 'untested';
  concepts: string[];
}

export const ConceptMasteryPieChart: React.FC<ConceptMasteryPieChartProps> = ({
  history,
  confidenceScore,
  strengths,
  weakSpots,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredSlice, setHoveredSlice] = useState<ChartSliceData | null>(null);

  // Compute mastery distribution from history and report
  const data: ChartSliceData[] = useMemo(() => {
    if (history.length > 0) {
      const strongItems = history.filter((h) => h.score === 'strong');
      const adequateItems = history.filter((h) => h.score === 'adequate');
      const weakItems = history.filter((h) => h.score === 'weak');
      const total = history.length;

      const slices: ChartSliceData[] = [];

      if (strongItems.length > 0) {
        slices.push({
          id: 'strong',
          label: 'Mastered Invariants',
          count: strongItems.length,
          percentage: Math.round((strongItems.length / total) * 100),
          color: '#10b981', // emerald-500
          accentBorder: '#34d399',
          scoreType: 'strong',
          concepts: Array.from(new Set(strongItems.map((s) => s.conceptTag).filter(Boolean))),
        });
      }

      if (adequateItems.length > 0) {
        slices.push({
          id: 'adequate',
          label: 'Competent with Gaps',
          count: adequateItems.length,
          percentage: Math.round((adequateItems.length / total) * 100),
          color: '#6366f1', // indigo-500
          accentBorder: '#818cf8',
          scoreType: 'adequate',
          concepts: Array.from(new Set(adequateItems.map((s) => s.conceptTag).filter(Boolean))),
        });
      }

      if (weakItems.length > 0) {
        slices.push({
          id: 'weak',
          label: 'Boundary Vulnerabilities',
          count: weakItems.length,
          percentage: Math.round((weakItems.length / total) * 100),
          color: '#f43f5e', // rose-500
          accentBorder: '#fb7185',
          scoreType: 'weak',
          concepts: Array.from(new Set(weakItems.map((s) => s.conceptTag).filter(Boolean))),
        });
      }

      return slices;
    }

    // Fallback if history was abbreviated: construct from strengths & weak spots
    const totalConcepts = Math.max(1, strengths.length + weakSpots.length);
    const strongPct = Math.round((strengths.length / totalConcepts) * 100);
    const weakPct = 100 - strongPct;

    return [
      {
        id: 'strong',
        label: 'Concepts Defended Well',
        count: strengths.length,
        percentage: strongPct,
        color: '#10b981',
        accentBorder: '#34d399',
        scoreType: 'strong',
        concepts: strengths,
      },
      {
        id: 'weak',
        label: 'Concepts to Revisit',
        count: weakSpots.length,
        percentage: weakPct,
        color: '#f43f5e',
        accentBorder: '#fb7185',
        scoreType: 'weak',
        concepts: weakSpots,
      },
    ];
  }, [history, strengths, weakSpots]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const width = 260;
    const height = 260;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.64; // Donut style for geometric balance center score

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('class', 'overflow-visible');

    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    // D3 pie generator with small padAngle for sharp geometric precision
    const pie = d3
      .pie<ChartSliceData>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.04);

    // D3 arc generator
    const arc = d3
      .arc<d3.PieArcDatum<ChartSliceData>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 6)
      .cornerRadius(2);

    const hoverArc = d3
      .arc<d3.PieArcDatum<ChartSliceData>>()
      .innerRadius(innerRadius - 2)
      .outerRadius(radius)
      .cornerRadius(2);

    const pieData = pie(data);

    // Draw background track ring
    g.append('circle')
      .attr('r', radius - 6)
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2);

    g.append('circle')
      .attr('r', innerRadius)
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.5);

    // Render Slices
    const paths = g
      .selectAll<SVGPathElement, d3.PieArcDatum<ChartSliceData>>('path')
      .data(pieData)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('opacity', 0.92)
      .on('mouseenter', function (_, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc as any)
          .style('opacity', 1)
          .attr('stroke', d.data.accentBorder)
          .attr('stroke-width', 2.5);
        setHoveredSlice(d.data);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc as any)
          .style('opacity', 0.92)
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 2);
        setHoveredSlice(null);
      });

    // Animate arc entry with d3 interpolate
    paths
      .transition()
      .duration(750)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || '';
        };
      });

    // Center circular decoration
    g.append('circle')
      .attr('r', innerRadius - 8)
      .attr('fill', '#0a0f1d')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1);

  }, [data]);

  return (
    <div className="bg-[#0a0f1d] border border-slate-800 rounded-sm p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-8 relative shadow-xl">
      {/* Left Column: Visual Confidence & D3 Pie Chart */}
      <div className="flex flex-col items-center justify-center relative shrink-0">
        <div className="relative w-[240px] h-[240px] flex items-center justify-center">
          <svg ref={svgRef} className="w-full h-full" />

          {/* Central Metric in Donut Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">
              MASTERY
            </span>
            <span className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
              {hoveredSlice ? `${hoveredSlice.percentage}%` : `${confidenceScore}%`}
            </span>
            <span className="text-[10px] font-mono text-indigo-400 mt-0.5 uppercase tracking-wider">
              {hoveredSlice ? hoveredSlice.id.toUpperCase() : 'CONFIDENCE'}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2">
          D3 Concept Distribution
        </span>
      </div>

      {/* Right Column: Interactive Mastery Breakdown Ledger */}
      <div className="flex-1 w-full space-y-4">
        <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500">01</span>
            <span className="text-xs font-bold font-mono uppercase tracking-[0.15em] text-indigo-400">
              Concept Defense Mastery Breakdown
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {history.length} EVALUATED EXCHANGES
          </span>
        </div>

        {/* Slice Legends with Live Hover Synchronization */}
        <div className="space-y-2.5">
          {data.map((item) => {
            const isHovered = hoveredSlice?.id === item.id;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredSlice(item)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`p-3 rounded-sm border transition-all cursor-pointer ${
                  isHovered
                    ? 'border-indigo-500 bg-slate-900 shadow-md'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-mono text-slate-200 uppercase font-semibold text-[11px] tracking-wider">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-slate-500">
                      {item.count} {item.count === 1 ? 'question' : 'questions'}
                    </span>
                    <span className="font-bold text-white text-xs">{item.percentage}%</span>
                  </div>
                </div>

                {/* Concepts tagged under this tier */}
                {item.concepts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-800/80">
                    {item.concepts.map((concept, cIdx) => (
                      <span
                        key={cIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contextual Examiner Observation Note */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-sm text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span className="text-slate-500 uppercase tracking-wider">Mastery Weighting:</span>
          <span className="text-slate-300">
            {confidenceScore >= 75
              ? 'Strong theoretical baseline with resilient invariant defenses'
              : confidenceScore >= 50
              ? 'Adequate core mechanics; targeted revision required on edge failure modes'
              : 'Substantial vulnerabilities detected during Socratic stress-testing'}
          </span>
        </div>
      </div>
    </div>
  );
};
