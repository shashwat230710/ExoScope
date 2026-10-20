import React, { useState, useRef, useEffect } from 'react';
import { Eye, Info, Sparkles, Thermometer, Orbit, Compass } from 'lucide-react';

interface PlanetSphereViewProps {
  planetName: string;
  radiusRe: number;
  eqTempK: number;
  isEarthLike?: boolean;
  insolFlux?: number;
  densityGcm3?: number;
  starType?: string;
}

export const PlanetSphereView: React.FC<PlanetSphereViewProps> = ({
  planetName,
  radiusRe,
  eqTempK,
  isEarthLike,
  insolFlux = 1.0,
  densityGcm3 = 5.5,
  starType = 'G2V'
}) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  // Auto-rotation effect
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.4) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isRotating]);

  // Determine physical climate classification
  let climateType = 'Temperate Terrestrial';
  let atmosphereDescription = 'Equilibrium allows liquid water on a solid rocky surface.';
  let surfaceTheme = 'earth';

  if (radiusRe > 4.0) {
    climateType = eqTempK > 1000 ? 'Hot Jovian Gas Giant' : 'Cold Gas Giant';
    surfaceTheme = 'jovian';
    atmosphereDescription = 'Deep, crushing hydrogen-helium atmosphere with swirling storm belts.';
  } else if (radiusRe > 1.8) {
    climateType = 'Sub-Neptune / Ocean World';
    surfaceTheme = 'subneptune';
    atmosphereDescription = 'Thick volatile-rich atmosphere of water steam, methane, or hydrogen.';
  } else if (eqTempK > 450) {
    climateType = 'Scorched Magma World';
    surfaceTheme = 'magma';
    atmosphereDescription = 'Tidally baked surface with lakes of molten silicate lava and mineral clouds.';
  } else if (eqTempK < 200) {
    climateType = 'Cryogenic Ice World';
    surfaceTheme = 'ice';
    atmosphereDescription = 'Frozen surface of water, carbon dioxide, or methane ice sheets.';
  } else {
    climateType = isEarthLike || (radiusRe <= 1.5 && eqTempK >= 220 && eqTempK <= 320)
      ? 'Temperate Habitable Candidate'
      : 'Rocky Terrestrial Planet';
    surfaceTheme = 'earth';
    atmosphereDescription = 'Balanced stellar insolation suitable for standing liquid surface water.';
  }

  // Calculate surface gravity relative to Earth: g approx (M/R^2) or approx rho * R
  const surfaceGravity = ((densityGcm3 / 5.51) * radiusRe).toFixed(2);
  const celsiusTemp = Math.round(eqTempK - 273.15);

  return (
    <div className="rounded-xl bg-[#0B1020]/90 border border-[#1E293B] p-4 flex flex-col items-center justify-between shadow-xl relative overflow-hidden">
      {/* Background starlight accent */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-[#1E293B] text-xs">
        <div className="flex items-center gap-1.5 font-mono text-teal-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">3D Planetary Climate Model</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#182346] text-[#8892B0] border border-[#1E293B]">
          Drag to Rotate
        </span>
      </div>

      {/* Visual Sphere Representation */}
      <div
        className="relative my-6 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={(e) => {
          isDraggingRef.current = true;
          startXRef.current = e.clientX;
          setIsRotating(false);
        }}
        onMouseMove={(e) => {
          if (!isDraggingRef.current) return;
          const deltaX = e.clientX - startXRef.current;
          startXRef.current = e.clientX;
          setRotationAngle((prev) => (prev + deltaX * 0.8) % 360);
        }}
        onMouseUp={() => {
          isDraggingRef.current = false;
          setIsRotating(true);
        }}
        onMouseLeave={() => {
          isDraggingRef.current = false;
          setIsRotating(true);
        }}
      >
        {/* Orbital halo glow based on surface theme */}
        <div
          className={`absolute rounded-full blur-xl transition-all duration-700 pointer-events-none ${
            surfaceTheme === 'earth'
              ? 'w-48 h-48 bg-teal-500/25'
              : surfaceTheme === 'magma'
              ? 'w-48 h-48 bg-rose-600/30'
              : surfaceTheme === 'ice'
              ? 'w-48 h-48 bg-sky-400/25'
              : surfaceTheme === 'subneptune'
              ? 'w-52 h-52 bg-cyan-500/25'
              : 'w-56 h-56 bg-amber-500/25'
          }`}
        />

        {/* Planet Sphere Body */}
        <div
          style={{ width: 140, height: 140 }}
          className={`rounded-full relative overflow-hidden transition-all duration-500 shadow-2xl ${
            surfaceTheme === 'earth'
              ? 'bg-gradient-to-tr from-[#0F2B48] via-[#1E5F74] to-[#10B981]'
              : surfaceTheme === 'magma'
              ? 'bg-gradient-to-tr from-[#450A0A] via-[#991B1B] to-[#F97316]'
              : surfaceTheme === 'ice'
              ? 'bg-gradient-to-tr from-[#0C4A6E] via-[#0284C7] to-[#BAE6FD]'
              : surfaceTheme === 'subneptune'
              ? 'bg-gradient-to-tr from-[#042F2E] via-[#0D9488] to-[#2DD4BF]'
              : 'bg-gradient-to-tr from-[#451A03] via-[#B45309] to-[#FBBF24]'
          }`}
        >
          {/* Surface texture bands / features that slide as planet rotates */}
          <div
            style={{
              transform: `translateX(-${(rotationAngle * 0.8) % 100}%)`,
              width: '300%'
            }}
            className="absolute inset-0 flex opacity-60 pointer-events-none"
          >
            {surfaceTheme === 'earth' && (
              <div className="w-full h-full bg-[radial-gradient(circle_at_20%_40%,rgba(16,185,129,0.7)_0%,transparent_35%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.7)_0%,transparent_40%),radial-gradient(circle_at_45%_25%,rgba(255,255,255,0.6)_0%,transparent_25%)]" />
            )}
            {surfaceTheme === 'magma' && (
              <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(249,115,22,0.4)_10px,rgba(249,115,22,0.4)_20px)]" />
            )}
            {surfaceTheme === 'ice' && (
              <div className="w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.7)_0%,transparent_50%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.8)_0%,transparent_45%)]" />
            )}
            {surfaceTheme === 'subneptune' && (
              <div className="w-full h-full bg-[repeating-linear-gradient(0deg,rgba(45,212,191,0.4),rgba(45,212,191,0.4)_12px,transparent_12px,transparent_24px)]" />
            )}
            {surfaceTheme === 'jovian' && (
              <div className="w-full h-full bg-[repeating-linear-gradient(0deg,rgba(251,191,36,0.6),rgba(251,191,36,0.6)_8px,rgba(180,83,9,0.5)_8px,rgba(180,83,9,0.5)_16px)]" />
            )}
          </div>

          {/* Day / Night Terminator Shadow */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/25 to-transparent pointer-events-none" />

          {/* Atmospheric Rim Scattering */}
          <div className="absolute inset-0 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.8),inset_8px_8px_16px_rgba(255,255,255,0.4)] pointer-events-none" />
        </div>

        {/* Planet Name Tag */}
        <div className="absolute -bottom-4 px-3 py-1 rounded-full bg-[#0B1020]/95 border border-[#1E293B] shadow-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">{planetName}</span>
        </div>
      </div>

      {/* Planetary Metrics Card Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-[#1E293B] text-center text-xs">
        <div className="p-2 rounded-lg bg-[#121A33]/80 border border-[#1E293B]">
          <div className="text-[10px] font-mono text-[#8892B0] uppercase">Radius</div>
          <div className="text-sm font-bold text-teal-300 font-mono mt-0.5">
            {radiusRe.toFixed(2)} R⊕
          </div>
          <div className="text-[10px] text-slate-400">{(radiusRe * 6371).toLocaleString()} km</div>
        </div>

        <div className="p-2 rounded-lg bg-[#121A33]/80 border border-[#1E293B]">
          <div className="text-[10px] font-mono text-[#8892B0] uppercase">Equilibrium Temp</div>
          <div className="text-sm font-bold font-mono mt-0.5 text-amber-300">
            {eqTempK} K
          </div>
          <div className="text-[10px] text-slate-400">{celsiusTemp}°C</div>
        </div>

        <div className="p-2 rounded-lg bg-[#121A33]/80 border border-[#1E293B]">
          <div className="text-[10px] font-mono text-[#8892B0] uppercase">Surface Gravity</div>
          <div className="text-sm font-bold font-mono mt-0.5 text-cyan-300">
            {surfaceGravity} g
          </div>
          <div className="text-[10px] text-slate-400">vs 1.00 g (Earth)</div>
        </div>

        <div className="p-2 rounded-lg bg-[#121A33]/80 border border-[#1E293B]">
          <div className="text-[10px] font-mono text-[#8892B0] uppercase">Stellar Flux</div>
          <div className="text-sm font-bold font-mono mt-0.5 text-emerald-300">
            {insolFlux.toFixed(2)} S⊕
          </div>
          <div className="text-[10px] text-slate-400">Sunlight vs Earth</div>
        </div>
      </div>

      {/* Atmospheric & Climate Summary */}
      <div className="w-full mt-3 p-2.5 rounded-lg bg-[#121A33]/50 border border-[#1E293B] text-[11px] text-slate-300 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">{climateType}: </span>
          {atmosphereDescription}
        </div>
      </div>
    </div>
  );
};
