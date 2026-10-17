/**
 * Held-out test set candidates from Kepler and TESS missions.
 * Used for instant demo testing, evaluating classifier performance,
 * and testing known confirmed vs false positive cases.
 */

import { HeldOutSample } from '../types.ts';

export const HELD_OUT_SAMPLES: HeldOutSample[] = [
  {
    id: "KOI-701.04",
    name: "Kepler-62 e Analog (Held-Out KOI)",
    description: "Kepler super-Earth in habitable zone with strong transit signal",
    true_disposition: "CONFIRMED",
    data: {
      mission: "kepler",
      orbital_period: 122.387,
      transit_duration_hr: 7.21,
      transit_depth_ppm: 580,
      impact_parameter: 0.28,
      planet_radius_re: 1.61,
      equilibrium_temp_k: 270,
      snr: 42.6,
      star_teff_k: 4925,
      star_radius_rsun: 0.64,
      star_logg: 4.68,
      insolation_flux: 1.15
    },
    verified_notes: "Validated Kepler exoplanet. Clear U-shaped transit with no secondary eclipse or centroid shift."
  },
  {
    id: "KOI-072.01",
    name: "Kepler-10 b Analog (Ultra-short Rocky)",
    description: "Scorching iron-rich super-Earth orbiting close to host star",
    true_disposition: "CONFIRMED",
    data: {
      mission: "kepler",
      orbital_period: 0.837,
      transit_duration_hr: 1.81,
      transit_depth_ppm: 152,
      impact_parameter: 0.12,
      planet_radius_re: 1.47,
      equilibrium_temp_k: 2169,
      snr: 38.4,
      star_teff_k: 5627,
      star_radius_rsun: 1.06,
      star_logg: 4.35,
      insolation_flux: 3670
    },
    verified_notes: "Confirmed rocky planet. High SNR despite small shallow transit depth due to hundreds of observed transits."
  },
  {
    id: "KOI-115.01",
    name: "Sub-Neptune Candidate (Planetary Example)",
    description: "Benchmark Kepler candidate with high transit SNR and clean parameters",
    true_disposition: "CONFIRMED",
    data: {
      mission: "kepler",
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
    },
    verified_notes: "Benchmark case from the project plan. Sits squarely in the super-Earth/sub-Neptune category."
  },
  {
    id: "KOI-1234.01",
    name: "Eclipsing Binary Companion (False Alarm)",
    description: "Deep V-shaped transit with huge depth indicative of a grazing stellar companion",
    true_disposition: "FALSE POSITIVE",
    data: {
      mission: "kepler",
      orbital_period: 3.12,
      transit_duration_hr: 3.84,
      transit_depth_ppm: 34500, // 3.45% transit depth! Far too deep for planet
      impact_parameter: 0.88,
      planet_radius_re: 18.4,  // 18.4 Earth radii = stellar radius regime!
      equilibrium_temp_k: 1420,
      snr: 145.0,
      star_teff_k: 5890,
      star_radius_rsun: 1.02,
      star_logg: 4.42,
      insolation_flux: 680
    },
    verified_notes: "False positive: 34,500 ppm depth and 18.4 Earth radii imply an M-dwarf star eclipsing the primary star, not an exoplanet."
  },
  {
    id: "KOI-2842.01",
    name: "Grazing Binary / Off-Center Eclipse (False Alarm)",
    description: "High impact parameter grazing eclipse with inconsistent transit duration",
    true_disposition: "FALSE POSITIVE",
    data: {
      mission: "kepler",
      orbital_period: 15.42,
      transit_duration_hr: 1.15, // Unusually short duration for 15-day orbit
      transit_depth_ppm: 4200,
      impact_parameter: 1.25,   // Grazing geometry > 1.0
      planet_radius_re: 6.8,
      equilibrium_temp_k: 580,
      snr: 28.5,
      star_teff_k: 6150,
      star_radius_rsun: 1.28,
      star_logg: 4.22,
      insolation_flux: 19.4
    },
    verified_notes: "False positive: impact parameter b = 1.25 proves grazing eclipse geometry from a background binary."
  },
  {
    id: "KOI-5982.01",
    name: "Instrumental Noise Artefact (Low SNR)",
    description: "Faint candidate near Kepler detection threshold with inconsistent transit parameters",
    true_disposition: "FALSE POSITIVE",
    data: {
      mission: "kepler",
      orbital_period: 382.1,
      transit_duration_hr: 14.2,
      transit_depth_ppm: 85,
      impact_parameter: 0.65,
      planet_radius_re: 0.98,
      equilibrium_temp_k: 245,
      snr: 6.8,                 // Marginal signal-to-noise (< 7.1 sigma threshold)
      star_teff_k: 5740,
      star_radius_rsun: 1.01,
      star_logg: 4.44,
      insolation_flux: 0.95
    },
    verified_notes: "False positive: SNR 6.8 falls below Kepler's 7.1-sigma significance threshold. Rolling band noise artefact."
  },
  {
    id: "TOI-1233.02",
    name: "TESS Multi-Planet Candidate",
    description: "Sub-Neptune discovered by TESS orbiting bright solar-type star",
    true_disposition: "CONFIRMED",
    data: {
      mission: "tess",
      orbital_period: 14.175,
      transit_duration_hr: 3.42,
      transit_depth_ppm: 820,
      impact_parameter: 0.22,
      planet_radius_re: 2.72,
      equilibrium_temp_k: 712,
      snr: 29.4,
      star_teff_k: 5710,
      star_radius_rsun: 0.96,
      star_logg: 4.46,
      insolation_flux: 43.1
    },
    verified_notes: "Validated TESS planet (HD 108236 c). Clean box transit with ground-based radial velocity confirmation."
  },
  {
    id: "KOI-4005.01",
    name: "Earth-Size Habitable Zone Candidate",
    description: "Promising candidate in Kepler 1-year habitable zone orbit",
    true_disposition: "CANDIDATE",
    data: {
      mission: "kepler",
      orbital_period: 341.2,
      transit_duration_hr: 9.60,
      transit_depth_ppm: 110,
      impact_parameter: 0.35,
      planet_radius_re: 1.18,
      equilibrium_temp_k: 258,
      snr: 16.2,
      star_teff_k: 5580,
      star_radius_rsun: 0.94,
      star_logg: 4.51,
      insolation_flux: 1.02
    },
    verified_notes: "Unresolved candidate: High model probability of being an authentic Earth-analog transiting planet."
  }
];
