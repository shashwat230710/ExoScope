import React from 'react';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  band: string;
  scoreRange?: [number, number];
  color?: string;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  band,
  scoreRange,
  color,
  size = 190
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.min(1, Math.max(0, score / 100));
  const strokeDashoffset = circumference - (circumference * fraction);

  const defaultColor = score >= 80 ? '#34D399' :
                       score >= 60 ? '#5EEAD4' :
                       score >= 40 ? '#FBBF24' :
                       score >= 20 ? '#FB923C' : '#F87171';
  const ringColor = color || defaultColor;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 origin-center"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
          />
          {/* Score Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-bold font-mono tabular-nums text-white">
              {score}
            </span>
            <span className="text-sm font-mono text-slate-500 ml-1">
              /100
            </span>
          </div>
          {scoreRange && (
            <span className="text-xs font-mono text-[#8892B0] mt-1">
              Range: {scoreRange[0]}–{scoreRange[1]}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 text-center">
        <div
          className="text-lg font-bold tracking-tight"
          style={{ color: ringColor }}
        >
          {band}
        </div>
        <p className="text-xs text-[#8892B0] font-mono mt-0.5">
          Habitability potential score
        </p>
      </div>
    </div>
  );
};
