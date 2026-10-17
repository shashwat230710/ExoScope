import React from 'react';

interface ProbabilityGaugeProps {
  probability: number; // 0 to 1
  label: 'CONFIRMED' | 'FALSE POSITIVE';
  threshold?: number;
  size?: number;
}

export const ProbabilityGauge: React.FC<ProbabilityGaugeProps> = ({
  probability,
  label,
  threshold = 0.5,
  size = 180
}) => {
  const percentage = Math.round(probability * 100);
  const isConfirmed = label === 'CONFIRMED';
  
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 0.75;
  const totalLength = circumference * arcFraction;
  const strokeDashoffset = totalLength - (totalLength * probability);

  const strokeColor = isConfirmed ? '#34D399' : '#F87171'; // Emerald vs Rose

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
            strokeDasharray={totalLength}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          {/* Calibrated Probability Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={totalLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold font-mono tabular-nums text-white">
            {percentage}%
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-[#8892B0] mt-0.5">
            Probability
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <div className={`text-base font-semibold ${isConfirmed ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isConfirmed ? 'Confirmed Exoplanet' : 'False Positive'}
        </div>
        <p className="text-xs text-[#8892B0] font-mono mt-0.5">
          Calibrated probability (τ = {threshold})
        </p>
      </div>
    </div>
  );
};
