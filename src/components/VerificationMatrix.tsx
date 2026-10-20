import React, { useState } from 'react';
import { FeatureImpact, VerificationSuite, VettingTestResult } from '../types.ts';
import { FeatureImpactChart } from './FeatureImpactChart.tsx';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Layers,
  Crosshair,
  Sun,
  Activity,
  Orbit,
  Cpu,
  BarChart3,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Scale,
  Zap,
  Info
} from 'lucide-react';

interface VerificationMatrixProps {
  suite: VerificationSuite;
  impacts: FeatureImpact[];
  onFeatureChange?: (featureKey: string, newValue: number) => void;
}

export const VerificationMatrix: React.FC<VerificationMatrixProps> = ({
  suite,
  impacts,
  onFeatureChange
}) => {
  const [activeTab, setActiveTab] = useState<'vetting' | 'consensus' | 'shap'>('vetting');
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const getTestIcon = (iconType: string) => {
    switch (iconType) {
      case 'layers': return <Layers className="w-4 h-4" />;
      case 'crosshair': return <Crosshair className="w-4 h-4" />;
      case 'sun': return <Sun className="w-4 h-4" />;
      case 'activity': return <Activity className="w-4 h-4" />;
      case 'orbit': return <Orbit className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const passedTestsCount = suite.tests.filter(t => t.status === 'PASSED').length;
  const warningTestsCount = suite.tests.filter(t => t.status === 'WARNING').length;
  const failedTestsCount = suite.tests.filter(t => t.status === 'FAILED').length;

  return (
    <div className="rounded-2xl bg-[#121A33]/90 border border-[#1E293B] shadow-2xl p-5 sm:p-6 space-y-5">
      {/* Top Header with Vetting Disposition & Mode Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-950/80 text-teal-300 border border-teal-800/60 shadow-[0_0_10px_rgba(45,212,191,0.2)]">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              NASA TRANSIT VETTING PIPELINE
            </span>
            <span className="text-xs font-mono text-[#8892B0]">DAVE / Robovetter Protocols</span>
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-wide">
            Multi-Technique Verification Suite
          </h2>
          <p className="text-xs text-[#8892B0]">
            5 independent physical diagnostics ruling out eclipsing binaries, background star blends, and instrumental artefacts
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#0B1020] p-1 rounded-xl border border-[#1E293B] text-xs font-medium self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('vetting')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vetting'
                ? 'bg-[#182346] text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Robovetter Tests ({passedTestsCount}/5)</span>
          </button>

          <button
            onClick={() => setActiveTab('consensus')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'consensus'
                ? 'bg-[#182346] text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Multi-Model AI Consensus</span>
          </button>

          <button
            onClick={() => setActiveTab('shap')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'shap'
                ? 'bg-[#182346] text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>SHAP Feature Waterfall</span>
          </button>
        </div>
      </div>

      {/* Summary Score Ribbon */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        suite.vetting_disposition === 'ROBUST PLANET CANDIDATE'
          ? 'bg-teal-950/30 border-teal-500/30 text-teal-200'
          : suite.vetting_disposition === 'SUSPECT / UNRESOLVED'
          ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            suite.vetting_disposition === 'ROBUST PLANET CANDIDATE'
              ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
              : suite.vetting_disposition === 'SUSPECT / UNRESOLVED'
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}>
            {suite.vetting_disposition === 'ROBUST PLANET CANDIDATE' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : suite.vetting_disposition === 'SUSPECT / UNRESOLVED' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#8892B0]">
              Robovetter Disposition
            </div>
            <div className="text-base font-extrabold text-white">
              {suite.vetting_disposition}
            </div>
          </div>
        </div>

        {/* Right side stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-[#8892B0] block text-[10px]">RELIABILITY SCORE</span>
            <span className="text-lg font-bold text-white tabular-nums">
              {suite.overall_vetting_score}<span className="text-teal-400 text-xs">/100</span>
            </span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {passedTestsCount} Passed
            </span>
            {warningTestsCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {warningTestsCount} Caution
              </span>
            )}
            {failedTestsCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                {failedTestsCount} Failed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: 5 NASA Robovetter & DAVE Vetting Tests */}
      {activeTab === 'vetting' && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-[#8892B0] flex items-center justify-between px-1">
            <span>NASA ASTROPHYSICAL VETTING TESTS</span>
            <span>CRITERIA & THRESHOLD</span>
          </div>

          <div className="space-y-3">
            {suite.tests.map((test) => {
              const isExpanded = expandedTest === test.id;
              const isPassed = test.status === 'PASSED';
              const isWarning = test.status === 'WARNING';

              return (
                <div
                  key={test.id}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    isPassed
                      ? 'bg-[#0B1020]/90 border-[#1E293B] hover:border-teal-500/40'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-500/50'
                      : 'bg-rose-950/20 border-rose-800/40 hover:border-rose-500/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border shrink-0 ${
                        isPassed
                          ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                          : isWarning
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {getTestIcon(test.iconType)}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          {test.name}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            isPassed
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : isWarning
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}>
                            {test.status}
                          </span>
                        </h4>
                        <div className="text-[11px] text-[#8892B0] mt-0.5">
                          Threshold: <strong className="text-slate-300 font-mono">{test.threshold}</strong>
                          <span className="mx-2 text-slate-600">·</span>
                          Observed Value: <strong className={`font-mono ${isPassed ? 'text-teal-300' : 'text-rose-400'}`}>{test.metricValue}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {/* Individual Test Score Bar */}
                      <div className="w-24 text-right">
                        <div className="text-[10px] font-mono text-[#8892B0]">Score: {test.score}/100</div>
                        <div className="h-1.5 bg-[#0B1020] rounded-full overflow-hidden border border-[#1E293B] mt-0.5">
                          <div
                            style={{ width: `${test.score}%` }}
                            className={`h-full rounded-full ${
                              isPassed ? 'bg-teal-400' : isWarning ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                        className="p-1 rounded-md text-[#8892B0] hover:text-white hover:bg-[#182346] cursor-pointer transition-colors"
                        title="Toggle physics explanation"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary commentary line */}
                  <div className="mt-2 text-xs text-slate-300 pl-0 sm:pl-11 leading-relaxed">
                    {test.summary}
                  </div>

                  {/* Expandable Astrophysics Mechanics */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#1E293B] pl-0 sm:pl-11 text-xs text-[#8892B0] space-y-1.5 bg-[#070B16]/50 p-3 rounded-lg">
                      <div className="font-semibold text-teal-300 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        Why This Test Matters in Astrophysics:
                      </div>
                      <p className="leading-relaxed text-slate-300">
                        {test.physicalExplanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Model AI Consensus */}
      {activeTab === 'consensus' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Cross-Model Evaluation Agreement:</span>
            <span className="font-mono text-teal-300 font-bold">{suite.consensus.agreement}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Model 1: Calibrated XGBoost */}
            <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">1. Calibrated XGBoost</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  Gradient Tree
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-teal-400">
                {(suite.consensus.xgboost_prob * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-[#8892B0] leading-relaxed">
                Trained on 9,564 Kepler KOI signals with isotonic calibration for optimal probability fidelity.
              </p>
            </div>

            {/* Model 2: Random Forest Astrometry */}
            <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">2. Random Forest Vetting</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  Ensemble
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-cyan-400">
                {(suite.consensus.random_forest_prob * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-[#8892B0] leading-relaxed">
                Evaluates photometric symmetry, odd-even consistency, and pixel stability against instrument artefacts.
              </p>
            </div>

            {/* Model 3: Bayesian Physics Model */}
            <div className="p-4 rounded-xl bg-[#0B1020] border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">3. Bayesian Astro-Physics</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  Prior + Likelihood
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400">
                {(suite.consensus.bayesian_physics_prob * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-[#8892B0] leading-relaxed">
                Applies strict Keplerian orbital mechanics, geometric chord constraints, and stellar density priors.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHAP Feature Waterfall */}
      {activeTab === 'shap' && (
        <FeatureImpactChart
          impacts={impacts}
          onFeatureChange={onFeatureChange}
        />
      )}
    </div>
  );
};
