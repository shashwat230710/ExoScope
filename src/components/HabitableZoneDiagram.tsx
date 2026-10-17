import React from 'react';

interface HabitableZoneDiagramProps {
  insolation: number; // in Earth flux units S
  planetName: string;
  zoneLabel: string;
}

export const HabitableZoneDiagram: React.FC<HabitableZoneDiagramProps> = ({
  insolation,
  planetName,
  zoneLabel
}) => {
  const minFlux = 0.08;
  const maxFlux = 12.0;

  const fluxToPercent = (s: number): number => {
    const clamped = Math.min(maxFlux, Math.max(minFlux, s));
    const logMin = Math.log10(minFlux);
    const logMax = Math.log10(maxFlux);
    const pct = ((logMax - Math.log10(clamped)) / (logMax - logMin)) * 100;
    return Math.min(96, Math.max(4, pct));
  };

  const planetPos = fluxToPercent(insolation);
  const earthPos = fluxToPercent(1.0);

  const optInnerPos = fluxToPercent(1.80);
  const consInnerPos = fluxToPercent(1.10);
  const consOuterPos = fluxToPercent(0.36);
  const optOuterPos = fluxToPercent(0.32);

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between text-xs text-[#8892B0]">
        <span className="font-medium text-[#E6EAF5]">
          Habitable Zone Orbit Position
        </span>
        <span className="font-mono text-[11px] text-teal-300">
          {zoneLabel}
        </span>
      </div>

      <div className="relative pt-6 pb-4">
        {/* Planet Marker */}
        <div
          style={{ left: `${planetPos}%` }}
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center z-30 transition-all duration-500 ease-out"
        >
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/80 text-teal-300 border border-teal-500/40 shadow-sm whitespace-nowrap mb-0.5">
            {planetName} ({insolation.toFixed(2)} S⊕)
          </span>
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 ring-4 ring-teal-400/30 animate-pulse" />
        </div>

        {/* Main Spectrum Track */}
        <div className="h-6 w-full rounded-md overflow-hidden flex relative border border-[#1E293B] shadow-inner bg-[#0B1020]">
          {/* 1. Too Hot Zone */}
          <div
            style={{ width: `${optInnerPos}%` }}
            className="h-full bg-rose-950/60 flex items-center justify-center border-r border-rose-500/20"
          >
            <span className="text-[9px] font-mono uppercase tracking-wider text-rose-400">
              Too Hot
            </span>
          </div>

          {/* 2. Optimistic Inner HZ */}
          <div
            style={{ width: `${consInnerPos - optInnerPos}%` }}
            className="h-full bg-amber-950/50 border-r border-amber-500/20"
          />

          {/* 3. Conservative Habitable Zone (Prime) */}
          <div
            style={{ width: `${consOuterPos - consInnerPos}%` }}
            className="h-full bg-emerald-900/60 flex items-center justify-center border-r border-emerald-500/30 relative"
          >
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-300">
              Conservative HZ
            </span>
          </div>

          {/* 4. Optimistic Outer HZ */}
          <div
            style={{ width: `${optOuterPos - consOuterPos}%` }}
            className="h-full bg-amber-950/50 border-r border-amber-500/20"
          />

          {/* 5. Too Cold Zone */}
          <div
            style={{ width: `${100 - optOuterPos}%` }}
            className="h-full bg-blue-950/60 flex items-center justify-center"
          >
            <span className="text-[9px] font-mono uppercase tracking-wider text-blue-400">
              Too Cold
            </span>
          </div>

          {/* Earth Reference Line */}
          <div
            style={{ left: `${earthPos}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-sky-400 z-20 pointer-events-none"
            title="Earth Reference: 1.00 S⊕"
          />
        </div>

        {/* Earth Reference Marker Label */}
        <div
          style={{ left: `${earthPos}%` }}
          className="absolute bottom-0 -translate-x-1/2 text-[10px] font-mono text-sky-400 flex items-center gap-0.5 whitespace-nowrap"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400" />
          Earth (1.0 S⊕)
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#8892B0] pt-1">
        <span>Hot Boundary (&gt;1.8 S⊕)</span>
        <span className="text-emerald-400">Liquid Water Goldilocks Window</span>
        <span>Cold Boundary (&lt;0.3 S⊕)</span>
      </div>
    </div>
  );
};
