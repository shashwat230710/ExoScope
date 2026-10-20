import React, { useState, useEffect } from 'react';
import { ClassifierInput, ClassifierResult, HeldOutSample } from '../types.ts';
import { classifyTransit, fetchSamples } from '../services/api.ts';
import { ProbabilityGauge } from './ProbabilityGauge.tsx';
import { TransitLightCurve } from './TransitLightCurve.tsx';
import { TransitOrrery } from './TransitOrrery.tsx';
import { VerificationMatrix } from './VerificationMatrix.tsx';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Sliders,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Scale,
  Orbit,
  Activity,
  Compass,
  Link2,
  Unlink,
  Flame,
  Info
} from 'lucide-react';

interface ClassifyToolProps {
  initialInput?: Partial<ClassifierInput>;
  onNavigateToHabitability?: (planetName: string) => void;
}

export const ClassifyTool: React.FC<ClassifyToolProps> = ({ initialInput, onNavigateToHabitability }) => {
  const [formData, setFormData] = useState<ClassifierInput>({
    mission: initialInput?.mission || 'kepler',
    orbital_period: initialInput?.orbital_period || 9.48,
    transit_duration_hr: initialInput?.transit_duration_hr || 2.90,
    transit_depth_ppm: initialInput?.transit_depth_ppm || 615,
    impact_parameter: initialInput?.impact_parameter !== undefined ? initialInput.impact_parameter : 0.15,
    planet_radius_re: initialInput?.planet_radius_re || 2.26,
    equilibrium_temp_k: initialInput?.equilibrium_temp_k || 793,
    snr: initialInput?.snr || 35.8,
    star_teff_k: initialInput?.star_teff_k || 5455,
    star_radius_rsun: initialInput?.star_radius_rsun || 0.93,
    star_logg: initialInput?.star_logg || 4.47,
    insolation_flux: initialInput?.insolation_flux || 75.3
  });

  const [physicsCoupled, setPhysicsCoupled] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>('sub_neptune');
  const [decisionThreshold, setDecisionThreshold] = useState<number>(0.50);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ClassifierResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'simulation' | 'lightcurve'>('simulation');

  // Interactive Live Presets
  const curatedScenarios = [
    {
      id: 'earth_twin',
      title: 'Earth Twin Candidate',
      subtitle: '1.05 R⊕ rocky world, 1-yr orbit',
      outcome: 'CONFIRMED',
      badgeColor: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      data: {
        mission: 'kepler' as const,
        orbital_period: 365.2,
        transit_duration_hr: 12.8,
        transit_depth_ppm: 84,
        impact_parameter: 0.20,
        planet_radius_re: 1.05,
        equilibrium_temp_k: 255,
        snr: 28.5,
        star_teff_k: 5778,
        star_radius_rsun: 1.00,
        star_logg: 4.44,
        insolation_flux: 1.0
      }
    },
    {
      id: 'sub_neptune',
      title: 'Sub-Neptune (Benchmark)',
      subtitle: 'Clear box transit, SNR 35.8σ',
      outcome: 'CONFIRMED',
      badgeColor: 'border-teal-500/50 text-teal-300 bg-teal-950/60 shadow-[0_0_12px_rgba(45,212,191,0.3)]',
      data: {
        mission: 'kepler' as const,
        orbital_period: 9.48,
        transit_duration_hr: 2.90,
        transit_depth_ppm: 615,
        impact_parameter: 0.15,
        planet_radius_re: 2.26,
        equilibrium_temp_k: 793,
        snr: 35.8,
        star_teff_k: 5455,
        star_radius_rsun: 0.93,
        star_logg: 4.47,
        insolation_flux: 75.3
      }
    },
    {
      id: 'hot_jupiter',
      title: 'Hot Jovian Gas Giant',
      subtitle: '11.2 R⊕ massive dip, 3.2-day orbit',
      outcome: 'CONFIRMED',
      badgeColor: 'border-amber-500/50 text-amber-300 bg-amber-950/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      data: {
        mission: 'kepler' as const,
        orbital_period: 3.25,
        transit_duration_hr: 2.80,
        transit_depth_ppm: 10800,
        impact_parameter: 0.25,
        planet_radius_re: 11.2,
        equilibrium_temp_k: 1350,
        snr: 92.0,
        star_teff_k: 5850,
        star_radius_rsun: 1.05,
        star_logg: 4.40,
        insolation_flux: 540
      }
    },
    {
      id: 'grazing_binary',
      title: 'Grazing Binary (False Alarm)',
      subtitle: 'Impact param b = 1.25 (grazing)',
      outcome: 'FALSE POSITIVE',
      badgeColor: 'border-rose-500/50 text-rose-300 bg-rose-950/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
      data: {
        mission: 'kepler' as const,
        orbital_period: 15.42,
        transit_duration_hr: 1.15,
        transit_depth_ppm: 4200,
        impact_parameter: 1.25,
        planet_radius_re: 6.8,
        equilibrium_temp_k: 580,
        snr: 28.5,
        star_teff_k: 6150,
        star_radius_rsun: 1.28,
        star_logg: 4.22,
        insolation_flux: 19.4
      }
    },
    {
      id: 'eclipsing_binary',
      title: 'Eclipsing Binary Star',
      subtitle: 'Massive depth 34,500 ppm, 18 R⊕',
      outcome: 'FALSE POSITIVE',
      badgeColor: 'border-rose-500/50 text-rose-300 bg-rose-950/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
      data: {
        mission: 'kepler' as const,
        orbital_period: 3.12,
        transit_duration_hr: 3.84,
        transit_depth_ppm: 34500,
        impact_parameter: 0.88,
        planet_radius_re: 18.4,
        equilibrium_temp_k: 1420,
        snr: 145.0,
        star_teff_k: 5890,
        star_radius_rsun: 1.02,
        star_logg: 4.42,
        insolation_flux: 680
      }
    },
    {
      id: 'noise_artefact',
      title: 'Instrumental Noise',
      subtitle: 'Marginal SNR (6.2σ < 7.1σ limit)',
      outcome: 'FALSE POSITIVE',
      badgeColor: 'border-amber-500/50 text-amber-300 bg-amber-950/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      data: {
        mission: 'kepler' as const,
        orbital_period: 382.1,
        transit_duration_hr: 14.2,
        transit_depth_ppm: 85,
        impact_parameter: 0.65,
        planet_radius_re: 0.98,
        equilibrium_temp_k: 245,
        snr: 6.2,
        star_teff_k: 5740,
        star_radius_rsun: 1.01,
        star_logg: 4.44,
        insolation_flux: 0.95
      }
    }
  ];

  // Run initial classification
  useEffect(() => {
    handleClassify(formData);
  }, []);

  const handleClassify = async (data: ClassifierInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await classifyTransit(data);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to classify transit data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ClassifierInput, value: any) => {
    let updated = { ...formData, [field]: value };

    // Live Astrophysics Auto-Coupling (when active)
    if (physicsCoupled) {
      const sRad = updated.star_radius_rsun || 1.0;
      const sTeff = updated.star_teff_k || 5778;
      const period = updated.orbital_period || 10;
      const b = updated.impact_parameter ?? 0.2;

      // 1. If planet radius changed: auto-update geometric transit depth (R_p / R_*)^2
      if (field === 'planet_radius_re') {
        const radiusRatio = (value * 0.009167) / sRad; // Earth radius / Solar radius
        updated.transit_depth_ppm = Math.max(20, Math.min(60000, Math.round(Math.pow(radiusRatio, 2) * 1e6)));
      }

      // 2. If star radius changed: auto-recalculate transit depth
      if (field === 'star_radius_rsun') {
        const radiusRatio = (updated.planet_radius_re * 0.009167) / Math.max(0.1, value);
        updated.transit_depth_ppm = Math.max(20, Math.min(60000, Math.round(Math.pow(radiusRatio, 2) * 1e6)));
      }

      // 3. If orbital period, star radius, or impact parameter changed: auto-update transit duration
      if (field === 'orbital_period' || field === 'impact_parameter' || field === 'star_radius_rsun') {
        const chord = Math.sqrt(Math.max(0.01, 1 - Math.pow(Math.min(0.99, b), 2)));
        const expectedDur = 3.0 * Math.pow(Math.max(0.5, period), 0.33) * sRad * chord;
        updated.transit_duration_hr = Math.round(Math.max(0.5, Math.min(36, expectedDur)) * 10) / 10;
      }

      // 4. Update equilibrium temperature based on period & star teff
      if (field === 'orbital_period' || field === 'star_teff_k' || field === 'star_radius_rsun') {
        const smaAu = Math.pow(period / 365.25, 2 / 3);
        const starLum = Math.pow(sRad, 2) * Math.pow(sTeff / 5778, 4);
        const insol = starLum / Math.pow(Math.max(0.01, smaAu), 2);
        updated.insolation_flux = Math.round(insol * 10) / 10;
        updated.equilibrium_temp_k = Math.round(255 * Math.pow(Math.max(0.01, insol), 0.25));
      }
    }

    setFormData(updated);
    setActivePreset('custom');
    handleClassify(updated);
  };

  const handleSelectScenario = (scenario: typeof curatedScenarios[0]) => {
    setActivePreset(scenario.id);
    setFormData(scenario.data);
    handleClassify(scenario.data);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `[ExoScope Astrophysical Classification & Vetting Report]
Candidate Verdict: ${result.label} (${(result.probability * 100).toFixed(1)}% confidence vs ${decisionThreshold * 100}% threshold)
Robovetter Disposition: ${result.verification_suite.vetting_disposition} (Reliability Score: ${result.verification_suite.overall_vetting_score}/100)
AI Consensus: ${result.verification_suite.consensus.agreement}
Summary: ${result.astrophysical_summary}

Physical Parameters:
- Orbital Period: ${formData.orbital_period} days
- Planet Radius: ${formData.planet_radius_re} R⊕
- Transit Depth: ${formData.transit_depth_ppm} ppm
- Impact Parameter (b): ${formData.impact_parameter}
- Transit Duration: ${formData.transit_duration_hr} hr
- Model SNR: ${formData.snr}σ
- Host Star Teff: ${formData.star_teff_k} K (Radius: ${formData.star_radius_rsun} R☉)

Vetting Diagnostics:
${result.verification_suite.tests.map(t => `- ${t.name}: [${t.status}] ${t.metricValue} (${t.summary})`).join('\n')}

Generated via ExoScope AI Observatory (Kepler/TESS Calibrated Models)`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Determine current verdict relative to user-adjusted threshold
  const isConfirmedByThreshold = result ? result.probability >= decisionThreshold : false;

  // Physical descriptor helpers for live badges
  const getRadiusDescriptor = (re: number) => {
    if (re < 1.25) return 'Rocky Terrestrial (Earth-like)';
    if (re < 2.0) return 'Super-Earth / Water World';
    if (re < 4.0) return 'Sub-Neptune / Mini-Gas Giant';
    if (re <= 15.0) return 'Jovian Gas Giant';
    return 'Stellar / Brown Dwarf Alert (>16 R⊕)';
  };

  const getDepthDescriptor = (ppm: number) => {
    const pct = (ppm / 10000).toFixed(3);
    if (ppm < 150) return `Faint terrestrial dip (${pct}%)`;
    if (ppm < 2000) return `Sub-Neptune dip (${pct}%)`;
    if (ppm < 15000) return `Jovian planet dip (${pct}%)`;
    return `Stellar binary eclipse dip (${pct}%)`;
  };

  const getImpactDescriptor = (b: number) => {
    if (b <= 0.3) return 'Central transit chord';
    if (b <= 0.8) return 'Mid-latitude chord';
    if (b <= 1.0) return 'Near-limb transit';
    return 'Grazing eclipse alert (b > 1.0)';
  };

  const getSnrDescriptor = (s: number) => {
    if (s < 7.1) return 'Below Kepler detection limit (< 7.1σ)';
    if (s < 20) return 'Moderate photometric detection';
    if (s < 80) return 'High confidence signal (> 20σ)';
    return 'Ultra-strong signal (Check for binary)';
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-teal-950/70 text-teal-300 border border-teal-800/60 shadow-[0_0_10px_rgba(45,212,191,0.2)]">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              NASA KEPLER & TESS TRANSIT CLASSIFIER
            </span>
            <span className="text-xs font-mono text-[#8892B0]">Vetting & ML Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Exoplanet Transit Diagnostic Studio
          </h1>
          <p className="text-sm text-[#8892B0] max-w-2xl mt-1 leading-relaxed">
            Feed light-curve dips and stellar characteristics into calibrated machine learning models and NASA Robovetter verification techniques to confirm bona fide exoplanet candidates.
          </p>
        </div>

        {/* Quick actions: Export Brief */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="px-3.5 py-2 rounded-xl bg-[#121A33] hover:bg-[#182346] border border-[#1E293B] text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
            <span>{copiedReport ? 'Report Copied!' : 'Export Diagnostic Brief'}</span>
          </button>
        </div>
      </div>

      {/* Preset Archetype Scenario Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#8892B0]">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-teal-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Test Scenarios (Archival Benchmarks)
          </span>
          <span>Click to load candidate parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {curatedScenarios.map((sc) => {
            const isSelected = activePreset === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group active:scale-98 ${
                  isSelected
                    ? `${sc.badgeColor} ring-1 ring-white/20`
                    : 'bg-[#121A33]/80 border-[#1E293B] hover:border-teal-500/40 text-slate-300 hover:bg-[#182346]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-semibold text-xs text-white truncate group-hover:text-teal-300 transition-colors">
                    {sc.title}
                  </span>
                </div>
                <div className="text-[11px] text-[#8892B0] truncate leading-tight">
                  {sc.subtitle}
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                  <span className={sc.outcome === 'CONFIRMED' ? 'text-teal-400 font-bold' : 'text-rose-400 font-bold'}>
                    {sc.outcome}
                  </span>
                  <span className="text-[#8892B0] group-hover:text-white transition-colors">Load &rarr;</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Core Diagnostic Section: Verdict & Visualizers */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Executive Verdict Banner & Diagnostic Pillars */}
          <div className="lg:col-span-5 space-y-5">
            {/* Executive Verdict Board */}
            <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-2xl relative overflow-hidden ${
              isConfirmedByThreshold
                ? 'bg-gradient-to-b from-[#0D2429] via-[#0B1728] to-[#070D18] border-teal-500/40 shadow-[0_0_30px_rgba(45,212,191,0.15)]'
                : 'bg-gradient-to-b from-[#290D18] via-[#1B0B14] to-[#0D070B] border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
            }`}>
              {/* Atmospheric background glow */}
              <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
                isConfirmedByThreshold ? 'bg-teal-500/10' : 'bg-rose-500/10'
              }`} />

              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8892B0]">
                  AI Classification Verdict
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                  isConfirmedByThreshold
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {result.confidence_level} Confidence
                </span>
              </div>

              {/* Status Header */}
              <div className="mt-4 flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${
                  isConfirmedByThreshold
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}>
                  {isConfirmedByThreshold ? <ShieldCheck className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                </div>

                <div>
                  <div className={`text-xl font-extrabold tracking-tight ${
                    isConfirmedByThreshold ? 'text-teal-300' : 'text-rose-400'
                  }`}>
                    {isConfirmedByThreshold ? 'CONFIRMED EXOPLANET' : 'FALSE POSITIVE / ALARM'}
                  </div>
                  <div className="text-xs text-[#8892B0] font-mono mt-0.5">
                    Model Probability: <strong className="text-white">{(result.probability * 100).toFixed(1)}%</strong> (Threshold: {(decisionThreshold * 100).toFixed(0)}%)
                  </div>
                </div>
              </div>

              {/* Narrative Summary */}
              <p className="mt-4 text-xs text-slate-200 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                {result.astrophysical_summary}
              </p>

              {/* Adjustable Decision Threshold Control */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#8892B0] font-mono">
                  <span>Decision Threshold Tuning</span>
                  <span className="text-teal-300 font-bold">{(decisionThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={decisionThreshold}
                  onChange={(e) => setDecisionThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-[9px] text-[#8892B0] font-mono">
                  <span>0.10 (Optimistic Recall)</span>
                  <span>0.50 (Standard)</span>
                  <span>0.90 (Conservative Precision)</span>
                </div>
              </div>
            </div>

            {/* Jump to Habitability Button if candidate looks like a confirmed planet */}
            {isConfirmedByThreshold && (
              <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-800/60 flex items-center justify-between gap-3 shadow-lg">
                <div>
                  <div className="text-xs font-bold text-teal-300">
                    Planet Signal Validated!
                  </div>
                  <div className="text-[11px] text-[#8892B0] mt-0.5">
                    Evaluate surface habitability, liquid water, and Earth Similarity (ESI).
                  </div>
                </div>
                {onNavigateToHabitability && (
                  <button
                    onClick={() => onNavigateToHabitability('Kepler-452 b')}
                    className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shrink-0 shadow-md active:scale-95 flex items-center gap-1"
                  >
                    <span>Check Habitability</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column (7 cols): Live Space Orrery / Light Curve */}
          <div className="lg:col-span-7 space-y-5">
            {/* Switchable View: Live Space Orrery vs Photometric Light Curve */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1 bg-[#121A33] p-1 rounded-xl border border-[#1E293B] text-xs font-medium">
                  <button
                    onClick={() => setActiveViewTab('simulation')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeViewTab === 'simulation'
                        ? 'bg-[#182346] text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                        : 'text-[#8892B0] hover:text-white'
                    }`}
                  >
                    <Orbit className="w-3.5 h-3.5" />
                    <span>Live Transit Orrery</span>
                  </button>
                  <button
                    onClick={() => setActiveViewTab('lightcurve')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeViewTab === 'lightcurve'
                        ? 'bg-[#182346] text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                        : 'text-[#8892B0] hover:text-white'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Photometric Light Curve</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono text-[#8892B0] hidden sm:inline">
                  P = {formData.orbital_period}d | Depth = {formData.transit_depth_ppm.toLocaleString()} ppm
                </span>
              </div>

              {activeViewTab === 'simulation' ? (
                <TransitOrrery
                  orbitalPeriodDays={formData.orbital_period}
                  transitDurationHr={formData.transit_duration_hr}
                  planetRadiusRe={formData.planet_radius_re}
                  starRadiusRsun={formData.star_radius_rsun}
                  impactParameter={formData.impact_parameter}
                  transitDepthPpm={formData.transit_depth_ppm}
                  isConfirmed={isConfirmedByThreshold}
                />
              ) : (
                <div className="rounded-xl overflow-hidden border border-[#1E293B] bg-[#0B1020]">
                  <TransitLightCurve
                    depthPpm={formData.transit_depth_ppm}
                    durationHr={formData.transit_duration_hr}
                    periodDays={formData.orbital_period}
                    radiusRe={formData.planet_radius_re}
                    starRadiusRsun={formData.star_radius_rsun}
                    snr={formData.snr}
                    isConfirmed={isConfirmedByThreshold}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW & ELEVATED: Multi-Technique Verification Suite (Addresses image_4e83c178.png) */}
      {result && (
        <VerificationMatrix
          suite={result.verification_suite}
          impacts={result.top_features}
          onFeatureChange={(key, val) => handleInputChange(key as keyof ClassifierInput, val)}
        />
      )}

      {/* UPGRADED & ENERGETIC: Live Astrophysics Parameter Deck (Addresses image_8cd2bc48.png) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121A33]/90 border border-[#1E293B] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  Live Astrophysics Parameter Test Bench
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  Instant Re-vetting
                </span>
              </div>
              <p className="text-xs text-[#8892B0]">
                Tuning any slider dynamically recalculates the orrery, light curve, and 5 Robovetter vetting tests
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Physics Auto-Coupling Toggle */}
            <button
              onClick={() => setPhysicsCoupled(!physicsCoupled)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                physicsCoupled
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_10px_rgba(45,212,191,0.2)]'
                  : 'bg-[#0B1020] text-[#8892B0] border-[#1E293B] hover:text-white'
              }`}
              title="When coupled, changing planet size automatically recalculates geometric transit depth & duration according to physics laws"
            >
              {physicsCoupled ? <Link2 className="w-3.5 h-3.5 text-teal-400" /> : <Unlink className="w-3.5 h-3.5" />}
              <span>{physicsCoupled ? 'Physics Auto-Coupled' : 'Manual Sandbox'}</span>
            </button>

            {/* Mission Selector */}
            <div className="flex items-center bg-[#0B1020] p-0.5 rounded-lg border border-[#1E293B] text-xs">
              <button
                onClick={() => handleInputChange('mission', 'kepler')}
                className={`px-2.5 py-1 rounded cursor-pointer font-medium ${
                  formData.mission === 'kepler' ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-[#8892B0] hover:text-white'
                }`}
              >
                Kepler (0.95m)
              </button>
              <button
                onClick={() => handleInputChange('mission', 'tess')}
                className={`px-2.5 py-1 rounded cursor-pointer font-medium ${
                  formData.mission === 'tess' ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-[#8892B0] hover:text-white'
                }`}
              >
                TESS (All-Sky)
              </button>
            </div>
          </div>
        </div>

        {/* Physics-Coupled Callout Notification */}
        {physicsCoupled && (
          <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-800/40 text-xs text-slate-300 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                <strong>Astrophysics Engine Active: </strong>
                Adjusting <em>Planetary Radius</em> automatically updates <em>Transit Depth</em> geometrically: $\delta = (R_p / R_*)^2$.
                Adjusting <em>Orbital Period</em> updates <em>Duration</em> and <em>Equilibrium Temperature</em>.
              </span>
            </span>
            <span className="text-[10px] font-mono text-teal-400 shrink-0 hidden sm:inline">Active Coupling</span>
          </div>
        )}

        {/* 3 Parameter Groups with Live Physical Descriptor Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Group 1: Transit Timing & SNR */}
          <div className="space-y-4 p-4 rounded-xl bg-[#0B1020]/60 border border-[#1E293B]">
            <div className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold border-b border-[#1E293B] pb-2 flex items-center justify-between">
              <span>1. Transit Dynamics & Signal</span>
              <Activity className="w-3.5 h-3.5" />
            </div>

            {/* Orbital Period */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Orbital Period (P)</span>
                <span className="font-mono text-teal-300 font-bold">{formData.orbital_period} days</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="500"
                step="0.5"
                value={formData.orbital_period}
                onChange={(e) => handleInputChange('orbital_period', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] mt-1 font-mono">
                <span>0.5 d</span>
                <span className="text-slate-400 font-sans">
                  {formData.orbital_period < 10 ? 'Ultra-short orbit' : formData.orbital_period > 200 ? 'Temperate 1-yr orbit' : 'Moderate orbit'}
                </span>
                <span>500 d</span>
              </div>
            </div>

            {/* Transit Duration */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Transit Duration</span>
                <span className="font-mono text-teal-300 font-bold">{formData.transit_duration_hr} hr</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="24"
                step="0.1"
                value={formData.transit_duration_hr}
                onChange={(e) => handleInputChange('transit_duration_hr', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] mt-1 font-mono">
                <span>0.5 hr</span>
                <span className="text-slate-400 font-sans">Eclipse crossing time</span>
                <span>24 hr</span>
              </div>
            </div>

            {/* SNR */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Model SNR (σ)</span>
                <span className={`font-mono font-bold ${formData.snr >= 7.1 ? 'text-teal-300' : 'text-rose-400'}`}>
                  {formData.snr} σ
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="150"
                step="1"
                value={formData.snr}
                onChange={(e) => handleInputChange('snr', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] mt-1 font-mono">
                <span>3.0 σ</span>
                <span className={`font-sans font-medium ${formData.snr >= 7.1 ? 'text-teal-300' : 'text-rose-400'}`}>
                  {getSnrDescriptor(formData.snr)}
                </span>
                <span>150 σ</span>
              </div>
            </div>
          </div>

          {/* Group 2: Dimensions & Depth */}
          <div className="space-y-4 p-4 rounded-xl bg-[#0B1020]/60 border border-[#1E293B]">
            <div className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold border-b border-[#1E293B] pb-2 flex items-center justify-between">
              <span>2. Dimensions & Depth</span>
              <Orbit className="w-3.5 h-3.5" />
            </div>

            {/* Inferred Planet Radius */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Planet Radius</span>
                <span className="font-mono text-teal-300 font-bold">{formData.planet_radius_re} R⊕</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.1"
                value={formData.planet_radius_re}
                onChange={(e) => handleInputChange('planet_radius_re', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] mt-1 font-mono">
                <span>0.5 R⊕</span>
                <span className={`font-sans font-medium ${formData.planet_radius_re > 16 ? 'text-rose-400' : 'text-teal-300'}`}>
                  {getRadiusDescriptor(formData.planet_radius_re)}
                </span>
                <span>25 R⊕</span>
              </div>
            </div>

            {/* Transit Depth */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Transit Depth (ppm)</span>
                <span className="font-mono text-teal-300 font-bold">{formData.transit_depth_ppm.toLocaleString()} ppm</span>
              </div>
              <input
                type="range"
                min="50"
                max="35000"
                step="50"
                value={formData.transit_depth_ppm}
                onChange={(e) => handleInputChange('transit_depth_ppm', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] mt-1 font-mono">
                <span>50 ppm</span>
                <span className={`font-sans font-medium ${formData.transit_depth_ppm > 25000 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {getDepthDescriptor(formData.transit_depth_ppm)}
                </span>
                <span>35k ppm</span>
              </div>
            </div>

            {/* Impact Parameter b */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Impact Parameter (b)</span>
                <span className={`font-mono font-bold ${formData.impact_parameter > 1.0 ? 'text-rose-400' : 'text-teal-300'}`}>
                  {formData.impact_parameter}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={formData.impact_parameter}
                onChange={(e) => handleInputChange('impact_parameter', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] mt-1 font-mono">
                <span>0.0 (Center)</span>
                <span className={`font-sans font-medium ${formData.impact_parameter > 1.0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {getImpactDescriptor(formData.impact_parameter)}
                </span>
                <span>1.5 (Grazer)</span>
              </div>
            </div>
          </div>

          {/* Group 3: Host Star Baseline */}
          <div className="space-y-4 p-4 rounded-xl bg-[#0B1020]/60 border border-[#1E293B]">
            <div className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold border-b border-[#1E293B] pb-2 flex items-center justify-between">
              <span>3. Host Star Baseline</span>
              <Compass className="w-3.5 h-3.5" />
            </div>

            {/* Star Teff */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Effective Temperature</span>
                <span className="font-mono text-teal-300 font-bold">{formData.star_teff_k.toLocaleString()} K</span>
              </div>
              <input
                type="range"
                min="2500"
                max="8500"
                step="50"
                value={formData.star_teff_k}
                onChange={(e) => handleInputChange('star_teff_k', parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] mt-1 font-mono">
                <span>2,500 K</span>
                <span className="text-slate-400 font-sans">
                  {formData.star_teff_k < 3700 ? 'Red M-Dwarf' : formData.star_teff_k < 5200 ? 'Orange K-Dwarf' : formData.star_teff_k < 6000 ? 'Yellow G-Dwarf (Sun)' : 'Hot F/A-Star'}
                </span>
                <span>8,500 K</span>
              </div>
            </div>

            {/* Star Radius */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Stellar Radius</span>
                <span className="font-mono text-teal-300 font-bold">{formData.star_radius_rsun} R☉</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.05"
                value={formData.star_radius_rsun}
                onChange={(e) => handleInputChange('star_radius_rsun', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] mt-1 font-mono">
                <span>0.1 R☉</span>
                <span className="text-slate-400 font-sans">
                  {formData.star_radius_rsun < 0.5 ? 'Compact dwarf' : formData.star_radius_rsun > 2.0 ? 'Subgiant / Giant' : 'Solar-type'}
                </span>
                <span>5.0 R☉</span>
              </div>
            </div>

            {/* Surface Gravity log g */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-300 font-medium">Surface Gravity (log g)</span>
                <span className="font-mono text-teal-300 font-bold">{formData.star_logg}</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="5.0"
                step="0.05"
                value={formData.star_logg}
                onChange={(e) => handleInputChange('star_logg', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#0B1020] rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-[#8892B0] mt-1 font-mono">
                <span>2.5 (Bloated)</span>
                <span className="text-slate-400 font-sans">
                  {formData.star_logg >= 4.0 ? 'Main-sequence dwarf' : 'Evolved giant'}
                </span>
                <span>5.0 (Dense)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
