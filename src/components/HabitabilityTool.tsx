import React, { useState, useEffect, useRef } from 'react';
import { HabitabilityResult } from '../types.ts';
import { fetchHabitabilityByName, scoreManualHabitability, searchPlanetNames } from '../services/api.ts';
import { ScoreGauge } from './ScoreGauge.tsx';
import { HabitableZoneDiagram } from './HabitableZoneDiagram.tsx';
import { PlanetSphereView } from './PlanetSphereView.tsx';
import { Search, Sliders, ArrowLeftRight, Info, AlertCircle, PlusCircle, Globe } from 'lucide-react';

export const HabitabilityTool: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('Kepler-452 b');
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
  const [compareActive, setCompareActive] = useState(false);
  const [compareTarget, setCompareTarget] = useState('Earth');
  const [compareResult, setCompareResult] = useState<HabitabilityResult | null>(null);

  // Manual entry modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    pl_name: 'Hypothetical Super-Earth',
    hostname: 'Solar Twin Star',
    pl_rade: 1.25,
    pl_bmasse: 2.1,
    pl_orbper: 320,
    pl_orbsmax: 0.92,
    pl_eqt: 260,
    pl_insol: 1.05,
    st_teff: 5600,
    st_rad: 0.98,
    st_mass: 0.97,
    st_spectype: 'G3V'
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPlanet('Kepler-452 b');
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setError(null);
    if (val.trim().length > 1) {
      searchPlanetNames(val).then(res => {
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
      if (compareActive && compareTarget !== data.planet_name) {
        fetchHabitabilityByName(compareTarget).then(setCompareResult).catch(() => {});
      }
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
        pl_name: `${result.planet_name} (Adjusted)`,
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
      console.warn("Slider simulation error:", e);
    }
  };

  const handleToggleCompare = async () => {
    if (!compareActive) {
      setCompareActive(true);
      try {
        const comp = await fetchHabitabilityByName(compareTarget);
        setCompareResult(comp);
      } catch (e) {}
    } else {
      setCompareActive(false);
      setCompareResult(null);
    }
  };

  const handleSelectComparePlanet = async (name: string) => {
    setCompareTarget(name);
    try {
      const comp = await fetchHabitabilityByName(name);
      setCompareResult(comp);
    } catch (e) {}
  };

  const curatedExoplanets = [
    { name: 'Kepler-452 b', tag: "Earth's Cousin (Score 97)", color: 'text-emerald-400' },
    { name: 'TRAPPIST-1 e', tag: 'Temperate Rocky (Score 94)', color: 'text-emerald-400' },
    { name: 'Proxima Centauri b', tag: 'Nearest Neighbor (Score 88)', color: 'text-teal-300' },
    { name: 'TOI-700 d', tag: 'TESS Earth-Size (Score 92)', color: 'text-emerald-400' },
    { name: 'LHS 1140 b', tag: 'Dense Super-Earth (Score 82)', color: 'text-teal-300' },
    { name: 'Earth', tag: 'Reference World (Score 100)', color: 'text-sky-400' },
    { name: 'K2-18 b', tag: 'Hycean Ocean World (Score 49)', color: 'text-amber-400' },
    { name: 'WASP-12 b', tag: 'Ultra-Hot Jupiter (Score 0)', color: 'text-rose-400' }
  ];

  return (
    <div className="space-y-8">
      {/* Search Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[#1E293B] shadow-lg">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/habitable_super_earth_1792239014300.jpg"
            alt="Habitable Exoplanet"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1020] via-[#0B1020]/90 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 max-w-2xl text-white space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-teal-300 font-semibold">
            Planetary Habitability Laboratory & Physics Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Exoplanet Habitability Explorer
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Search any known exoplanet to calculate its Earth Similarity Index (ESI), habitable zone orbital position, and suitability for human-like life.
          </p>

          {/* Search Input Bar */}
          <div className="pt-2" ref={searchContainerRef}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchTerm.trim()) loadPlanet(searchTerm.trim());
              }}
              className="relative"
            >
              <div className="relative flex items-center">
                <Search className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchTerm.trim().length > 1) {
                      searchPlanetNames(searchTerm).then(res => {
                        setSuggestions(res);
                        setShowSuggestions(true);
                      });
                    }
                  }}
                  placeholder="Type any planet name (e.g. Kepler-452 b, TRAPPIST-1 e, Proxima Centauri b)..."
                  className="w-full pl-11 pr-28 py-3 text-sm rounded-xl border border-[#1E293B] bg-[#0B1020]/95 text-white placeholder-[#8892B0] focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 shadow-lg"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 transition-colors shadow-xs cursor-pointer"
                >
                  {loading ? 'Analyzing...' : 'Search'}
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 py-1.5 bg-[#121A33] border border-[#1E293B] rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-[#1E293B]">
                  {suggestions.map((item) => (
                    <button
                      key={item.pl_name}
                      type="button"
                      onClick={() => loadPlanet(item.pl_name)}
                      className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-[#182346] transition-colors group cursor-pointer"
                    >
                      <div>
                        <span className="font-semibold text-sm text-white group-hover:text-teal-300">
                          {item.pl_name}
                        </span>
                        <span className="ml-2 text-xs font-mono text-[#8892B0]">
                          Host Star: {item.hostname}
                        </span>
                      </div>
                      {item.label && (
                        <span className="text-xs text-teal-300 font-mono">
                          {item.label}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Quick-Pick Popular Planets Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#8892B0] font-mono">
          <span>Featured Exoplanets & Benchmarks:</span>
          <span>Click any card to inspect habitability</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {curatedExoplanets.map((p) => {
            const isSelected = result?.planet_name === p.name;
            return (
              <button
                key={p.name}
                onClick={() => loadPlanet(p.name)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500/20 border-teal-400 shadow-sm ring-1 ring-teal-400/30'
                    : 'bg-[#121A33] border-[#1E293B] hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs text-white truncate">
                  {p.name}
                </div>
                <div className={`text-[10px] font-mono mt-0.5 truncate ${p.color}`}>
                  {p.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar: What-If Sliders & Compare Mode Switches */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#121A33] border border-[#1E293B]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWhatIfActive(!whatIfActive)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              whatIfActive
                ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-semibold'
                : 'bg-[#0B1020] border-[#1E293B] text-[#E6EAF5] hover:bg-[#182346]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            "What-If" Parameter Sliders {whatIfActive ? '(Active)' : ''}
          </button>

          <button
            onClick={handleToggleCompare}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              compareActive
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-semibold'
                : 'bg-[#0B1020] border-[#1E293B] text-[#E6EAF5] hover:bg-[#182346]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-purple-400" />
            Compare with Earth / Other Planet
          </button>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#E6EAF5] bg-[#0B1020] hover:bg-[#182346] border border-[#1E293B] rounded-lg transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#8892B0]" />
          Score Custom Planet
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-sm text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-semibold">Lookup Error</div>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* "What-If" Interactive Parameter Playground */}
      {whatIfActive && (
        <div className="p-5 rounded-2xl bg-teal-950/20 border border-teal-800/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-white">
                "What-If" Live Simulation Sliders
              </h3>
            </div>
            <span className="text-xs text-teal-300 font-mono">
              Move sliders to watch the habitability score update live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-[#E6EAF5]">Planetary Radius</span>
                <span className="font-mono text-teal-300 font-bold">
                  {simParams.radius.toFixed(2)} R⊕
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.05"
                value={simParams.radius}
                onChange={(e) => handleSliderChange('radius', parseFloat(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] font-mono mt-1">
                <span>0.4 R⊕ (Sub-Earth)</span>
                <span>1.6 R⊕ (Rocky limit)</span>
                <span>3.0 R⊕ (Mini-Neptune)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-[#E6EAF5]">Orbital Distance</span>
                <span className="font-mono text-teal-300 font-bold">
                  {simParams.sma.toFixed(2)} AU
                </span>
              </div>
              <input
                type="range"
                min="0.02"
                max="2.5"
                step="0.02"
                value={simParams.sma}
                onChange={(e) => handleSliderChange('sma', parseFloat(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] font-mono mt-1">
                <span>0.02 AU (Hot)</span>
                <span>1.0 AU (Earth)</span>
                <span>2.5 AU (Frozen)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-[#E6EAF5]">Host Star Teff</span>
                <span className="font-mono text-teal-300 font-bold">
                  {simParams.teff} K
                </span>
              </div>
              <input
                type="range"
                min="2500"
                max="7200"
                step="50"
                value={simParams.teff}
                onChange={(e) => handleSliderChange('teff', parseInt(e.target.value, 10))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] font-mono mt-1">
                <span>2500 K (M-dwarf)</span>
                <span>5778 K (Sun)</span>
                <span>7200 K (F-star)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main 3-Card Display */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Card 1: Score Ring & Visual Sphere (4 cols) */}
            <div className="lg:col-span-4 bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <h2 className="text-base font-bold text-white">
                    {result.planet_name}
                  </h2>
                  <span className="text-xs font-mono text-[#8892B0]">
                    Host: {result.hostname}
                  </span>
                </div>

                <div className="pt-4 pb-2">
                  <ScoreGauge
                    score={result.score}
                    band={result.band}
                    scoreRange={result.score_range}
                    color={result.band_color}
                  />
                </div>

                <p className="text-xs text-[#E6EAF5] text-center leading-relaxed mt-2 px-1">
                  {result.band_description}
                </p>
              </div>

              {/* Proportional Physical Sphere vs Earth */}
              <div className="pt-3 border-t border-[#1E293B]">
                <PlanetSphereView
                  planetName={result.planet_name}
                  radiusRe={result.planet_parameters.radius_re}
                  eqTempK={result.planet_parameters.eq_temp_k}
                  isEarthLike={result.score >= 80}
                />
              </div>

              {/* Estimated fields note */}
              {result.estimated_fields.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800 text-amber-300 text-[11px]">
                  <div className="font-semibold flex items-center gap-1.5 mb-0.5">
                    <Info className="w-3.5 h-3.5" />
                    Estimated Physical Inputs:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-400">
                    {result.estimated_fields.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Card 2: "Why this score?" Breakdown & Habitable Zone Spectrum (5 cols) */}
            <div className="lg:col-span-5 bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <h3 className="text-base font-semibold text-white">
                    Why this score?
                  </h3>
                  <span className="text-xs font-mono text-[#8892B0]">
                    Component Physics
                  </span>
                </div>

                <div className="space-y-4 pt-3">
                  {result.why_breakdown.map((item) => (
                    <div key={item.factor}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-[#E6EAF5]">
                          {item.factor}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#8892B0] font-mono">
                            wt: {item.weight}%
                          </span>
                          <span className="font-mono font-bold text-white">
                            {item.score}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-[#0B1020] rounded-full overflow-hidden border border-[#1E293B]">
                        <div
                          style={{ width: `${item.score}%` }}
                          className="h-full bg-teal-400 rounded-full transition-all duration-500 ease-out"
                        />
                      </div>
                      <p className="text-[11px] text-[#8892B0] mt-1 leading-normal">
                        {item.commentary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Habitable Zone Position Spectrum */}
              <div className="pt-3 border-t border-[#1E293B]">
                <HabitableZoneDiagram
                  insolation={result.planet_parameters.insolation_flux}
                  planetName={result.planet_name}
                  zoneLabel={result.hz_position.label}
                />
              </div>
            </div>

            {/* Card 3: Compared with Earth (3 cols) */}
            <div className="lg:col-span-3 bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <h3 className="text-base font-semibold text-white">
                    Compared with Earth
                  </h3>
                  <Globe className="w-4 h-4 text-sky-400" />
                </div>

                <div className="divide-y divide-[#1E293B] pt-1">
                  {result.earth_comparison.map((comp) => (
                    <div key={comp.property} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-[#8892B0]">
                          {comp.property}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Earth: {comp.earth_value}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-white">
                          {comp.planet_value}
                        </div>
                        <div className={`text-[11px] font-mono font-semibold ${
                          comp.status === 'similar' ? 'text-teal-300' :
                          comp.status === 'extreme' ? 'text-rose-400' : 'text-[#8892B0]'
                        }`}>
                          {comp.ratio}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1E293B] text-[11px] text-[#8892B0] font-mono text-center">
                Baseline: Solar System / Earth at 1.0 AU
              </div>
            </div>
          </div>

          {/* Side-by-Side Planet Comparison Strip */}
          {compareActive && compareResult && (
            <div className="bg-[#121A33] p-6 rounded-2xl border border-purple-800/60 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-purple-400" />
                  <h3 className="text-base font-semibold text-white">
                    Dual Planet Comparison: {result.planet_name} vs. {compareResult.planet_name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8892B0] font-mono">Compare with:</span>
                  <select
                    value={compareTarget}
                    onChange={(e) => handleSelectComparePlanet(e.target.value)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-[#1E293B] bg-[#0B1020] text-white cursor-pointer"
                  >
                    {curatedExoplanets.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-[#8892B0] font-mono">
                      <th className="py-2.5 font-medium">Metric</th>
                      <th className="py-2.5 font-medium text-teal-300">{result.planet_name}</th>
                      <th className="py-2.5 font-medium text-purple-300">{compareResult.planet_name}</th>
                      <th className="py-2.5 font-medium">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B] font-mono">
                    <tr>
                      <td className="py-2.5 font-medium text-[#E6EAF5]">Habitability Score</td>
                      <td className="py-2.5 font-bold text-white">{result.score}/100 ({result.band})</td>
                      <td className="py-2.5 font-bold text-white">{compareResult.score}/100 ({compareResult.band})</td>
                      <td className="py-2.5 text-[#8892B0]">Δ {Math.abs(result.score - compareResult.score)} pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-[#E6EAF5]">Earth Similarity Index (ESI)</td>
                      <td className="py-2.5">{result.components.esi_global.toFixed(3)}</td>
                      <td className="py-2.5">{compareResult.components.esi_global.toFixed(3)}</td>
                      <td className="py-2.5 text-[#8892B0]">Δ {Math.abs(result.components.esi_global - compareResult.components.esi_global).toFixed(3)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-[#E6EAF5]">Planetary Radius</td>
                      <td className="py-2.5">{result.planet_parameters.radius_re.toFixed(2)} R⊕</td>
                      <td className="py-2.5">{compareResult.planet_parameters.radius_re.toFixed(2)} R⊕</td>
                      <td className="py-2.5 text-[#8892B0]">{((result.planet_parameters.radius_re / compareResult.planet_parameters.radius_re) * 100).toFixed(0)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-[#E6EAF5]">Equilibrium Temp</td>
                      <td className="py-2.5">{result.planet_parameters.eq_temp_k} K</td>
                      <td className="py-2.5">{compareResult.planet_parameters.eq_temp_k} K</td>
                      <td className="py-2.5 text-[#8892B0]">Δ {Math.abs(result.planet_parameters.eq_temp_k - compareResult.planet_parameters.eq_temp_k)} K</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-[#E6EAF5]">Insolation Flux</td>
                      <td className="py-2.5">{result.planet_parameters.insolation_flux.toFixed(2)} S⊕</td>
                      <td className="py-2.5">{compareResult.planet_parameters.insolation_flux.toFixed(2)} S⊕</td>
                      <td className="py-2.5 text-[#8892B0]">{result.hz_position.zone} vs {compareResult.hz_position.zone}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Planet Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#121A33] border border-[#1E293B] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h3 className="text-base font-semibold text-white">
                Score a Custom or Uncatalogued Exoplanet
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-[#8892B0] hover:text-white text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  const scored = await scoreManualHabitability(manualForm);
                  setResult(scored);
                  setSearchTerm(scored.planet_name);
                  setShowManualModal(false);
                } catch (err: any) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#E6EAF5] mb-1 block">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    value={manualForm.pl_name}
                    onChange={(e) => setManualForm({ ...manualForm, pl_name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#E6EAF5] mb-1 block">
                    Host Star Name
                  </label>
                  <input
                    type="text"
                    value={manualForm.hostname}
                    onChange={(e) => setManualForm({ ...manualForm, hostname: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#E6EAF5] mb-1 block">
                    Radius (R⊕)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualForm.pl_rade}
                    onChange={(e) => setManualForm({ ...manualForm, pl_rade: parseFloat(e.target.value) || 1.0 })}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#E6EAF5] mb-1 block">
                    Distance (AU)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualForm.pl_orbsmax}
                    onChange={(e) => setManualForm({ ...manualForm, pl_orbsmax: parseFloat(e.target.value) || 1.0 })}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#E6EAF5] mb-1 block">
                    Insolation (S⊕)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualForm.pl_insol}
                    onChange={(e) => setManualForm({ ...manualForm, pl_insol: parseFloat(e.target.value) || 1.0 })}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#E6EAF5] mb-1 block">
                    Star Temperature (K)
                  </label>
                  <input
                    type="number"
                    value={manualForm.st_teff}
                    onChange={(e) => setManualForm({ ...manualForm, st_teff: parseInt(e.target.value, 10) || 5778 })}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#E6EAF5] mb-1 block">
                    Spectral Type
                  </label>
                  <input
                    type="text"
                    value={manualForm.st_spectype}
                    onChange={(e) => setManualForm({ ...manualForm, st_spectype: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-[#1E293B] text-[#E6EAF5] hover:bg-[#182346] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 transition-colors cursor-pointer"
                >
                  Compute Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
