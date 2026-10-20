import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { ClassifyTool } from './components/ClassifyTool.tsx';
import { HabitabilityTool } from './components/HabitabilityTool.tsx';
import { ExploreTool } from './components/ExploreTool.tsx';
import { CosmicBackground } from './components/CosmicBackground.tsx';
import { Orbit, ExternalLink, Sparkles } from 'lucide-react';
import { PlanetRecord } from './types.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'classify' | 'habitability' | 'explore'>('classify');
  const [selectedPlanetForHabitability, setSelectedPlanetForHabitability] = useState<string>('Kepler-452 b');
  const [classifierPreload, setClassifierPreload] = useState<any>(null);

  const handleNavigateToHabitability = (planetName: string) => {
    setSelectedPlanetForHabitability(planetName);
    setCurrentTab('habitability');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToClassifier = (planet: PlanetRecord) => {
    // Convert planet parameters to transit parameters
    setClassifierPreload({
      mission: planet.disc_facility.toLowerCase().includes('tess') ? 'tess' : 'kepler',
      orbital_period: planet.pl_orbper,
      planet_radius_re: planet.pl_rade,
      equilibrium_temp_k: planet.pl_eqt,
      star_teff_k: planet.st_teff,
      star_radius_rsun: planet.st_rad,
      star_logg: 4.4,
      insolation_flux: planet.pl_insol,
      // Geometrical transit depth: (R_p / R_*)^2 in ppm
      transit_depth_ppm: Math.round(Math.pow((planet.pl_rade * 0.009167) / (planet.st_rad || 1.0), 2) * 1e6),
      transit_duration_hr: Math.round(3.0 * Math.pow(Math.max(0.5, planet.pl_orbper), 0.33) * 10) / 10,
      impact_parameter: 0.2,
      snr: 32.0
    });
    setCurrentTab('classify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070B16] text-[#E6EAF5] selection:bg-teal-500/30 selection:text-teal-200 relative overflow-x-hidden">
      {/* Dynamic Cosmic Background with twinkling stars, nebular clouds, and shooting stars */}
      <CosmicBackground />

      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {currentTab === 'classify' && (
          <ClassifyTool
            initialInput={classifierPreload}
            onNavigateToHabitability={handleNavigateToHabitability}
          />
        )}
        {currentTab === 'habitability' && (
          <HabitabilityTool
            initialPlanetName={selectedPlanetForHabitability}
            onNavigateToClassifier={handleNavigateToClassifier}
          />
        )}
        {currentTab === 'explore' && (
          <ExploreTool
            onSelectPlanetForHabitability={handleNavigateToHabitability}
            onSelectPlanetForClassifier={handleNavigateToClassifier}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] bg-[#070B16]/90 backdrop-blur-md py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8892B0]">
          <div className="flex items-center gap-2">
            <Orbit className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-white">ExoScope Observatory</span>
            <span aria-hidden="true">·</span>
            <span>NASA Exoplanet Archive (PSCompPars & Kepler KOI Catalog)</span>
          </div>

          <div className="flex items-center gap-4 text-[#8892B0]">
            <span>Kopparapu et al. (2013) HZ</span>
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
          Scores and predictions are calibrated astrophysics models for learning and exploration, not definitive declarations of extraterrestrial life.
        </div>
      </footer>
    </div>
  );
}
