import React, { useEffect, useRef, useState } from 'react';
import { Mic, Volume2, VolumeX, Activity, Radio } from 'lucide-react';

interface AudioVolumeVisualizerProps {
  analyserNode: AnalyserNode | null;
  isListening: boolean;
  audioLevel: number;
}

export const AudioVolumeVisualizer: React.FC<AudioVolumeVisualizerProps> = ({
  analyserNode,
  isListening,
  audioLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [dbStatus, setDbStatus] = useState<{
    label: string;
    levelClass: string;
    isSpeaking: boolean;
  }>({
    label: 'LISTENING FOR SPEECH',
    levelClass: 'text-slate-400',
    isSpeaking: false,
  });

  useEffect(() => {
    if (!isListening) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bufferLength = 32;
    let dataArray = new Uint8Array(bufferLength);

    if (analyserNode) {
      bufferLength = analyserNode.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background subtle grid/base line
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, width, height);

      // Center baseline
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (analyserNode) {
        analyserNode.getByteFrequencyData(dataArray);

        // Render multi-band frequency bars
        const barCount = 28;
        const totalBarWidth = width / barCount;
        const barPadding = 2;
        const barWidth = Math.max(2, totalBarWidth - barPadding);

        let energySum = 0;

        for (let i = 0; i < barCount; i++) {
          // Sample across bins
          const binIndex = Math.min(
            bufferLength - 1,
            Math.floor((i / barCount) * (bufferLength * 0.75))
          );
          const rawValue = dataArray[binIndex] || 0;
          energySum += rawValue;

          const normalizedHeight = (rawValue / 255) * (height - 4);
          const barHeight = Math.max(3, normalizedHeight);
          const x = i * totalBarWidth + barPadding / 2;
          const y = height - barHeight - 2;

          // Color based on height/intensity
          const ratio = rawValue / 255;
          let fillGradient = ctx.createLinearGradient(0, y, 0, height);
          if (ratio > 0.8) {
            fillGradient.addColorStop(0, '#f43f5e'); // Rose (peaking)
            fillGradient.addColorStop(1, '#6366f1');
          } else if (ratio > 0.4) {
            fillGradient.addColorStop(0, '#10b981'); // Emerald (optimal)
            fillGradient.addColorStop(1, '#065f46');
          } else {
            fillGradient.addColorStop(0, '#6366f1'); // Indigo (ambient)
            fillGradient.addColorStop(1, '#1e1b4b');
          }

          ctx.fillStyle = fillGradient;
          ctx.beginPath();
          // Rounded top
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }

        const avgEnergy = energySum / barCount;
        const speechActive = avgEnergy > 18;

        if (avgEnergy > 160) {
          setDbStatus({
            label: 'AUDIO PEAKING &bull; SPEAK SOFTLY',
            levelClass: 'text-rose-400',
            isSpeaking: true,
          });
        } else if (speechActive) {
          setDbStatus({
            label: 'SPEECH CAPTURED &bull; OPTIMAL LEVEL',
            levelClass: 'text-emerald-400',
            isSpeaking: true,
          });
        } else {
          setDbStatus({
            label: 'MIC LIVE &bull; SPEAK INTO MICROPHONE',
            levelClass: 'text-indigo-400',
            isSpeaking: false,
          });
        }
      } else {
        // Fallback procedural waveform if analyserNode not ready
        const simulatedActive = audioLevel > 15;
        const barCount = 24;
        const totalBarWidth = width / barCount;
        const barWidth = Math.max(2, totalBarWidth - 2);

        for (let i = 0; i < barCount; i++) {
          const x = i * totalBarWidth + 1;
          const wave = Math.sin(Date.now() / 150 + i * 0.4) * 0.5 + 0.5;
          const barHeight = simulatedActive
            ? Math.max(4, (audioLevel / 100) * (height - 6) * (0.4 + wave * 0.6))
            : 3;
          const y = height - barHeight - 2;

          ctx.fillStyle = simulatedActive ? '#10b981' : '#334155';
          ctx.fillRect(x, y, barWidth, barHeight);
        }

        if (simulatedActive) {
          setDbStatus({
            label: 'SPEECH CAPTURED &bull; LEVEL ACTIVE',
            levelClass: 'text-emerald-400',
            isSpeaking: true,
          });
        } else {
          setDbStatus({
            label: 'MIC LIVE &bull; LISTENING',
            levelClass: 'text-slate-400',
            isSpeaking: false,
          });
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isListening, analyserNode, audioLevel]);

  if (!isListening) return null;

  return (
    <div
      id="live-audio-visualizer-container"
      className="p-3 bg-[#0a0f1d] border border-indigo-500/40 rounded-sm shadow-inner space-y-2 animate-fadeIn"
    >
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span
            className={`font-semibold tracking-wider ${dbStatus.levelClass}`}
            dangerouslySetInnerHTML={{ __html: dbStatus.label }}
          />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>LEVEL: {Math.round(audioLevel)}%</span>
        </div>
      </div>

      {/* Canvas Spectrum Display */}
      <div className="relative h-10 w-full rounded-xs overflow-hidden border border-slate-800 bg-[#070b14]">
        <canvas
          ref={canvasRef}
          width={480}
          height={40}
          className="w-full h-full block"
        />

        {/* dB markers along bottom */}
        <div className="absolute inset-x-0 bottom-0.5 px-2 flex justify-between pointer-events-none text-[8px] font-mono text-slate-600 uppercase">
          <span>-48dB</span>
          <span>-24dB</span>
          <span>-12dB</span>
          <span>-6dB</span>
          <span>0dB</span>
        </div>
      </div>
    </div>
  );
};
