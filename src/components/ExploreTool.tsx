import React, { useState, useEffect } from 'react';
import { ModelMetrics } from '../types.ts';
import { fetchModelInfo } from '../services/api.ts';
import { KNOWN_PLANETS } from '../data/planets.ts';
import { computeHabitability } from '../ml/habitability.ts';
import { ShieldCheck, Database, Award, ExternalLink, BookOpen, AlertOctagon, Search, ArrowUpDown } from 'lucide-react';

export const ExploreTool: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'model_card' | 'charts' | 'leaderboard' | 'science'>('catalog');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogSort, setCatalogSort] = useState<'score' | 'dist' | 'radius' | 'year'>('score');

  useEffect(() => {
    fetchModelInfo().then(setMetrics);
  }, []);

  if (!metrics) {
    return (
      <div className="py-20 text-center text-[#8892B0] font-mono text-sm">
        Loading NASA catalog statistics and ML model metadata...
      </div>
    );
  }

  const { confusion_matrix: cm } = metrics;
  const totalPredictions = cm.true_positive + cm.false_positive + cm.true_negative + cm.false_negative;

  const scoredCatalog = KNOWN_PLANETS.map(p => {
    const habitability = computeHabitability(p);
    return {
      ...p,
      score: habitability.score,
      band: habitability.band,
      bandColor: habitability.band_color,
      esi: habitability.components.esi_global
    };
  });

  const filteredCatalog = scoredCatalog
    .filter(p => {
      const q = catalogSearch.toLowerCase().trim();
      if (!q) return true;
      return p.pl_name.toLowerCase().includes(q) || p.hostname.toLowerCase().includes(q) || (p.habitability_label || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (catalogSort === 'score') return b.score - a.score;
      if (catalogSort === 'dist') return (a.sy_dist || 9999) - (b.sy_dist || 9999);
      if (catalogSort === 'radius') return b.pl_rade - a.pl_rade;
      if (catalogSort === 'year') return b.disc_year - a.disc_year;
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-teal-300 font-semibold">
            Astronomical Archive & Model Transparency
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Exoplanet Catalog & Model Card
          </h1>
          <p className="text-sm text-[#8892B0] max-w-2xl mt-1.5 leading-relaxed">
            Browse NASA confirmed exoplanets, inspect machine learning validation metrics, and examine top unconfirmed candidate signals.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#121A33] rounded-xl text-xs font-medium border border-[#1E293B]">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-[#182346] text-teal-300 font-semibold shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            Planets Catalog
          </button>
          <button
            onClick={() => setActiveTab('model_card')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'model_card'
                ? 'bg-[#182346] text-teal-300 font-semibold shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            Model Card
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'charts'
                ? 'bg-[#182346] text-teal-300 font-semibold shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            Discovery Trends
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-[#182346] text-teal-300 font-semibold shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            Candidate Signals
          </button>
          <button
            onClick={() => setActiveTab('science')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'science'
                ? 'bg-[#182346] text-teal-300 font-semibold shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            Physics & Formulas
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121A33] p-5 rounded-xl border border-[#1E293B]">
          <div className="text-xs font-mono uppercase text-[#8892B0]">
            Confirmed Planets
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {metrics.dataset_stats.total_confirmed_exoplanets.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#8892B0] mt-0.5">NASA PSCompPars Table</div>
        </div>

        <div className="bg-[#121A33] p-5 rounded-xl border border-[#1E293B]">
          <div className="text-xs font-mono uppercase text-[#8892B0]">
            Model ROC-AUC
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-300 mt-1">
            {metrics.roc_auc.toFixed(3)}
          </div>
          <div className="text-[11px] text-[#8892B0] mt-0.5">PR-AUC: {metrics.pr_auc.toFixed(3)}</div>
        </div>

        <div className="bg-[#121A33] p-5 rounded-xl border border-[#1E293B]">
          <div className="text-xs font-mono uppercase text-[#8892B0]">
            F1-Score / Accuracy
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {(metrics.f1_score * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#8892B0] mt-0.5">Test Accuracy: {(metrics.accuracy * 100).toFixed(1)}%</div>
        </div>

        <div className="bg-[#121A33] p-5 rounded-xl border border-[#1E293B]">
          <div className="text-xs font-mono uppercase text-[#8892B0]">
            Transit Signals
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {metrics.dataset_stats.total_kepler_kois.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#8892B0] mt-0.5">Kepler KOIs & TESS Candidates</div>
        </div>
      </div>

      {/* Tab: Interactive Planet Catalog */}
      {activeTab === 'catalog' && (
        <div className="bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Filter planets by name, star, or description..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#1E293B] bg-[#0B1020] text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8892B0] font-mono flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
              </span>
              <select
                value={catalogSort}
                onChange={(e) => setCatalogSort(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-[#1E293B] bg-[#0B1020] text-white font-mono cursor-pointer"
              >
                <option value="score">Habitability Score (High to Low)</option>
                <option value="dist">Distance to Earth (Nearest First)</option>
                <option value="radius">Planetary Radius (Largest to Smallest)</option>
                <option value="year">Discovery Year (Newest First)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1E293B] text-[#8892B0] font-mono">
                  <th className="py-2.5 px-3 font-medium">Exoplanet</th>
                  <th className="py-2.5 px-3 font-medium">Habitability</th>
                  <th className="py-2.5 px-3 font-medium">ESI</th>
                  <th className="py-2.5 px-3 font-medium">Radius (R⊕)</th>
                  <th className="py-2.5 px-3 font-medium">Orbit (days)</th>
                  <th className="py-2.5 px-3 font-medium">Eq. Temp (K)</th>
                  <th className="py-2.5 px-3 font-medium">Distance (ly)</th>
                  <th className="py-2.5 px-3 font-medium">Discovery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] font-mono">
                {filteredCatalog.map((p) => (
                  <tr key={p.pl_name} className="hover:bg-[#182346]/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">
                        {p.pl_name}
                      </div>
                      <div className="text-[11px] text-[#8892B0] font-sans truncate max-w-56">
                        {p.habitability_label || `Host: ${p.hostname}`}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-bold text-sm"
                          style={{ color: p.bandColor }}
                        >
                          {p.score}
                        </span>
                        <span className="text-[11px] font-sans text-[#8892B0]">
                          {p.band}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-teal-300 font-semibold">
                      {p.esi.toFixed(3)}
                    </td>
                    <td className="py-3 px-3 text-[#E6EAF5]">
                      {p.pl_rade.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-[#E6EAF5]">
                      {p.pl_orbper.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-[#E6EAF5]">
                      {p.pl_eqt} K
                    </td>
                    <td className="py-3 px-3 text-[#8892B0]">
                      {p.sy_dist ? `${p.sy_dist.toFixed(1)} ly` : '—'}
                    </td>
                    <td className="py-3 px-3 text-[#8892B0]">
                      {p.disc_year > 0 ? `${p.disc_year} (${p.disc_facility})` : 'Solar System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Model Card */}
      {activeTab === 'model_card' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#1E293B]">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <h2 className="text-base font-semibold text-white">
                    Model Architecture & Leak-Prevention
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#8892B0] block mb-0.5">Architecture</span>
                    <span className="text-white font-medium">
                      {metrics.training_summary.model_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8892B0] block mb-0.5">Pipeline Version</span>
                    <span className="text-teal-300 font-medium">
                      {metrics.training_summary.version}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8892B0] block mb-0.5">Primary Catalog</span>
                    <span className="text-white">
                      Kepler Cumulative KOI Table
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8892B0] block mb-0.5">Validation Strategy</span>
                    <span className="text-white">
                      GroupShuffleSplit by Star ID (kepid)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] text-xs leading-relaxed space-y-1.5">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-teal-400" />
                    Data Leakage Precaution
                  </div>
                  <p className="text-[#8892B0]">
                    {metrics.training_summary.leakage_prevention}
                  </p>
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#8892B0] mb-2">
                    Held-Out Test Set Performance
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#1E293B]">
                      <span className="text-[11px] text-[#8892B0] block">Precision</span>
                      <span className="text-lg font-mono font-bold text-white">
                        {(metrics.precision * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#1E293B]">
                      <span className="text-[11px] text-[#8892B0] block">Recall</span>
                      <span className="text-lg font-mono font-bold text-white">
                        {(metrics.recall * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0B1020] border border-[#1E293B]">
                      <span className="text-[11px] text-[#8892B0] block">Decision Threshold</span>
                      <span className="text-lg font-mono font-bold text-teal-300">
                        {metrics.threshold.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confusion Matrix */}
              <div className="bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <h3 className="text-base font-semibold text-white">
                    Confusion Matrix (Held-Out Test Set)
                  </h3>
                  <span className="text-xs font-mono text-[#8892B0]">
                    N = {totalPredictions.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/30">
                    <div className="text-[11px] font-mono text-teal-300">
                      True Positives (Confirmed Planets)
                    </div>
                    <div className="text-2xl font-mono font-bold text-teal-300 mt-1">
                      {cm.true_positive.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-teal-400/80 font-mono mt-0.5">
                      {((cm.true_positive / (cm.true_positive + cm.false_negative)) * 100).toFixed(1)}% Recall
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B]">
                    <div className="text-[11px] font-mono text-[#8892B0]">
                      False Positives (Type I Error)
                    </div>
                    <div className="text-2xl font-mono font-bold text-white mt-1">
                      {cm.false_positive.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#8892B0] font-mono mt-0.5">
                      False alarm rate: {((cm.false_positive / (cm.true_negative + cm.false_positive)) * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B]">
                    <div className="text-[11px] font-mono text-[#8892B0]">
                      False Negatives (Type II Error)
                    </div>
                    <div className="text-2xl font-mono font-bold text-white mt-1">
                      {cm.false_negative.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#8892B0] font-mono mt-0.5">
                      Missed genuine planets (low SNR)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <div className="text-[11px] font-mono text-emerald-300">
                      True Negatives (Correct False Alarms)
                    </div>
                    <div className="text-2xl font-mono font-bold text-emerald-300 mt-1">
                      {cm.true_negative.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
                      {((cm.true_negative / (cm.true_negative + cm.false_positive)) * 100).toFixed(1)}% Specificity
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              {/* Feature Importance */}
              <div className="bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <h3 className="text-base font-semibold text-white">
                    Global Feature Importance
                  </h3>
                  <span className="text-xs font-mono text-[#8892B0]">
                    SHAP Summary
                  </span>
                </div>

                <div className="space-y-3">
                  {metrics.feature_importance.map((f) => (
                    <div key={f.feature}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#E6EAF5] font-medium">
                          {f.name.split('(')[0].trim()}
                        </span>
                        <span className="font-mono text-teal-300 font-semibold">
                          {(f.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#0B1020] rounded-full overflow-hidden border border-[#1E293B]">
                        <div
                          style={{ width: `${(f.importance / 0.3) * 100}%` }}
                          className="h-full bg-teal-400 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calibration Diagram */}
              <div className="bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <h3 className="text-base font-semibold text-white">
                    Probability Calibration
                  </h3>
                  <span className="text-xs font-mono text-teal-300">
                    Isotonic Scaled
                  </span>
                </div>

                <div className="h-44 w-full relative flex items-center justify-center pt-2">
                  <svg viewBox="0 0 200 140" className="w-full h-full">
                    <line x1="25" y1="120" x2="195" y2="120" stroke="#1E293B" strokeWidth="1" />
                    <line x1="25" y1="10" x2="25" y2="120" stroke="#1E293B" strokeWidth="1" />
                    <line x1="25" y1="120" x2="195" y2="10" stroke="#475569" strokeDasharray="3,3" strokeWidth="1.5" />

                    <polyline
                      fill="none"
                      stroke="#5EEAD4"
                      strokeWidth="2.5"
                      points={metrics.calibration_curve.map(pt => {
                        const x = 25 + pt.mean_predicted_prob * 170;
                        const y = 120 - pt.fraction_positives_calibrated * 110;
                        return `${x},${y}`;
                      }).join(' ')}
                    />

                    {metrics.calibration_curve.map((pt, i) => {
                      const x = 25 + pt.mean_predicted_prob * 170;
                      const y = 120 - pt.fraction_positives_calibrated * 110;
                      return <circle key={i} cx={x} cy={y} r="2.5" fill="#5EEAD4" />;
                    })}

                    <text x="110" y="136" textAnchor="middle" className="text-[8px] font-mono fill-[#8892B0]">
                      Mean Predicted Probability
                    </text>
                    <text x="8" y="65" textAnchor="middle" transform="rotate(-90 8,65)" className="text-[8px] font-mono fill-[#8892B0]">
                      Fraction Positives
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Discovery Trends */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <h3 className="text-base font-semibold text-white">
                  Exoplanet Discoveries by Year (1995–2026)
                </h3>
                <span className="text-xs font-mono text-[#8892B0]">
                  Cumulative Growth
                </span>
              </div>

              <div className="h-56 flex items-end gap-2 pt-6 pb-2 px-1">
                {metrics.dataset_stats.yearly_discoveries.map((yr) => {
                  const maxCount = 1600;
                  const heightPercent = Math.min(100, (yr.count / maxCount) * 100);

                  return (
                    <div key={yr.year} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                        {yr.year}: {yr.count} planets
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-teal-400/80 group-hover:bg-teal-400 rounded-t transition-all duration-300"
                      />
                      <span className="text-[10px] font-mono text-[#8892B0] mt-1.5 transform -rotate-45 sm:rotate-0 origin-center">
                        {yr.year % 5 === 0 || yr.year === 2026 ? `'${String(yr.year).slice(2)}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <h3 className="text-base font-semibold text-white">
                  Confirmed Detection Methods
                </h3>
                <span className="text-xs font-mono text-[#8892B0]">
                  NASA Archive
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {metrics.dataset_stats.discovery_methods.map((m) => (
                  <div key={m.method}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#E6EAF5] font-medium">
                        {m.method}
                      </span>
                      <span className="font-mono text-white font-semibold">
                        {m.count.toLocaleString()} ({m.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#0B1020] rounded-full overflow-hidden border border-[#1E293B]">
                      <div
                        style={{ width: `${m.percentage}%` }}
                        className="h-full bg-purple-400 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Candidate Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Top-Ranked Unconfirmed Candidate Signals
              </h3>
              <p className="text-xs text-[#8892B0] mt-0.5">
                Kepler & TESS candidates classified with high probability by the XGBoost pipeline
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1E293B] text-[#8892B0] font-mono">
                  <th className="py-3 px-3">Candidate ID</th>
                  <th className="py-3 px-3">Host Star</th>
                  <th className="py-3 px-3">Period</th>
                  <th className="py-3 px-3">Radius</th>
                  <th className="py-3 px-3">SNR</th>
                  <th className="py-3 px-3">ML Probability</th>
                  <th className="py-3 px-3">Status & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] font-mono">
                {metrics.candidate_leaderboard.map((item) => (
                  <tr key={item.candidate_id} className="hover:bg-[#182346]/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-teal-300">
                      {item.candidate_id}
                    </td>
                    <td className="py-3 px-3 text-white">
                      {item.star_name}
                    </td>
                    <td className="py-3 px-3">
                      {item.orbital_period.toFixed(2)} d
                    </td>
                    <td className="py-3 px-3">
                      {item.planet_radius.toFixed(2)} R⊕
                    </td>
                    <td className="py-3 px-3">
                      {item.snr.toFixed(1)}σ
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-400">
                      {(item.ml_probability * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-3 text-[#8892B0] font-sans">
                      <span className="font-medium text-white mr-1.5">{item.status}:</span>
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Physics & Formulas */}
      {activeTab === 'science' && (
        <div className="bg-[#121A33] p-6 rounded-2xl border border-[#1E293B] shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1E293B]">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-semibold text-white">
              Mathematical Formulations & Scientific Methodology
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#E6EAF5] leading-relaxed">
            <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] space-y-2">
              <h3 className="font-semibold text-white text-sm">
                1. Earth Similarity Index (ESI) Formula
              </h3>
              <p className="text-[#8892B0]">
                Proposed by Schulze-Makuch et al. (2011), ESI calculates the weighted geometric distance from terrestrial parameters:
              </p>
              <div className="p-2.5 rounded bg-black/40 border border-[#1E293B] font-mono text-[11px] text-teal-300 text-center">
                ESI_x = ( 1 - |x - x_0| / (x + x_0) )^(w / n)
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-[#8892B0]">
                <li>Interior component: Radius (w=0.57) and Density (w=1.07)</li>
                <li>Surface component: Escape velocity (w=0.70) and Equilibrium temperature (w=5.58)</li>
                <li>Global ESI is computed as the geometric mean of interior and surface values.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] space-y-2">
              <h3 className="font-semibold text-white text-sm">
                2. Circumstellar Habitable Zone Flux
              </h3>
              <p className="text-[#8892B0]">
                Based on Kopparapu et al. (2013) 1D radiative-convective climate models:
              </p>
              <div className="p-2.5 rounded bg-black/40 border border-[#1E293B] font-mono text-[11px] text-teal-300 text-center">
                S = L_star / a^2 (Earth Flux Units)
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-[#8892B0]">
                <li>Conservative zone: S = 0.36 (maximum greenhouse) to 1.10 (runaway greenhouse)</li>
                <li>Optimistic zone: S = 0.32 (early Mars) to 1.80 (recent Venus)</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800 text-xs text-amber-300 flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Scientific & Ethical Transparency Note</div>
              <p className="leading-relaxed text-[11px] text-amber-300/90">
                The habitability potential score generated by this application represents physical similarity to terrestrial conditions derived from catalog parameters. It is an exploration and pedagogical metric, not a definitive biological verdict or proof of extraterrestrial life.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
