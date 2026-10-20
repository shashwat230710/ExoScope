import React, { useState } from 'react';
import { FeatureImpact } from '../types.ts';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, Scale, Info } from 'lucide-react';

interface FeatureImpactChartProps {
  impacts: FeatureImpact[];
  onFeatureChange?: (featureKey: string, newValue: number) => void;
}

export const FeatureImpactChart: React.FC<FeatureImpactChartProps> = ({ impacts, onFeatureChange }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'plain'>('visual');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  if (!impacts || impacts.length === 0) return null;

  const maxImpact = Math.max(...impacts.map(i => Math.abs(i.impact)), 0.35);

  const getLogOddsPercentageSwing = (impact: number) => {
    // Convert log-odds shift to an approximate probability shift: delta P approx impact * P * (1-P)
    // For P ~ 0.5, shift is approximately impact * 25%
    const approxPercent = Math.round(impact * 25);
    return approxPercent > 0 ? `+${approxPercent}%` : `${approxPercent}%`;
  };

  return (
    <div className="space-y-4">
      {/* Header bar with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-teal-500/10 text-teal-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
              Why? (Top Feature Impacts)
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-teal-950/70 text-teal-300 border border-teal-800/60">
                SHAP Attribution
              </span>
            </h3>
            <p className="text-[11px] text-[#8892B0]">
              Quantifying how each physical measurement drove the AI classifier verdict
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-[#0B1020] p-0.5 rounded-lg border border-[#1E293B] text-[11px]">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
              viewMode === 'visual'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            SHAP Waterfall
          </button>
          <button
            onClick={() => setViewMode('plain')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
              viewMode === 'plain'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            Plain English
          </button>
        </div>
      </div>

      {/* Explanatory callout for users unfamiliar with SHAP */}
      <div className="p-2.5 rounded-lg bg-[#0F172A]/70 border border-[#1E293B] text-[11px] text-[#8892B0] flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-200 font-medium">How to interpret this: </span>
          Bars to the <strong className="text-teal-400 font-semibold">right (+)</strong> strengthen confidence in a true confirmed exoplanet.
          Bars to the <strong className="text-rose-400 font-semibold">left (-)</strong> flag signatures typical of false alarms, eclipsing binary stars, or detector noise.
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-[#8892B0] font-mono px-1">
            <span>Observed Feature & Value</span>
            <span>Attribution (Δ log-odds)</span>
          </div>

          <div className="space-y-2.5">
            {impacts.map((item) => {
              const isPositive = item.impact >= 0;
              const barWidthPercent = Math.min(100, Math.round((Math.abs(item.impact) / maxImpact) * 100));
              const isExpanded = expandedFeature === item.feature;

              return (
                <div
                  key={item.feature}
                  className="p-2.5 rounded-lg bg-[#0B1020]/90 border border-[#1E293B] hover:border-teal-500/40 transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      {item.name}
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#182346] text-[#8892B0]">
                        {getLogOddsPercentageSwing(item.impact)} shift
                      </span>
                    </span>
                    <span className="font-mono tabular-nums text-slate-300 font-semibold text-xs">
                      {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}{' '}
                      <span className="text-teal-400/80">{item.unit}</span>
                    </span>
                  </div>

                  {/* Dual-direction SHAP Bar with center baseline */}
                  <div className="h-5 bg-[#070B16] rounded-md flex items-center relative overflow-hidden px-1 border border-[#1E293B]">
                    {/* Center zero divider line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700 z-10" />

                    {isPositive ? (
                      // Positive bar (teal) extending right from center
                      <div className="absolute left-1/2 top-0.5 bottom-0.5 flex items-center">
                        <div
                          style={{ width: `${barWidthPercent / 2}%` }}
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-r shadow-[0_0_10px_rgba(45,212,191,0.5)] transition-all duration-500 ease-out flex items-center justify-end pr-1.5"
                        />
                        <span className="ml-1.5 text-[10px] font-mono font-bold text-teal-300">
                          +{item.impact.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      // Negative bar (rose) extending left from center
                      <div className="absolute right-1/2 top-0.5 bottom-0.5 flex items-center justify-end flex-row-reverse">
                        <div
                          style={{ width: `${barWidthPercent / 2}%` }}
                          className="h-full bg-gradient-to-l from-rose-500 to-rose-400 rounded-l shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all duration-500 ease-out flex items-center justify-start pl-1.5"
                        />
                        <span className="mr-1.5 text-[10px] font-mono font-bold text-rose-300">
                          {item.impact.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Scientific interpretation line */}
                  <div className="flex items-center justify-between mt-1.5 text-[11px]">
                    <span className={`${isPositive ? 'text-teal-300/90' : 'text-rose-300/90'} font-medium`}>
                      {item.description}
                    </span>
                    <button
                      onClick={() => setExpandedFeature(isExpanded ? null : item.feature)}
                      className="text-[#8892B0] hover:text-teal-300 flex items-center gap-0.5 text-[10px] cursor-pointer"
                    >
                      {isExpanded ? 'Less' : 'Why'}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Expanded deep-dive astrophysics explanation */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-[#1E293B] text-[11px] text-slate-300 space-y-1 bg-[#121A33]/50 p-2 rounded">
                      <div className="font-semibold text-teal-300">Astrophysical Context:</div>
                      {item.feature === 'snr' && (
                        <p>
                          Kepler and TESS use a strict statistical detection threshold of 7.1σ. At this candidate's SNR of {item.value}σ,
                          the chance of random white noise mimicking this periodic transit signal is negligible.
                        </p>
                      )}
                      {item.feature === 'planet_radius' && (
                        <p>
                          Planetary radii range from sub-Earths (0.5 R⊕) up to super-Jupiters (~15 R⊕). An occultor exceeding 16–20 R⊕ is almost
                          certainly a low-mass M-dwarf star or eclipsing binary companion, not an exoplanet.
                        </p>
                      )}
                      {item.feature === 'impact_parameter' && (
                        <p>
                          Impact parameter <em>b = (a/R*) · cos(i)</em> defines where the planet crosses the stellar disk.
                          When b &gt; 1.0, the planet only grazes the limb of the star (or a blended background binary grazes).
                          Grazing transits produce V-shaped dips that carry a high false-positive rate.
                        </p>
                      )}
                      {item.feature === 'transit_depth' && (
                        <p>
                          Transit depth geometrically equals (R_planet / R_star)². Earth transiting the Sun creates an 84 ppm dip; Jupiter creates ~10,000 ppm.
                          Depths above 25,000 ppm (2.5%) around main-sequence stars almost always indicate stellar eclipses.
                        </p>
                      )}
                      {item.feature === 'transit_duration' && (
                        <p>
                          Kepler's 3rd Law dictates a strict relationship between orbital period and transit duration:
                          <em>T_dur ∝ P^(1/3) · ρ_*^(-1/3)</em>. An anomalous duration flags eccentric orbits, grazing events, or blends.
                        </p>
                      )}
                      {item.feature === 'stellar_parameters' && (
                        <p>
                          Host star radius and surface gravity (log g) determine whether the star is a compact main-sequence dwarf
                          or a bloated red giant with high background star blend risks.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Plain English narrative breakdown */
        <div className="space-y-2.5">
            {impacts.map((item, idx) => {
              const isPositive = item.impact >= 0;
              return (
                <div
                  key={item.feature}
                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    isPositive
                      ? 'bg-teal-950/20 border-teal-800/40 text-slate-200'
                      : 'bg-rose-950/20 border-rose-800/40 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] bg-[#0B1020] border border-[#1E293B]">
                      {idx + 1}
                    </span>
                    <span className={isPositive ? 'text-teal-300' : 'text-rose-300'}>
                      {item.name}: {item.value} {item.unit}
                    </span>
                    <span className={`ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isPositive ? 'bg-teal-500/20 text-teal-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {isPositive ? 'Favors Confirmed Planet' : 'Favors False Alarm'}
                    </span>
                  </div>
                  <p className="text-slate-300 pl-7">
                    {item.description}. This parameter shifts the model's overall planetary probability by{' '}
                    <strong className={isPositive ? 'text-teal-300' : 'text-rose-300'}>
                      {getLogOddsPercentageSwing(item.impact)}
                    </strong>.
                  </p>
                </div>
              );
            })}
          </div>
        )}

      {/* Legend matching and improving the user's uploaded screenshot */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-[#1E293B] text-[11px] text-[#8892B0] gap-2">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] inline-block" />
          <strong className="text-rose-400 font-semibold">Favors False Alarm</strong> (Negative log-odds)
        </span>
        <span className="flex items-center gap-2">
          <strong className="text-teal-300 font-semibold">Favors Confirmed Planet</strong> (Positive log-odds)
          <span className="w-3 h-3 rounded-xs bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)] inline-block" />
        </span>
      </div>
    </div>
  );
};
