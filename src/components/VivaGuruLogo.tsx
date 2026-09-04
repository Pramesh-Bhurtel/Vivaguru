import React from 'react';

export interface VivaGuruLogoProps {
  variant?: 'full' | 'horizontal' | 'compact' | 'icon-only';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const VivaGuruLogo: React.FC<VivaGuruLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true,
}) => {
  // Icon dimensions based on size
  const iconDimensions = {
    xs: { width: 26, height: 26 },
    sm: { width: 34, height: 34 },
    md: { width: 44, height: 44 },
    lg: { width: 68, height: 68 },
    xl: { width: 110, height: 110 },
  }[size];

  // Standalone vector emblem precisely matching user's uploaded brand mark
  const Emblem = (
    <svg
      viewBox="0 0 512 512"
      width={iconDimensions.width}
      height={iconDimensions.height}
      className="shrink-0 transition-transform duration-300 hover:scale-105 select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="VivaGuru Emblem"
    >
      <defs>
        <linearGradient id="logoLeftWing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c084fc" />
          <stop offset="40%" stop-color="#9333ea" />
          <stop offset="100%" stop-color="#6b21a8" />
        </linearGradient>
        <linearGradient id="logoRightWing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="40%" stop-color="#2563eb" />
          <stop offset="100%" stop-color="#1e3a8a" />
        </linearGradient>
        <linearGradient id="logoCap" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
      </defs>

      <g transform="translate(0, 15)">
        {/* Mortarboard Cap */}
        <path
          d="M 256 60 L 354 102 L 256 144 L 158 102 Z"
          fill="url(#logoCap)"
          stroke="#60a5fa"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 196 112 Q 256 160 316 112 C 316 134 300 156 256 156 C 212 156 196 134 196 112 Z"
          fill="#1e3a8a"
        />
        <circle cx="256" cy="102" r="7" fill="#93c5fd" />
        <path
          d="M 256 102 Q 330 114 340 142 L 340 184"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M 334 184 L 346 184 L 343 202 L 337 202 Z" fill="#93c5fd" />

        {/* Scholar Head */}
        <circle cx="256" cy="190" r="34" fill="#1e3a8a" />

        {/* Left Arm of the V */}
        <path
          d="M 256 376 L 152 170 C 170 170 195 172 222 174 L 256 306 Z"
          fill="url(#logoLeftWing)"
        />
        <path
          d="M 136 168 L 168 168 L 256 358 L 242 365 Z"
          fill="#c084fc"
          opacity="0.95"
        />

        {/* Right Arm of the V */}
        <path
          d="M 256 376 L 360 170 C 342 170 317 172 290 174 L 256 306 Z"
          fill="url(#logoRightWing)"
        />
        <path
          d="M 376 168 L 344 168 L 256 358 L 270 365 Z"
          fill="#38bdf8"
          opacity="0.95"
        />

        {/* Open Book Left Pages */}
        <path
          d="M 256 384 C 210 360 160 332 110 292 C 122 334 164 390 256 412 Z"
          fill="url(#logoLeftWing)"
        />
        <path
          d="M 256 412 C 192 396 146 360 100 322 C 110 340 134 382 256 426 Z"
          fill="#7c3aed"
        />

        {/* Open Book Right Pages */}
        <path
          d="M 256 384 C 302 360 352 332 402 292 C 390 334 348 390 256 412 Z"
          fill="url(#logoRightWing)"
        />
        <path
          d="M 256 412 C 320 396 366 360 412 322 C 402 340 378 382 256 426 Z"
          fill="#1d4ed8"
        />
      </g>
    </svg>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{Emblem}</div>;
  }

  // Tagline separator bar and text
  const TaglineBar = (
    <div className="flex flex-col items-center w-full">
      <div className="w-full flex items-center justify-center gap-1.5 my-1">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
        <span className="h-[1px] flex-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-600 opacity-60 max-w-[240px]" />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
      </div>
      <p className="text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.25em] text-slate-400 uppercase text-center select-none">
        PRACTICE. UNDERSTAND. EXCEL.
      </p>
    </div>
  );

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="mb-2 p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-inner">
          {Emblem}
        </div>
        <div className="flex items-center justify-center font-sans font-black tracking-tight text-2xl sm:text-3xl lg:text-4xl">
          <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
            VIVA
          </span>
          <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 bg-clip-text text-transparent ml-1">
            GURU
          </span>
        </div>
        {showTagline && <div className="w-full mt-1.5 max-w-xs">{TaglineBar}</div>}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {Emblem}
        <div className="flex items-center font-sans font-black tracking-tight text-lg sm:text-xl">
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            VIVA
          </span>
          <span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent ml-0.5">
            GURU
          </span>
        </div>
      </div>
    );
  }

  // Default 'horizontal'
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="p-1 rounded-xl bg-slate-900/50 border border-slate-800/60 shadow-sm shrink-0">
        {Emblem}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center font-sans font-black tracking-tight text-base sm:text-lg leading-tight">
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            VIVA
          </span>
          <span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent ml-0.5">
            GURU
          </span>
        </div>
        {showTagline && (
          <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-[0.16em] text-slate-400 uppercase select-none leading-none mt-0.5">
            PRACTICE. UNDERSTAND. EXCEL.
          </span>
        )}
      </div>
    </div>
  );
};
