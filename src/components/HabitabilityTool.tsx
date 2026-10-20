import React, { useState, useEffect, useRef } from 'react';
import { HabitabilityResult } from '../types.ts';
import { fetchHabitabilityByName, scoreManualHabitability, searchPlanetNames } from '../services/api.ts';
import { ScoreGauge } from './ScoreGauge.tsx';
import { HabitableZoneDiagram } from './HabitableZoneDiagram.tsx';
import { PlanetSphereView } from './PlanetSphereView.tsx';
import {
  Search,
  Sliders,
  ArrowLeftRight,
  Info,
  AlertCircle,
  Globe,
  Sparkles,
  ShieldCheck,
  Flame,
  Snowflake,
  Droplets,
  RotateCcw,
  Check,
  ChevronRight,
  ExternalLink,
  Layers,
  Thermometer,
  Compass
} from 'lucide-react';

interface HabitabilityToolProps {
  initialPlanetName?: string;
  onNavigateToClassifier?: (params: any) => void;
}

export const HabitabilityTool: React.FC<HabitabilityToolProps> = ({
  initialPlanetName = 'Kepler-452 b',
  onNavigateToClassifier
}) => {
  const [searchTerm, setSearchTerm] = useState(initialPlanetName);
  const [suggestions, setSuggestions] = useState<{ pl_name: string; hostname: string; label?: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HabitabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // "What-if" slider simulation mode
  const [whatIfActive, setWhatIfActive] = useState(false);
  const [simParams, setSimParams] = useState({
    radius: 1.63,
    sma: 1.046,
    teff: 5757,
  });

  // Side-by-Side Comparison Mode
  const [compareTarget, setCompareTarget] = useState<'Earth' | 'Mars' | 'TRAPPIST-1 e' | 'Proxima Centauri b'>('Earth');
  const [compareResult, setCompareResult] = useState<HabitabilityResult | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Iconic benchmark planet chips for fast exploration
  const famousExoplanets = [
    { name: 'Earth', tag: 'Baseline Reference (100)', color: 'border-emerald-500/50 text-emerald-300' },
    { name: 'Kepler-452 b', tag: "Earth's Older Cousin", color: 'border-teal-500/50 text-teal-300' },
    { name: 'TRAPPIST-1 e', tag: 'Prime Rocky World', color: 'border-teal-500/50 text-teal-300' },
    { name: 'Proxima Centauri b', tag: 'Nearest Neighbor (4.2 ly)', color: 'border-cyan-500/50 text-cyan-300' },
    { name: 'TOI-700 d', tag: 'TESS Earth-Sized HZ', color: 'border-emerald-500/50 text-emerald-300' },
    { name: 'Kepler-186 f', tag: 'First Earth-Size in HZ', color: 'border-teal-500/50 text-teal-300' }
  ];

  useEffect(() => {
    loadPlanet(initialPlanetName);
  }, [initialPlanetName]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update comparison planet when compareTarget changes
  useEffect(() => {
    fetchHabitabilityByName(compareTarget)
      .then(setCompareResult)
      .catch(() => {});
  }, [compareTarget]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setError(null);
    if (val.trim().length > 1) {
      searchPlanetNames(val).then((res) => {
        setSuggestions(res);
        setShowSuggestions(true);
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const loadPlanet = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHabitabilityByName(name);
      setResult(data);
      setSearchTerm(data.planet_name);
      setShowSuggestions(false);
      setSimParams({
        radius: data.planet_parameters.radius_re,
        sma: data.planet_parameters.semi_major_axis_au,
        teff: data.star_parameters.teff_k
      });
    } catch (err: any) {
      setError(err.message || `Could not find exoplanet "${name}".`);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = async (key: 'radius' | 'sma' | 'teff', val: number) => {
    const updated = { ...simParams, [key]: val };
    setSimParams(updated);
    if (!result) return;

    try {
      const starRad = result.star_parameters.radius_rsun;
      const starLum = Math.pow(starRad, 2) * Math.pow(updated.teff / 5778, 4);
      const newInsol = starLum / Math.pow(Math.max(0.01, updated.sma), 2);
      const newEqt = Math.round(255 * Math.pow(newInsol, 0.25));

      const updatedScore = await scoreManualHabitability({
        pl_name: `${result.planet_name} (Simulated)`,
        hostname: result.hostname,
        pl_rade: updated.radius,
        pl_orbsmax: updated.sma,
        pl_insol: newInsol,
        pl_eqt: newEqt,
        st_teff: updated.teff,
        st_rad: starRad,
        st_mass: result.star_parameters.mass_msun,
        st_spectype: result.star_parameters.spectral_type
      });
      setResult(updatedScore);
    } catch (e) {
      console.warn('Slider simulation error:', e);
    }
  };

  const resetSimulation = () => {
    if (result) {
      loadPlanet(result.planet_name.replace(' (Simulated)', ''));
      setWhatIfActive(false);
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-teal-950/70 text-teal-300 border border-teal-800/60 shadow-[0_0_10px_rgba(45,212,191,0.2)]">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              PHYSICS HABITABILITY EVALUATION SUITE
            </span>
            <span className="text-xs font-mono text-[#8892B0]">Kopparapu & ESI Models</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Planetary Habitability Explorer
          </h1>
          <p className="text-sm text-[#8892B0] max-w-2xl mt-1 leading-relaxed">
            Assess the potential for liquid water and Earth-like biosignatures using Schulze-Makuch Earth Similarity Index (ESI) formulation and Kopparapu stellar habitable zone radiation flux boundaries.
          </p>
        </div>

        {/* Search Bar with live autocomplete */}
        <div ref={searchContainerRef} className="relative w-full md:w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8892B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim().length > 1) setShowSuggestions(true);
              }}
              placeholder="Search planet (e.g. TRAPPIST-1 e)..."
              className="w-full bg-[#121A33] border border-[#1E293B] focus:border-teal-400 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#8892B0] focus:outline-hidden transition-all shadow-inner"
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0D152B] border border-[#1E293B] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-[#1E293B]/60 backdrop-blur-md">
              {suggestions.map((p) => (
                <button
                  key={p.pl_name}
                  onClick={() => loadPlanet(p.pl_name)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#182346] transition-colors cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{p.pl_name}</div>
                    <div className="text-[10px] text-[#8892B0]">Host: {p.hostname}</div>
                  </div>
                  {p.label && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800/50">
                      {p.label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Benchmark Candidate Quick Selector Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#8892B0]">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-teal-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Hall of Fame Candidates
          </span>
          <span>Click to inspect world</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {famousExoplanets.map((fp) => {
            const isSelected = result?.planet_name.startsWith(fp.name);
            return (
              <button
                key={fp.name}
                onClick={() => loadPlanet(fp.name)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden active:scale-95 ${
                  isSelected
                    ? 'bg-teal-950/70 border-teal-500/50 text-teal-300 ring-1 ring-teal-400/30 shadow-[0_0_12px_rgba(45,212,191,0.25)]'
                    : 'bg-[#121A33]/80 border-[#1E293B] hover:border-teal-500/40 text-slate-300 hover:bg-[#182346]'
                }`}
              >
                <div className="font-semibold text-xs text-white truncate">{fp.name}</div>
                <div className="text-[10px] text-[#8892B0] truncate mt-0.5">{fp.tag}</div>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !result && (
        <div className="py-20 text-center font-mono text-sm text-[#8892B0] animate-pulse">
          Computing Kopparapu stellar radiation boundaries and ESI components...
        </div>
      )}

      {result && (
        <div className="space-y-8">
          {/* Main 2-Column Deck: Left (Composite Score & Visual Planet Sphere) / Right (Kopparapu Habitable Zone & ESI Breakdown) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 cols): Composite Score & 3D Interactive Planet Sphere */}
            <div className="lg:col-span-5 space-y-6">
              {/* Composite Habitability Score Card */}
              <div className="p-6 rounded-2xl bg-[#121A33]/90 border border-[#1E293B] shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8892B0]">
                    Composite Habitability Index
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    result.band === 'Earth-like potential'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : result.band === 'Promising'
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                      : result.band === 'Marginal'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {result.band}
                  </span>
                </div>

                {/* Score Gauge & Overview */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
                  <ScoreGauge
                    score={result.score}
                    band={result.band}
                    scoreRange={result.score_range}
                    color={result.band_color}
                    size={160}
                  />

                  <div className="space-y-2 text-center sm:text-left">
                    <div className="text-xl font-extrabold text-white">
                      {result.planet_name}
                    </div>
                    <div className="text-xs font-mono text-[#8892B0]">
                      Host Star: <strong className="text-slate-200">{result.hostname}</strong> ({result.star_parameters.spectral_type})
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                      {result.band_description}
                    </p>
                  </div>
                </div>

                {/* ESI Sub-Indices Bar Breakdown */}
                <div className="mt-6 pt-4 border-t border-[#1E293B] space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#8892B0] flex items-center justify-between">
                    <span>Earth Similarity Sub-Indices</span>
                    <span className="text-teal-400 font-bold">Global ESI: {(result.components.esi_global * 100).toFixed(0)}%</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Interior ESI */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-300">Interior ESI (Radius + Density)</span>
                        <span className="font-mono text-teal-300">{(result.components.esi_interior * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-[#0B1020] rounded-full overflow-hidden border border-[#1E293B]">
                        <div
                          style={{ width: `${Math.round(result.components.esi_interior * 100)}%` }}
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Surface ESI */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-300">Surface ESI (Temp + Escape Velocity)</span>
                        <span className="font-mono text-teal-300">{(result.components.esi_surface * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-[#0B1020] rounded-full overflow-hidden border border-[#1E293B]">
                        <div
                          style={{ width: `${Math.round(result.components.esi_surface * 100)}%` }}
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Interactive Rotating Planet Sphere View */}
              <PlanetSphereView
                planetName={result.planet_name}
                radiusRe={result.planet_parameters.radius_re}
                eqTempK={result.planet_parameters.eq_temp_k}
                insolFlux={result.planet_parameters.insolation_flux}
                densityGcm3={result.planet_parameters.density_gcm3}
                starType={result.star_parameters.spectral_type}
                isEarthLike={result.band === 'Earth-like potential'}
              />
            </div>

            {/* Right Column (7 cols): Kopparapu Habitable Zone Spectrum & Factor Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              {/* Habitable Zone Position Spectrum */}
              <div className="p-6 rounded-2xl bg-[#121A33]/90 border border-[#1E293B] shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-teal-400" />
                      Kopparapu et al. (2013) Habitable Zone Spectrum
                    </h3>
                    <p className="text-xs text-[#8892B0]">
                      Position along the stellar radiation flux gradient relative to conservative liquid water boundaries
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider self-start sm:self-auto ${
                    result.hz_position.zone === 'conservative_hz'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : result.hz_position.zone === 'optimistic_hz'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : result.hz_position.zone === 'too_hot'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }`}>
                    {result.hz_position.label}
                  </span>
                </div>

                {/* Visual Habitable Zone Diagram Component */}
                <HabitableZoneDiagram
                  insolation={result.planet_parameters.insolation_flux}
                  planetName={result.planet_name}
                  zoneLabel={result.hz_position.label}
                />

                {/* HZ Radiation Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#1E293B] text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0B1020] border border-[#1E293B]">
                    <div className="text-[10px] font-mono text-[#8892B0] uppercase">Insolation (S)</div>
                    <div className="font-bold text-white font-mono mt-0.5">
                      {result.planet_parameters.insolation_flux.toFixed(2)} S⊕
                    </div>
                    <div className="text-[10px] text-slate-400">Earth Flux = 1.0</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0B1020] border border-[#1E293B]">
                    <div className="text-[10px] font-mono text-[#8892B0] uppercase">Semi-Major Axis</div>
                    <div className="font-bold text-teal-300 font-mono mt-0.5">
                      {result.planet_parameters.semi_major_axis_au.toFixed(3)} AU
                    </div>
                    <div className="text-[10px] text-slate-400">Orbital Distance</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0B1020] border border-[#1E293B]">
                    <div className="text-[10px] font-mono text-[#8892B0] uppercase">Inner Runaway HZ</div>
                    <div className="font-bold text-amber-300 font-mono mt-0.5">
                      {result.hz_position.conservative_inner.toFixed(2)} S⊕
                    </div>
                    <div className="text-[10px] text-slate-400">Recent Venus Limit</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0B1020] border border-[#1E293B]">
                    <div className="text-[10px] font-mono text-[#8892B0] uppercase">Outer Max HZ</div>
                    <div className="font-bold text-sky-300 font-mono mt-0.5">
                      {result.hz_position.conservative_outer.toFixed(2)} S⊕
                    </div>
                    <div className="text-[10px] text-slate-400">Max Greenhouse Limit</div>
                  </div>
                </div>
              </div>

              {/* Scientific Factor Attribution Breakdown ("Why this Score?") */}
              <div className="p-6 rounded-2xl bg-[#121A33]/90 border border-[#1E293B] shadow-2xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#1E293B]">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide">
                      Habitability Diagnostic Factors (Why this Score?)
                    </h3>
                    <p className="text-xs text-[#8892B0]">
                      Physics-based weighted contributions from planetary, atmospheric, and stellar components
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.why_breakdown.map((item) => (
                    <div
                      key={item.factor}
                      className="p-3 rounded-xl bg-[#0B1020]/80 border border-[#1E293B] hover:border-teal-500/30 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          {item.factor}
                          <span className="text-[10px] font-mono font-normal text-[#8892B0]">
                            (Weight: {(item.weight * 100).toFixed(0)}%)
                          </span>
                        </span>
                        <span className="font-mono font-bold text-teal-300">
                          Score: {item.score}/100 (+{item.contribution.toFixed(1)} pts)
                        </span>
                      </div>

                      <div className="h-1.5 bg-[#182346] rounded-full overflow-hidden mb-1.5">
                        <div
                          style={{ width: `${item.score}%` }}
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                        />
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {item.commentary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive "What-If" Climate Simulator Lab */}
          <div className="p-6 rounded-2xl bg-[#121A33]/90 border border-[#1E293B] shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Live "What-If" Climate & Orbit Simulator
                  </h3>
                  <p className="text-xs text-[#8892B0]">
                    Modify orbital distance, planetary radius, and stellar temperature to watch the climate model and score recalculate in real time
                  </p>
                </div>
              </div>

              <button
                onClick={resetSimulation}
                className="px-3 py-1.5 rounded-lg bg-[#182346] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 self-start sm:self-auto active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
                <span>Reset to Real Catalog</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slider 1: Semi-major axis */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Orbital Distance (AU)</span>
                  <span className="font-mono text-teal-300 font-bold">{simParams.sma.toFixed(3)} AU</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="3.0"
                  step="0.01"
                  value={simParams.sma}
                  onChange={(e) => handleSliderChange('sma', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-[10px] text-[#8892B0] font-mono">
                  <span>0.02 AU (TRAPPIST)</span>
                  <span>1.0 AU (Earth)</span>
                  <span>3.0 AU (Asteroid)</span>
                </div>
              </div>

              {/* Slider 2: Planet Radius */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Planetary Radius (R⊕)</span>
                  <span className="font-mono text-teal-300 font-bold">{simParams.radius.toFixed(2)} R⊕</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.05"
                  value={simParams.radius}
                  onChange={(e) => handleSliderChange('radius', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-[10px] text-[#8892B0] font-mono">
                  <span>0.5 R⊕ (Sub-Earth)</span>
                  <span>1.6 R⊕ (Rocky limit)</span>
                  <span>6.0 R⊕ (Gas)</span>
                </div>
              </div>

              {/* Slider 3: Stellar Temperature */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Host Star Teff (K)</span>
                  <span className="font-mono text-teal-300 font-bold">{simParams.teff.toLocaleString()} K</span>
                </div>
                <input
                  type="range"
                  min="2500"
                  max="7000"
                  step="50"
                  value={simParams.teff}
                  onChange={(e) => handleSliderChange('teff', parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-[10px] text-[#8892B0] font-mono">
                  <span>2,500 K (M-Dwarf)</span>
                  <span>5,778 K (Sun)</span>
                  <span>7,000 K (F-Star)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Matrix Deck: Side-by-Side with Earth or Benchmark Worlds */}
          <div className="p-6 rounded-2xl bg-[#121A33]/90 border border-[#1E293B] shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-teal-400" />
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Side-by-Side Planet Comparison Matrix
                  </h3>
                  <p className="text-xs text-[#8892B0]">
                    Contrast physical and stellar parameters against known planetary baselines
                  </p>
                </div>
              </div>

              {/* Target selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#8892B0]">Compare with:</span>
                {(['Earth', 'Mars', 'TRAPPIST-1 e', 'Proxima Centauri b'] as const).map((tgt) => (
                  <button
                    key={tgt}
                    onClick={() => setCompareTarget(tgt)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                      compareTarget === tgt
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold'
                        : 'text-[#8892B0] hover:text-white'
                    }`}
                  >
                    {tgt}
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1E293B] text-[11px] font-mono uppercase text-[#8892B0]">
                    <th className="py-2.5 px-3">Physical Property</th>
                    <th className="py-2.5 px-3 text-teal-300 font-bold">{result.planet_name}</th>
                    <th className="py-2.5 px-3 text-emerald-300 font-bold">{compareTarget}</th>
                    <th className="py-2.5 px-3">Ratio / Variance</th>
                    <th className="py-2.5 px-3">Habitability Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/60 font-mono">
                  {result.earth_comparison.map((row) => (
                    <tr key={row.property} className="hover:bg-[#182346]/40 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                        {row.property}
                      </td>
                      <td className="py-2.5 px-3 text-white font-semibold">
                        {row.planet_value}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {compareResult
                          ? compareResult.earth_comparison.find((c) => c.property === row.property)?.planet_value || row.earth_value
                          : row.earth_value}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {row.ratio}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.status === 'similar'
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                            : row.status === 'extreme'
                            ? 'bg-rose-950/70 text-rose-300 border border-rose-800'
                            : 'bg-amber-950/70 text-amber-300 border border-amber-800'
                        }`}>
                          {row.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
