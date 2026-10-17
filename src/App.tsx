import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { ClassifyTool } from './components/ClassifyTool.tsx';
import { HabitabilityTool } from './components/HabitabilityTool.tsx';
import { ExploreTool } from './components/ExploreTool.tsx';
import { Orbit, ExternalLink } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'classify' | 'habitability' | 'explore'>('classify');

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-[#E6EAF5] selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'classify' && <ClassifyTool />}
        {currentTab === 'habitability' && <HabitabilityTool />}
        {currentTab === 'explore' && <ExploreTool />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] bg-[#0B1020]/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8892B0]">
          <div className="flex items-center gap-2">
            <Orbit className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-white">ExoScope</span>
            <span aria-hidden="true">·</span>
            <span>NASA Exoplanet Archive (PSCompPars & Kepler KOI)</span>
          </div>

          <div className="flex items-center gap-4 text-[#8892B0]">
            <span>Kopparapu et al. (2013) HZ Models</span>
            <span aria-hidden="true">·</span>
            <span>Schulze-Makuch et al. (2011) ESI</span>
            <span aria-hidden="true">·</span>
            <a
              href="https://exoplanetarchive.ipac.caltech.edu"
              target="_blank"
              rel="noreferrer"
              className="hover:text-teal-400 inline-flex items-center gap-1 transition-colors"
            >
              NASA IPAC Archive <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-[#1E293B]/70 text-[11px] text-[#8892B0] text-center leading-relaxed">
          Scores and predictions are model estimates based on catalog data for learning and exploration, not definitive scientific verdicts of extraterrestrial habitability.
        </div>
      </footer>
    </div>
  );
}
