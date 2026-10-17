import React, { useState, useEffect } from 'react';
import { ClassifierInput, ClassifierResult, HeldOutSample } from '../types.ts';
import { classifyTransit, fetchSamples } from '../services/api.ts';
import { ProbabilityGauge } from './ProbabilityGauge.tsx';
import { FeatureImpactChart } from './FeatureImpactChart.tsx';
import { TransitLightCurve } from './TransitLightCurve.tsx';
import { Sparkles, CheckCircle2, RefreshCw, Send, Sliders, Layers, ChevronRight } from 'lucide-react';

export const ClassifyTool: React.FC = () => {
  const [mode, setMode] = useState<'guided' | 'lab'>('guided');

  const [formData, setFormData] = useState<ClassifierInput>({
    mission: 'kepler',
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
  });

  const [samples, setSamples] = useState<HeldOutSample[]>([]);
  const [activePreset, setActivePreset] = useState<string>('sub_neptune');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ClassifierResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const curatedScenarios = [
    {
      id: 'earth_twin',
      title: 'Earth Twin Candidate',
      subtitle: 'Small rocky planet in 1-year orbit',
      outcome: 'CONFIRMED',
      tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
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
      subtitle: 'Pristine box transit, high SNR',
      outcome: 'CONFIRMED',
      tagColor: 'text-teal-400 bg-teal-950/60 border-teal-800',
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
      id: 'eclipsing_binary',
      title: 'Eclipsing Binary (False Alarm)',
      subtitle: 'Massive depth & radius > 16 R⊕',
      outcome: 'FALSE POSITIVE',
      tagColor: 'text-rose-400 bg-rose-950/60 border-rose-800',
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
      id: 'grazing_binary',
      title: 'Grazing Binary (False Alarm)',
      subtitle: 'High impact parameter (b > 1.0)',
      outcome: 'FALSE POSITIVE',
      tagColor: 'text-rose-400 bg-rose-950/60 border-rose-800',
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
      id: 'noise_artefact',
      title: 'Instrumental Noise (False Alarm)',
      subtitle: 'Marginal SNR (< 7.1σ limit)',
      outcome: 'FALSE POSITIVE',
      tagColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
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

  useEffect(() => {
    fetchSamples().then(setSamples);
    handleClassify(formData);
  }, []);

  const handleClassify = async (data = formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await classifyTransit(data);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error executing classification.');
    } finally {
      setLoading(false);
    }
  };

  const selectScenario = (sc: typeof curatedScenarios[0]) => {
    setActivePreset(sc.id);
    setFormData(sc.data);
    handleClassify(sc.data);
  };

  const handleRandomSample = () => {
    if (samples.length === 0) {
      const sc = curatedScenarios[Math.floor(Math.random() * curatedScenarios.length)];
      selectScenario(sc);
      return;
    }
    const rand = samples[Math.floor(Math.random() * samples.length)];
    setActivePreset(rand.id);
    setFormData(rand.data);
    handleClassify(rand.data);
  };

  const handleGuidedChange = (key: 'radius' | 'period' | 'snr' | 'starTeff', value: number) => {
    setActivePreset('');
    let updated = { ...formData };

    if (key === 'radius') {
      const ratio = (value * 0.00915) / (updated.star_radius_rsun || 1.0);
      const depthPpm = Math.round(Math.pow(ratio, 2) * 1000000);
      updated.planet_radius_re = value;
      updated.transit_depth_ppm = Math.max(15, depthPpm);
    } else if (key === 'period') {
      updated.orbital_period = value;
      updated.transit_duration_hr = Math.round(3.0 * Math.pow(value, 0.33) * 10) / 10;
    } else if (key === 'snr') {
      updated.snr = value;
    } else if (key === 'starTeff') {
      updated.star_teff_k = value;
      updated.star_radius_rsun = Math.round(Math.pow(value / 5778, 1.8) * 100) / 100;
    }

    setFormData(updated);
    handleClassify(updated);
  };

  return (
    <div className="space-y-8">
      {/* Hero Visual Card */}
      <div className="relative rounded-2xl overflow-hidden border border-[#1E293B] shadow-lg">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/hero_exoplanet_transit_1792238996117.jpg"
            alt="Exoplanet Transit Illustration"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1020] via-[#0B1020]/90 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 max-w-2xl text-white space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-teal-300 font-semibold">
            NASA Kepler & TESS Deep Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            AI Exoplanet Transit Classifier
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Test whether a photometric dip in starlight is a genuine alien planet or an eclipsing binary false alarm using calibrated machine learning.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleRandomSample}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Try a Random Sample
            </button>
            <div className="text-xs text-slate-300 font-mono">
              Validated on 9,500+ NASA Kepler KOI signals
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Interactive Presets */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-[#8892B0] font-mono">
          <span>Quick Benchmark Scenarios:</span>
          <span>Click any tile to test model response</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {curatedScenarios.map((sc) => {
            const isSelected = activePreset === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => selectScenario(sc)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500/15 border-teal-400 shadow-sm ring-1 ring-teal-400/30'
                    : 'bg-[#121A33] border-[#1E293B] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate">
                      {sc.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8892B0] line-clamp-2 leading-tight">
                    {sc.subtitle}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1E293B] flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${sc.tagColor}`}>
                    {sc.outcome === 'CONFIRMED' ? '✓ Planet' : '✕ False Alarm'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Output & Light Curve on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Parameter Controls (6 cols) */}
        <div className="lg:col-span-6 bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
            <div>
              <h2 className="text-base font-semibold text-white">
                Transit & Stellar Inputs
              </h2>
              <p className="text-xs text-[#8892B0] mt-0.5">
                Adjust values or switch to Laboratory Mode for direct astrophysical entries
              </p>
            </div>

            {/* Mode Switch: Guided vs Lab */}
            <div className="flex items-center gap-1 p-1 bg-[#0B1020] border border-[#1E293B] rounded-lg text-xs font-medium">
              <button
                onClick={() => setMode('guided')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  mode === 'guided'
                    ? 'bg-[#182346] text-teal-300 font-semibold'
                    : 'text-[#8892B0] hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Guided
              </button>
              <button
                onClick={() => setMode('lab')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  mode === 'lab'
                    ? 'bg-[#182346] text-teal-300 font-semibold'
                    : 'text-[#8892B0] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Lab
              </button>
            </div>
          </div>

          {mode === 'guided' ? (
            <div className="space-y-5">
              {/* Slider 1: Planetary Radius */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#E6EAF5]">
                    Planet Size (Radius)
                  </span>
                  <span className="font-mono text-teal-300 font-bold">
                    {formData.planet_radius_re.toFixed(2)} R⊕ ({formData.planet_radius_re <= 1.6 ? 'Rocky Terrestrial' : formData.planet_radius_re <= 4.0 ? 'Sub-Neptune' : formData.planet_radius_re <= 14 ? 'Jovian Gas Giant' : 'Stellar Companion / Binary'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="22.0"
                  step="0.1"
                  value={formData.planet_radius_re}
                  onChange={(e) => handleGuidedChange('radius', parseFloat(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8892B0] font-mono">
                  <span>1.0 R⊕ (Earth)</span>
                  <span>4.0 R⊕ (Neptune)</span>
                  <span>11.2 R⊕ (Jupiter)</span>
                  <span>&gt;16 R⊕ (Binary Star)</span>
                </div>
              </div>

              {/* Slider 2: Orbital Period */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#E6EAF5]">
                    Orbital Period (Orbit Length)
                  </span>
                  <span className="font-mono text-teal-300 font-bold">
                    {formData.orbital_period.toFixed(1)} days
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="500.0"
                  step="1.0"
                  value={formData.orbital_period}
                  onChange={(e) => handleGuidedChange('period', parseFloat(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8892B0] font-mono">
                  <span>1 day (Hot Orbit)</span>
                  <span>30 days (Warm)</span>
                  <span>365 days (1 Earth Year)</span>
                </div>
              </div>

              {/* Slider 3: Detection Signal Clarity (SNR) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#E6EAF5]">
                    Signal Clarity (Model SNR)
                  </span>
                  <span className="font-mono text-teal-300 font-bold">
                    {formData.snr.toFixed(1)}σ ({formData.snr >= 20 ? 'Strong & Clean' : formData.snr >= 7.1 ? 'Moderate' : 'Noisy / Questionable'})
                  </span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="80.0"
                  step="0.5"
                  value={formData.snr}
                  onChange={(e) => handleGuidedChange('snr', parseFloat(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8892B0] font-mono">
                  <span>&lt;7.1σ (Noisy Limit)</span>
                  <span>25σ (Solid)</span>
                  <span>&gt;50σ (High Significance)</span>
                </div>
              </div>

              {/* Slider 4: Host Star Temperature */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#E6EAF5]">
                    Host Star Type & Temperature
                  </span>
                  <span className="font-mono text-teal-300 font-bold">
                    {formData.star_teff_k} K ({formData.star_teff_k > 6000 ? 'F-type Hot Star' : formData.star_teff_k > 5200 ? 'Sun-like G-dwarf' : formData.star_teff_k > 3700 ? 'K-dwarf Orange' : 'M-dwarf Red Dwarf'})
                  </span>
                </div>
                <input
                  type="range"
                  min="2800"
                  max="6800"
                  step="50"
                  value={formData.star_teff_k}
                  onChange={(e) => handleGuidedChange('starTeff', parseInt(e.target.value, 10))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8892B0] font-mono">
                  <span>3000 K (Red Dwarf)</span>
                  <span>5778 K (Sun)</span>
                  <span>6500 K (Hot Star)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[#E6EAF5] font-medium block mb-1">
                    Orbital Period (days)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.orbital_period}
                    onChange={(e) => {
                      setFormData({ ...formData, orbital_period: parseFloat(e.target.value) || 0 });
                      setActivePreset('');
                    }}
                    className="w-full px-3 py-1.5 font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-[#E6EAF5] font-medium block mb-1">
                    Transit Depth (ppm)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.transit_depth_ppm}
                    onChange={(e) => {
                      setFormData({ ...formData, transit_depth_ppm: parseFloat(e.target.value) || 0 });
                      setActivePreset('');
                    }}
                    className="w-full px-3 py-1.5 font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-[#E6EAF5] font-medium block mb-1">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.transit_duration_hr}
                    onChange={(e) => {
                      setFormData({ ...formData, transit_duration_hr: parseFloat(e.target.value) || 0 });
                      setActivePreset('');
                    }}
                    className="w-full px-3 py-1.5 font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-[#E6EAF5] font-medium block mb-1">
                    Impact Parameter (b)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.impact_parameter}
                    onChange={(e) => {
                      setFormData({ ...formData, impact_parameter: parseFloat(e.target.value) || 0 });
                      setActivePreset('');
                    }}
                    className="w-full px-3 py-1.5 font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-[#E6EAF5] font-medium block mb-1">
                    Planet Radius (R⊕)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.planet_radius_re}
                    onChange={(e) => {
                      setFormData({ ...formData, planet_radius_re: parseFloat(e.target.value) || 0 });
                      setActivePreset('');
                    }}
                    className="w-full px-3 py-1.5 font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-[#E6EAF5] font-medium block mb-1">
                    Model SNR (σ)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.snr}
                    onChange={(e) => {
                      setFormData({ ...formData, snr: parseFloat(e.target.value) || 0 });
                      setActivePreset('');
                    }}
                    className="w-full px-3 py-1.5 font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-[#E6EAF5] font-medium block mb-1">
                    Star Temp (K)
                  </label>
                  <input
                    type="number"
                    value={formData.star_teff_k}
                    onChange={(e) => {
                      setFormData({ ...formData, star_teff_k: parseInt(e.target.value, 10) || 5000 });
                      setActivePreset('');
                    }}
                    className="w-full px-3 py-1.5 font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-[#E6EAF5] font-medium block mb-1">
                    Star Radius (R☉)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.star_radius_rsun}
                    onChange={(e) => {
                      setFormData({ ...formData, star_radius_rsun: parseFloat(e.target.value) || 1.0 });
                      setActivePreset('');
                    }}
                    className="w-full px-3 py-1.5 font-mono rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleClassify(formData)}
                className="w-full py-2.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Run Classification Model
              </button>
            </div>
          )}

          {/* Real-time Transit Light Curve visualization */}
          <div className="pt-3 border-t border-[#1E293B]">
            <TransitLightCurve
              depthPpm={formData.transit_depth_ppm}
              durationHr={formData.transit_duration_hr}
              periodDays={formData.orbital_period}
              radiusRe={formData.planet_radius_re}
              starRadiusRsun={formData.star_radius_rsun}
              snr={formData.snr}
              isConfirmed={result?.label === 'CONFIRMED'}
            />
          </div>
        </div>

        {/* Right Column: Prediction Verdict & SHAP Explanations (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {result && (
            <div className="bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm space-y-6">
              {/* Circular Gauge */}
              <div className="flex flex-col items-center pt-2">
                <ProbabilityGauge
                  probability={result.probability}
                  label={result.label}
                  threshold={result.threshold}
                />
              </div>

              {/* Rationale Box */}
              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                result.label === 'CONFIRMED'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
              }`}>
                <div className="font-semibold flex items-center gap-1.5 mb-1 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {result.label === 'CONFIRMED' ? 'Confirmed Planetary Candidate' : 'Astrophysical False Positive'}
                </div>
                {result.astrophysical_summary}
              </div>

              {/* SHAP Feature Impacts */}
              <div className="pt-2 border-t border-[#1E293B]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">
                    Why? (Top Feature Impacts)
                  </h3>
                  <span className="text-[11px] font-mono text-[#8892B0]">
                    SHAP Value Attribution
                  </span>
                </div>
                <FeatureImpactChart impacts={result.top_features} />
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#8892B0] border-t border-[#1E293B]">
                <span>Model: {result.model_version}</span>
                <span>Calibrated Confidence: {result.confidence_level}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
