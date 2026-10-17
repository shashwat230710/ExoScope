import React from 'react';

interface PlanetSphereViewProps {
  planetName: string;
  radiusRe: number;
  eqTempK: number;
  isEarthLike?: boolean;
}

export const PlanetSphereView: React.FC<PlanetSphereViewProps> = ({
  planetName,
  radiusRe,
  eqTempK,
  isEarthLike
}) => {
  // Determine planet visual style based on temperature and size
  let gradientClass = 'from-blue-600 via-emerald-600 to-slate-900';
  let glowColor = 'rgba(56, 189, 248, 0.4)';
  let typeLabel = 'Temperate Rocky World';

  if (radiusRe > 6.0) {
    // Gas giant
    gradientClass = eqTempK > 1000
      ? 'from-amber-600 via-orange-700 to-slate-950'
      : 'from-amber-500 via-orange-800 to-amber-950';
    glowColor = 'rgba(251, 146, 60, 0.4)';
    typeLabel = eqTempK > 1000 ? 'Hot Jovian Gas Giant' : 'Cold Gas Giant';
  } else if (radiusRe > 2.0) {
    // Sub-Neptune / Mini-Neptune
    gradientClass = 'from-cyan-500 via-teal-700 to-slate-950';
    glowColor = 'rgba(45, 212, 191, 0.4)';
    typeLabel = 'Sub-Neptune / Water World';
  } else if (eqTempK > 500) {
    // Scorching super-Earth / Lava world
    gradientClass = 'from-red-600 via-amber-700 to-slate-950';
    glowColor = 'rgba(239, 68, 68, 0.4)';
    typeLabel = 'Scorching Magma World';
  } else if (eqTempK < 200) {
    // Frozen icy world
    gradientClass = 'from-sky-300 via-blue-700 to-slate-950';
    glowColor = 'rgba(186, 230, 253, 0.4)';
    typeLabel = 'Cryogenic Ice World';
  } else if (isEarthLike || (radiusRe <= 1.8 && eqTempK >= 220 && eqTempK <= 320)) {
    // Earth-like / Temperate
    gradientClass = 'from-cyan-400 via-emerald-600 to-blue-950';
    glowColor = 'rgba(52, 211, 153, 0.5)';
    typeLabel = 'Temperate Habitable Candidate';
  }

  // Calculate proportional visual diameter in pixels
  // Baseline Earth = 46px
  const clampedRadius = Math.min(3.8, Math.max(0.5, radiusRe));
  const planetDiameter = Math.round(46 * Math.sqrt(clampedRadius));

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/90 text-white border border-slate-800 shadow-md">
      <div className="text-[11px] font-mono uppercase tracking-wider text-teal-400 mb-3">
        Physical Scale vs. Earth
      </div>

      <div className="flex items-center justify-center gap-8 py-4">
        {/* Earth reference sphere */}
        <div className="flex flex-col items-center">
          <div
            style={{ width: 46, height: 46 }}
            className="rounded-full bg-gradient-to-tr from-blue-700 via-emerald-500 to-blue-900 shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-1 ring-blue-300/30 relative overflow-hidden"
          >
            {/* Atmospheric highlight */}
            <div className="absolute inset-0 bg-radial from-transparent to-black/40" />
            <div className="absolute top-1 left-2 w-3 h-2 rounded-full bg-white/30 blur-[1px]" />
          </div>
          <span className="text-xs font-semibold mt-2">Earth</span>
          <span className="text-[10px] font-mono text-slate-400">1.00 R⊕</span>
        </div>

        <div className="text-slate-600 font-mono text-sm">vs</div>

        {/* Exoplanet sphere */}
        <div className="flex flex-col items-center">
          <div
            style={{
              width: planetDiameter,
              height: planetDiameter,
              boxShadow: `0 0 20px ${glowColor}`
            }}
            className={`rounded-full bg-gradient-to-tr ${gradientClass} ring-1 ring-white/20 relative overflow-hidden transition-all duration-500`}
          >
            {/* Cloud swirls / atmospheric shading */}
            <div className="absolute inset-0 bg-radial from-transparent to-black/50" />
            <div className="absolute top-1.5 left-2 w-5 h-3 rounded-full bg-white/25 blur-[1px]" />
          </div>
          <span className="text-xs font-semibold text-teal-300 mt-2 truncate max-w-32">
            {planetName}
          </span>
          <span className="text-[10px] font-mono text-teal-400 font-bold">
            {radiusRe.toFixed(2)} R⊕ ({radiusRe.toFixed(2)}x Earth)
          </span>
        </div>
      </div>

      <div className="text-[11px] font-mono text-slate-400 mt-1">
        Classification: <span className="text-slate-200">{typeLabel}</span>
      </div>
    </div>
  );
};
