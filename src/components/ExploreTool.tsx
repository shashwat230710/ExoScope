import React, { useState, useEffect } from 'react';
import { ModelMetrics, PlanetRecord } from '../types.ts';
import { fetchModelInfo } from '../services/api.ts';
import { KNOWN_PLANETS } from '../data/planets.ts';
import { computeHabitability } from '../ml/habitability.ts';
import {
  ShieldCheck,
  Database,
  Award,
  ExternalLink,
  BookOpen,
  Search,
  ArrowUpDown,
  Sparkles,
  LayoutGrid,
  List,
  ScatterChart,
  HelpCircle,
  Orbit,
  Globe,
  Sliders,
  ChevronRight,
  Droplets,
  Flame,
  Snowflake,
  Info
} from 'lucide-react';

interface ExploreToolProps {
  onSelectPlanetForHabitability?: (planetName: string) => void;
  onSelectPlanetForClassifier?: (planet: PlanetRecord) => void;
}

export const ExploreTool: React.FC<ExploreToolProps> = ({
  onSelectPlanetForHabitability,
  onSelectPlanetForClassifier
}) => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'scatter' | 'model_card' | 'guide'>('cards');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogSort, setCatalogSort] = useState<'score' | 'dist' | 'radius' | 'year'>('score');

  useEffect(() => {
    fetchModelInfo().then(setMetrics);
  }, []);

  const scoredCatalog = KNOWN_PLANETS.map((p) => {
    const habitability = computeHabitability(p);
    return {
      ...p,
      score: habitability.score,
      band: habitability.band,
      bandColor: habitability.band_color,
      esi: habitability.components.esi_global,
      hz_label: habitability.hz_position.label
    };
  });

  // Archetype families for easy understanding
  const planetaryFamilies = [
    {
      id: 'all',
      title: 'All Exoplanets',
      icon: '🌌',
      count: scoredCatalog.length,
      desc: 'Complete curated NASA catalog'
    },
    {
      id: 'habitable',
      title: 'Habitable Zone Worlds',
      icon: '🌟',
      count: scoredCatalog.filter((p) => p.score >= 60 || p.esi >= 0.70).length,
      desc: 'Prime liquid water candidates'
    },
    {
      id: 'terrestrial',
      title: 'Rocky Earth Cousins',
      icon: '🌍',
      count: scoredCatalog.filter((p) => p.pl_rade <= 1.25).length,
      desc: '< 1.25 R⊕ solid rocky crust'
    },
    {
      id: 'superearth',
      title: 'Super-Earths',
      icon: '🌊',
      count: scoredCatalog.filter((p) => p.pl_rade > 1.25 && p.pl_rade <= 2.0).length,
      desc: '1.25 - 2.0 R⊕ ocean/dense rock'
    },
    {
      id: 'subneptune',
      title: 'Sub-Neptunes',
      icon: '🧊',
      count: scoredCatalog.filter((p) => p.pl_rade > 2.0 && p.pl_rade <= 4.0).length,
      desc: '2.0 - 4.0 R⊕ gas envelope'
    },
    {
      id: 'gasgiant',
      title: 'Gas Giants & Jovians',
      icon: '🪐',
      count: scoredCatalog.filter((p) => p.pl_rade > 4.0).length,
      desc: '> 4.0 R⊕ massive Jovian worlds'
    }
  ];

  // Filter planets
  const filteredCatalog = scoredCatalog
    .filter((p) => {
      // Family filter
      if (selectedFamily === 'habitable' && !(p.score >= 60 || p.esi >= 0.70)) return false;
      if (selectedFamily === 'terrestrial' && p.pl_rade > 1.25) return false;
      if (selectedFamily === 'superearth' && (p.pl_rade <= 1.25 || p.pl_rade > 2.0)) return false;
      if (selectedFamily === 'subneptune' && (p.pl_rade <= 2.0 || p.pl_rade > 4.0)) return false;
      if (selectedFamily === 'gasgiant' && p.pl_rade <= 4.0) return false;

      // Text search
      const q = catalogSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        p.pl_name.toLowerCase().includes(q) ||
        p.hostname.toLowerCase().includes(q) ||
        (p.habitability_label || '').toLowerCase().includes(q) ||
        (p.disc_facility || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (catalogSort === 'score') return b.score - a.score;
      if (catalogSort === 'dist') return (a.sy_dist || 9999) - (b.sy_dist || 9999);
      if (catalogSort === 'radius') return b.pl_rade - a.pl_rade;
      if (catalogSort === 'year') return b.disc_year - a.disc_year;
      return 0;
    });

  const getPlanetThumbnailStyle = (planet: typeof scoredCatalog[0]) => {
    if (planet.pl_rade > 4.0) {
      return 'bg-gradient-to-tr from-amber-800 via-amber-600 to-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]';
    }
    if (planet.pl_rade > 2.0) {
      return 'bg-gradient-to-tr from-cyan-900 via-teal-600 to-cyan-300 shadow-[0_0_15px_rgba(45,212,191,0.4)]';
    }
    if (planet.pl_eqt > 450) {
      return 'bg-gradient-to-tr from-rose-900 via-red-600 to-orange-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]';
    }
    if (planet.pl_eqt < 200) {
      return 'bg-gradient-to-tr from-slate-900 via-blue-600 to-sky-200 shadow-[0_0_15px_rgba(186,230,253,0.4)]';
    }
    return 'bg-gradient-to-tr from-blue-900 via-emerald-600 to-teal-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]';
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-teal-950/70 text-teal-300 border border-teal-800/60 shadow-[0_0_10px_rgba(45,212,191,0.2)]">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              NASA EXOPLANET ARCHIVE EXPLORER
            </span>
            <span className="text-xs font-mono text-[#8892B0]">PSCompPars Snapshot</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Exoplanet Discovery Catalog
          </h1>
          <p className="text-sm text-[#8892B0] max-w-2xl mt-1 leading-relaxed">
            Browse discovered worlds by visual planetary archetype, examine candidate signals, and inspect machine learning model verification metrics.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#121A33] rounded-xl text-xs font-medium border border-[#1E293B]">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'cards'
                ? 'bg-[#182346] text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Visual Cards</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-[#182346] text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Data Table</span>
          </button>

          <button
            onClick={() => setViewMode('scatter')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'scatter'
                ? 'bg-[#182346] text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            <ScatterChart className="w-3.5 h-3.5" />
            <span>Size vs Orbit Sandbox</span>
          </button>

          <button
            onClick={() => setViewMode('guide')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'guide'
                ? 'bg-[#182346] text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Exoplanet 101</span>
          </button>

          <button
            onClick={() => setViewMode('model_card')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'model_card'
                ? 'bg-[#182346] text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Model Card</span>
          </button>
        </div>
      </div>

      {/* Planetary Archetype Families Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#8892B0]">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-teal-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Explore by Planetary Family (Archetype)
          </span>
          <span>Click archetype to filter</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {planetaryFamilies.map((fam) => {
            const isSelected = selectedFamily === fam.id;
            return (
              <button
                key={fam.id}
                onClick={() => setSelectedFamily(fam.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-95 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-teal-950/70 border-teal-500/50 text-teal-300 ring-1 ring-teal-400/30 shadow-[0_0_15px_rgba(45,212,191,0.25)]'
                    : 'bg-[#121A33]/80 border-[#1E293B] hover:border-teal-500/40 text-slate-300 hover:bg-[#182346]'
                }`}
              >
                <div className="text-xl mb-1">{fam.icon}</div>
                <div className="font-bold text-xs text-white truncate group-hover:text-teal-300 transition-colors">
                  {fam.title}
                </div>
                <div className="text-[10px] text-[#8892B0] truncate mt-0.5">{fam.desc}</div>
                <div className="mt-2 text-[10px] font-mono font-semibold text-teal-400">
                  {fam.count} {fam.count === 1 ? 'planet' : 'planets'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      {(viewMode === 'cards' || viewMode === 'table') && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#121A33]/80 border border-[#1E293B]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8892B0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Search planet name, star, or discovery facility..."
              className="w-full bg-[#0B1020] border border-[#1E293B] focus:border-teal-400 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#8892B0] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8892B0] font-mono shrink-0">Sort by:</span>
            <select
              value={catalogSort}
              onChange={(e) => setCatalogSort(e.target.value as any)}
              className="bg-[#0B1020] border border-[#1E293B] text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="score">Habitability Score (High to Low)</option>
              <option value="dist">Distance (Closest First)</option>
              <option value="radius">Planet Size (Largest First)</option>
              <option value="year">Discovery Year (Newest First)</option>
            </select>
          </div>
        </div>
      )}

      {/* VIEW 1: Visual Discovery Cards Grid (Easiest to Understand) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCatalog.map((planet) => (
            <div
              key={planet.pl_name}
              className="p-5 rounded-2xl bg-[#121A33]/90 border border-[#1E293B] hover:border-teal-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between group hover:shadow-[0_0_20px_rgba(45,212,191,0.1)]"
            >
              <div>
                {/* Top bar with sphere thumbnail & badges */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center gap-3">
                    {/* Rendered miniature sphere */}
                    <div
                      className={`w-12 h-12 rounded-full relative overflow-hidden shrink-0 ${getPlanetThumbnailStyle(planet)} ring-1 ring-white/20`}
                    >
                      <div className="absolute inset-0 bg-radial from-transparent to-black/50" />
                      <div className="absolute top-1 left-2 w-3 h-2 rounded-full bg-white/30 blur-[0.5px]" />
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-teal-300 transition-colors">
                        {planet.pl_name}
                      </h3>
                      <div className="text-[11px] font-mono text-[#8892B0]">
                        Host Star: <span className="text-slate-300">{planet.hostname}</span> ({planet.st_spectype || 'Dwarf'})
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 border ${
                    planet.band === 'Earth-like potential'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : planet.band === 'Promising'
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      : planet.band === 'Marginal'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {planet.band}
                  </span>
                </div>

                {/* Plain-English narrative description */}
                <p className="mt-3 text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {planet.description || 'Discovered via planetary transit observations.'}
                </p>

                {/* 4 Key Physical Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-[#0B1020] border border-[#1E293B]">
                    <div className="text-[10px] text-[#8892B0] uppercase">Radius</div>
                    <div className="font-bold text-teal-300 mt-0.5">
                      {planet.pl_rade.toFixed(2)} R⊕ ({planet.pl_rade.toFixed(1)}x Earth)
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#0B1020] border border-[#1E293B]">
                    <div className="text-[10px] text-[#8892B0] uppercase">Distance</div>
                    <div className="font-bold text-white mt-0.5">
                      {planet.sy_dist ? `${planet.sy_dist.toFixed(1)} ly` : 'Nearby'}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#0B1020] border border-[#1E293B]">
                    <div className="text-[10px] text-[#8892B0] uppercase">Equilibrium Temp</div>
                    <div className="font-bold text-amber-300 mt-0.5">
                      {planet.pl_eqt} K ({Math.round(planet.pl_eqt - 273.15)}°C)
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#0B1020] border border-[#1E293B]">
                    <div className="text-[10px] text-[#8892B0] uppercase">Global ESI</div>
                    <div className="font-bold text-emerald-300 mt-0.5">
                      {(planet.esi * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons to cross-link seamlessly into Habitability & Classifier */}
              <div className="mt-5 pt-3 border-t border-[#1E293B] flex items-center justify-between gap-2">
                {onSelectPlanetForHabitability && (
                  <button
                    onClick={() => onSelectPlanetForHabitability(planet.pl_name)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                  >
                    <span>Check Habitability</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {onSelectPlanetForClassifier && (
                  <button
                    onClick={() => onSelectPlanetForClassifier(planet)}
                    className="py-1.5 px-3 rounded-lg bg-[#182346] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#1E293B] text-xs font-medium transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    title="Simulate Transit in Classifier"
                  >
                    <Orbit className="w-3.5 h-3.5 text-teal-400" />
                    <span>Transit</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: Data Table View with Tooltips */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-[#121A33]/90 border border-[#1E293B] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#0B1020] border-b border-[#1E293B] text-[11px] font-mono uppercase text-[#8892B0]">
                  <th className="py-3 px-4">Planet Name</th>
                  <th className="py-3 px-4">Host Star</th>
                  <th className="py-3 px-4">Radius (R⊕)</th>
                  <th className="py-3 px-4">Period (days)</th>
                  <th className="py-3 px-4">Insolation (S⊕)</th>
                  <th className="py-3 px-4">Equilibrium Temp</th>
                  <th className="py-3 px-4">Distance (ly)</th>
                  <th className="py-3 px-4">ESI</th>
                  <th className="py-3 px-4">Habitability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 font-mono">
                {filteredCatalog.map((p) => (
                  <tr key={p.pl_name} className="hover:bg-[#182346]/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-white">
                      {p.pl_name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {p.hostname}
                    </td>
                    <td className="py-3 px-4 text-teal-300 font-bold">
                      {p.pl_rade.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {p.pl_orbper.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {p.pl_insol.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-amber-300">
                      {p.pl_eqt} K
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {p.sy_dist ? `${p.sy_dist.toFixed(1)} ly` : '-'}
                    </td>
                    <td className="py-3 px-4 text-emerald-300 font-bold">
                      {(p.esi * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.band === 'Earth-like potential'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : p.band === 'Promising'
                          ? 'bg-teal-950 text-teal-300 border border-teal-800'
                          : p.band === 'Marginal'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {p.band}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {onSelectPlanetForHabitability && (
                        <button
                          onClick={() => onSelectPlanetForHabitability(p.pl_name)}
                          className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-sans font-semibold cursor-pointer transition-colors"
                        >
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Interactive Size vs Orbital Distance Sandbox */}
      {viewMode === 'scatter' && (
        <div className="p-6 rounded-2xl bg-[#121A33]/90 border border-[#1E293B] shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <ScatterChart className="w-5 h-5 text-teal-400" />
                Exoplanet Demographics: Planetary Size vs. Orbital Period
              </h3>
              <p className="text-xs text-[#8892B0]">
                Interactive distribution of planetary sizes across orbital architectures. Click any landmark to inspect.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Habitable Candidates
              </span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                Sub-Neptunes
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                Gas Giants
              </span>
            </div>
          </div>

          {/* Scatter Chart Visual Grid */}
          <div className="relative h-96 bg-[#070B16] rounded-xl border border-[#1E293B] p-6 overflow-hidden">
            {/* Background classification zones */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20 text-[11px] font-mono text-[#8892B0]">
              <div className="border-b border-dashed border-amber-400 pb-1">Jovian Gas Giant Zone (&gt; 4 R⊕)</div>
              <div className="border-b border-dashed border-cyan-400 pb-1">Sub-Neptune / Ocean World Zone (1.75 - 4 R⊕)</div>
              <div>Rocky Terrestrial Zone (&lt; 1.75 R⊕)</div>
            </div>

            {/* Plotted planet markers */}
            {scoredCatalog.map((p) => {
              // Log scaling for period (0.5 to 1000 days -> 5% to 92% width)
              const minLogP = Math.log10(0.5);
              const maxLogP = Math.log10(1200);
              const logP = Math.log10(Math.max(0.5, p.pl_orbper));
              const leftPct = 8 + ((logP - minLogP) / (maxLogP - minLogP)) * 84;

              // Linear scaling for radius (0.5 to 15 R⊕ -> 90% to 10% height)
              const topPct = 90 - (Math.min(15, p.pl_rade) / 15) * 80;

              const isHabitable = p.score >= 60 || p.esi >= 0.70;
              const markerColor = isHabitable
                ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] ring-2 ring-emerald-200'
                : p.pl_rade > 4.0
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                : 'bg-cyan-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]';

              return (
                <div
                  key={p.pl_name}
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                  onClick={() => onSelectPlanetForHabitability && onSelectPlanetForHabitability(p.pl_name)}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${markerColor} transition-transform group-hover:scale-175`} />

                  {/* Hover tooltip card */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2.5 rounded-xl bg-[#0D152B] border border-teal-500/50 shadow-2xl z-50 text-xs pointer-events-none">
                    <div className="font-bold text-white">{p.pl_name}</div>
                    <div className="text-[10px] text-[#8892B0] font-mono">
                      Radius: {p.pl_rade.toFixed(2)} R⊕ | Period: {p.pl_orbper.toFixed(1)}d
                    </div>
                    <div className="text-[10px] text-teal-300 font-mono mt-0.5">
                      ESI: {(p.esi * 100).toFixed(0)}% | {p.band}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Axis labels */}
            <div className="absolute bottom-2 left-6 right-6 flex justify-between text-[10px] font-mono text-[#8892B0]">
              <span>0.5 days</span>
              <span>10 days</span>
              <span>365 days (Earth Orbit)</span>
              <span>1,000+ days</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Exoplanet 101 Educational Guide */}
      {viewMode === 'guide' && (
        <div className="p-6 rounded-2xl bg-[#121A33]/90 border border-[#1E293B] shadow-2xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1E293B]">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Exoplanet 101: Understanding the Science
              </h3>
              <p className="text-xs text-[#8892B0]">
                Fundamental astrophysics terms made simple and accessible
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] space-y-2">
              <h4 className="font-bold text-teal-300 text-sm flex items-center gap-2">
                <span>🪐</span> What is an Exoplanet?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                An <strong>exoplanet</strong> (extrasolar planet) is any planet that orbits a star other than our Sun.
                Before 1992, we didn't know if other solar systems existed. Today, NASA has confirmed over 5,500 exoplanets!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] space-y-2">
              <h4 className="font-bold text-teal-300 text-sm flex items-center gap-2">
                <span>🌑</span> How Does the Transit Method Work?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                When a planet passes directly between its host star and our telescope, it blocks a tiny fraction of starlight.
                By measuring this periodic dip (in parts per million, or ppm), we calculate the planet's diameter and orbital year.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] space-y-2">
              <h4 className="font-bold text-teal-300 text-sm flex items-center gap-2">
                <span>💧</span> What is the Habitable Zone (Goldilocks)?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                The orbital band around a star where temperatures are "just right"—neither too hot that water boils away into runaway steam,
                nor too cold that it freezes into eternal ice. Liquid water is essential for life as we know it.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] space-y-2">
              <h4 className="font-bold text-teal-300 text-sm flex items-center gap-2">
                <span>📏</span> What is the Earth Similarity Index (ESI)?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                A mathematical metric from 0 to 1 (0% to 100%) that measures how closely an exoplanet's physical parameters
                (radius, density, escape velocity, and surface temperature) resemble Earth (Earth = 1.00).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: Model Card & Verification Metrics */}
      {viewMode === 'model_card' && metrics && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#121A33] p-5 rounded-xl border border-[#1E293B]">
              <div className="text-xs font-mono uppercase text-[#8892B0]">ROC-AUC Metric</div>
              <div className="text-2xl font-bold font-mono text-teal-400 mt-1">{metrics.roc_auc.toFixed(3)}</div>
              <div className="text-[11px] text-[#8892B0] mt-0.5">Discriminative Power</div>
            </div>

            <div className="bg-[#121A33] p-5 rounded-xl border border-[#1E293B]">
              <div className="text-xs font-mono uppercase text-[#8892B0]">Accuracy</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{(metrics.accuracy * 100).toFixed(1)}%</div>
              <div className="text-[11px] text-[#8892B0] mt-0.5">Kepler Held-out Test Set</div>
            </div>

            <div className="bg-[#121A33] p-5 rounded-xl border border-[#1E293B]">
              <div className="text-xs font-mono uppercase text-[#8892B0]">F1 Score</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{metrics.f1_score.toFixed(3)}</div>
              <div className="text-[11px] text-[#8892B0] mt-0.5">Harmonic Precision/Recall</div>
            </div>

            <div className="bg-[#121A33] p-5 rounded-xl border border-[#1E293B]">
              <div className="text-xs font-mono uppercase text-[#8892B0]">Confirmed Planets</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{metrics.dataset_stats.total_confirmed_exoplanets.toLocaleString()}</div>
              <div className="text-[11px] text-[#8892B0] mt-0.5">NASA Archive Snapshot</div>
            </div>
          </div>

          {/* Model Card Specifications */}
          <div className="p-6 rounded-2xl bg-[#121A33]/90 border border-[#1E293B] shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              Machine Learning Scientific Model Card
            </h3>
            <p className="text-slate-300 leading-relaxed">
              <strong>Architecture:</strong> Calibrated gradient-boosted decision trees trained on 9,564 Kepler Objects of Interest (KOI),
              using cross-validated isotonic probability scaling and TreeSHAP attribution for explainable transit verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
