import React from 'react';
import { FeatureImpact } from '../types.ts';

interface FeatureImpactChartProps {
  impacts: FeatureImpact[];
}

export const FeatureImpactChart: React.FC<FeatureImpactChartProps> = ({ impacts }) => {
  if (!impacts || impacts.length === 0) return null;

  const maxImpact = Math.max(...impacts.map(i => Math.abs(i.impact)), 0.35);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[#8892B0] font-mono">
        <span>Feature</span>
        <span>SHAP Attribution (Δ log-odds)</span>
      </div>

      <div className="space-y-2.5">
        {impacts.map((item) => {
          const isPositive = item.impact >= 0;
          const barWidthPercent = Math.min(100, Math.round((Math.abs(item.impact) / maxImpact) * 100));

          return (
            <div key={item.feature} className="group relative">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#E6EAF5]">
                  {item.name}
                </span>
                <span className="font-mono tabular-nums text-[#8892B0]">
                  {item.value} {item.unit}
                </span>
              </div>

              {/* Bar visualization: center line with left/right bar */}
              <div className="h-4 bg-[#0B1020] rounded flex items-center relative overflow-hidden px-1 border border-[#1E293B]">
                {/* Center marker */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#1E293B] z-10" />

                {isPositive ? (
                  // Positive bar extending right from center
                  <div className="absolute left-1/2 top-0.5 bottom-0.5 flex items-center">
                    <div
                      style={{ width: `${barWidthPercent / 2}%` }}
                      className="h-full bg-teal-400 rounded-r transition-all duration-500 ease-out flex items-center justify-end pr-1.5"
                    />
                    <span className="ml-1 text-[10px] font-mono font-medium text-teal-300">
                      +{item.impact.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  // Negative bar extending left from center
                  <div className="absolute right-1/2 top-0.5 bottom-0.5 flex items-center justify-end flex-row-reverse">
                    <div
                      style={{ width: `${barWidthPercent / 2}%` }}
                      className="h-full bg-rose-400 rounded-l transition-all duration-500 ease-out flex items-center justify-start pl-1.5"
                    />
                    <span className="mr-1 text-[10px] font-mono font-medium text-rose-300">
                      {item.impact.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-[#8892B0] mt-0.5">
                {item.description}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#1E293B] text-[11px] text-[#8892B0]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-rose-400 inline-block" />
          Favors False Alarm
        </span>
        <span className="flex items-center gap-1.5">
          Favors Confirmed Planet
          <span className="w-2.5 h-2.5 rounded-xs bg-teal-400 inline-block" />
        </span>
      </div>
    </div>
  );
};
