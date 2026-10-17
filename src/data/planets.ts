/**
 * Curated NASA Exoplanet Archive (PSCompPars) Catalog
 * Includes real physical, orbital, and stellar measurements from NASA IPAC Caltech
 */

import { PlanetRecord } from '../types.ts';

export const KNOWN_PLANETS: PlanetRecord[] = [
  {
    pl_name: "Earth",
    hostname: "Sun",
    pl_rade: 1.0,
    pl_bmasse: 1.0,
    pl_dens: 5.51,
    pl_orbper: 365.256,
    pl_orbsmax: 1.0,
    pl_eqt: 255, // Equilibrium temperature without greenhouse effect
    pl_insol: 1.0,
    st_teff: 5778,
    st_rad: 1.0,
    st_mass: 1.0,
    st_lum: 0.0, // log10(L/L_sun)
    st_spectype: "G2V",
    sy_dist: 0.0,
    disc_year: 0,
    disc_facility: "Solar System",
    habitability_label: "Known Habitable Reference",
    description: "Our home world and the sole confirmed life-bearing planet. Serves as calibration baseline (Score 100)."
  },
  {
    pl_name: "Kepler-452 b",
    hostname: "Kepler-452",
    pl_rade: 1.63,
    pl_bmasse: 5.0, // Estimated via Chen-Kipping / RV constraints
    pl_dens: 6.32,
    pl_orbper: 384.84,
    pl_orbsmax: 1.046,
    pl_eqt: 265,
    pl_insol: 1.11,
    st_teff: 5757,
    st_rad: 1.11,
    st_mass: 1.04,
    st_lum: 0.12,
    st_spectype: "G2V",
    sy_dist: 1780,
    disc_year: 2015,
    disc_facility: "Kepler",
    habitability_label: "Super-Earth in Habitable Zone",
    description: "Often dubbed 'Earth's older cousin', orbiting a Sun-like G2V star at a distance that puts it in the conservative habitable zone."
  },
  {
    pl_name: "TRAPPIST-1 e",
    hostname: "TRAPPIST-1",
    pl_rade: 0.92,
    pl_bmasse: 0.69,
    pl_dens: 5.65,
    pl_orbper: 6.10,
    pl_orbsmax: 0.029,
    pl_eqt: 251,
    pl_insol: 0.66,
    st_teff: 2566,
    st_rad: 0.12,
    st_mass: 0.09,
    st_lum: -3.28,
    st_spectype: "M8V",
    sy_dist: 39.5,
    disc_year: 2017,
    disc_facility: "Spitzer / TRAPPIST",
    habitability_label: "Temperate Rocky World",
    description: "One of the most Earth-like rocky planets known, possessing Earth-like density and receiving 66% of Earth's solar radiation in the prime habitable zone."
  },
  {
    pl_name: "TRAPPIST-1 f",
    hostname: "TRAPPIST-1",
    pl_rade: 1.04,
    pl_bmasse: 1.04,
    pl_dens: 5.22,
    pl_orbper: 9.21,
    pl_orbsmax: 0.038,
    pl_eqt: 219,
    pl_insol: 0.38,
    st_teff: 2566,
    st_rad: 0.12,
    st_mass: 0.09,
    st_lum: -3.28,
    st_spectype: "M8V",
    sy_dist: 39.5,
    disc_year: 2017,
    disc_facility: "Spitzer / TRAPPIST",
    habitability_label: "Cold Temperate Planet",
    description: "Located near the outer edge of TRAPPIST-1's habitable zone. A dense atmosphere could support liquid surface water."
  },
  {
    pl_name: "TRAPPIST-1 d",
    hostname: "TRAPPIST-1",
    pl_rade: 0.78,
    pl_bmasse: 0.39,
    pl_dens: 4.49,
    pl_orbper: 4.05,
    pl_orbsmax: 0.022,
    pl_eqt: 288,
    pl_insol: 1.14,
    st_teff: 2566,
    st_rad: 0.12,
    st_mass: 0.09,
    st_lum: -3.28,
    st_spectype: "M8V",
    sy_dist: 39.5,
    disc_year: 2016,
    disc_facility: "TRAPPIST",
    habitability_label: "Warm Rocky Planet",
    description: "Small sub-Earth orbiting at the inner boundary of the TRAPPIST-1 habitable zone with moderate insolation flux."
  },
  {
    pl_name: "Proxima Centauri b",
    hostname: "Proxima Centauri",
    pl_rade: 1.07,
    pl_bmasse: 1.17,
    pl_dens: 5.33,
    pl_orbper: 11.18,
    pl_orbsmax: 0.048,
    pl_eqt: 234,
    pl_insol: 0.65,
    st_teff: 3042,
    st_rad: 0.15,
    st_mass: 0.12,
    st_lum: -3.05,
    st_spectype: "M5.5V",
    sy_dist: 4.24,
    disc_year: 2016,
    disc_facility: "ESO 3.6m / HARPS",
    habitability_label: "Nearest Habitable Candidate",
    description: "The closest known exoplanet to Earth, located in the habitable zone of our solar system's nearest stellar neighbor."
  },
  {
    pl_name: "TOI-700 d",
    hostname: "TOI-700",
    pl_rade: 1.14,
    pl_bmasse: 1.72,
    pl_dens: 5.80,
    pl_orbper: 37.42,
    pl_orbsmax: 0.163,
    pl_eqt: 269,
    pl_insol: 0.86,
    st_teff: 3480,
    st_rad: 0.42,
    st_mass: 0.41,
    st_lum: -1.65,
    st_spectype: "M2V",
    sy_dist: 101.4,
    disc_year: 2020,
    disc_facility: "TESS",
    habitability_label: "Earth-Sized in Habitable Zone",
    description: "TESS mission's benchmark discovery: an Earth-sized rocky candidate in the conservative habitable zone of a quiet M-dwarf star."
  },
  {
    pl_name: "TOI-700 e",
    hostname: "TOI-700",
    pl_rade: 0.95,
    pl_bmasse: 0.82,
    pl_dens: 5.31,
    pl_orbper: 27.81,
    pl_orbsmax: 0.134,
    pl_eqt: 273,
    pl_insol: 1.27,
    st_teff: 3480,
    st_rad: 0.42,
    st_mass: 0.41,
    st_lum: -1.65,
    st_spectype: "M2V",
    sy_dist: 101.4,
    disc_year: 2023,
    disc_facility: "TESS",
    habitability_label: "Optimistic HZ Planet",
    description: "A 95% Earth-size planet orbiting in the optimistic habitable zone of TOI-700 between planets c and d."
  },
  {
    pl_name: "Kepler-186 f",
    hostname: "Kepler-186",
    pl_rade: 1.17,
    pl_bmasse: 1.44,
    pl_dens: 5.12,
    pl_orbper: 129.94,
    pl_orbsmax: 0.432,
    pl_eqt: 188,
    pl_insol: 0.32,
    st_teff: 3755,
    st_rad: 0.52,
    st_mass: 0.54,
    st_lum: -1.32,
    st_spectype: "M1V",
    sy_dist: 580,
    disc_year: 2014,
    disc_facility: "Kepler",
    habitability_label: "First Earth-Sized HZ Planet",
    description: "The historic first validated Earth-size planet found in the habitable zone of another star, receiving about a third of Earth's sunlight."
  },
  {
    pl_name: "Kepler-22 b",
    hostname: "Kepler-22",
    pl_rade: 2.38,
    pl_bmasse: 9.1,
    pl_dens: 3.82,
    pl_orbper: 289.86,
    pl_orbsmax: 0.849,
    pl_eqt: 262,
    pl_insol: 1.10,
    st_teff: 5518,
    st_rad: 0.98,
    st_mass: 0.97,
    st_lum: -0.10,
    st_spectype: "G5V",
    sy_dist: 635,
    disc_year: 2011,
    disc_facility: "Kepler",
    habitability_label: "Sub-Neptune / Ocean World",
    description: "Kepler's first habitable-zone exoplanet discovery. At 2.38 Earth radii, it likely harbors a volatile-rich or water-dominated mantle."
  },
  {
    pl_name: "LHS 1140 b",
    hostname: "LHS 1140",
    pl_rade: 1.73,
    pl_bmasse: 5.60,
    pl_dens: 5.90,
    pl_orbper: 24.74,
    pl_orbsmax: 0.094,
    pl_eqt: 235,
    pl_insol: 0.50,
    st_teff: 3216,
    st_rad: 0.21,
    st_mass: 0.18,
    st_lum: -2.53,
    st_spectype: "M4.5V",
    sy_dist: 48.8,
    disc_year: 2017,
    disc_facility: "MEarth Project",
    habitability_label: "Super-Earth / Water World",
    description: "A prime target for JWST atmospheric transmission spectroscopy, sitting squarely in the middle of its red dwarf star's habitable zone."
  },
  {
    pl_name: "Kepler-442 b",
    hostname: "Kepler-442",
    pl_rade: 1.34,
    pl_bmasse: 2.36,
    pl_dens: 5.48,
    pl_orbper: 112.31,
    pl_orbsmax: 0.409,
    pl_eqt: 233,
    pl_insol: 0.70,
    st_teff: 4402,
    st_rad: 0.60,
    st_mass: 0.61,
    st_lum: -0.92,
    st_spectype: "K5V",
    sy_dist: 1193,
    disc_year: 2015,
    disc_facility: "Kepler",
    habitability_label: "Orange Dwarf Habitable Candidate",
    description: "Highly rated in planetary habitability metrics due to its rocky radius and favorable illumination from an ultra-stable K-dwarf host star."
  },
  {
    pl_name: "Kepler-62 f",
    hostname: "Kepler-62",
    pl_rade: 1.41,
    pl_bmasse: 2.8,
    pl_dens: 5.50,
    pl_orbper: 267.29,
    pl_orbsmax: 0.718,
    pl_eqt: 208,
    pl_insol: 0.41,
    st_teff: 4925,
    st_rad: 0.64,
    st_mass: 0.69,
    st_lum: -0.67,
    st_spectype: "K2V",
    sy_dist: 981,
    disc_year: 2013,
    disc_facility: "Kepler",
    habitability_label: "Outer Habitable Zone Super-Earth",
    description: "An outer habitable-zone super-Earth orbiting an older K-dwarf. Could sustain surface water with carbon dioxide greenhouse warming."
  },
  {
    pl_name: "Kepler-1649 c",
    hostname: "Kepler-1649",
    pl_rade: 1.06,
    pl_bmasse: 1.20,
    pl_dens: 5.58,
    pl_orbper: 19.54,
    pl_orbsmax: 0.082,
    pl_eqt: 234,
    pl_insol: 0.75,
    st_teff: 3240,
    st_rad: 0.23,
    st_mass: 0.20,
    st_lum: -2.35,
    st_spectype: "M5V",
    sy_dist: 301,
    disc_year: 2020,
    disc_facility: "Kepler",
    habitability_label: "Earth-Size Habitable Twin",
    description: "Identified in re-analyzed Kepler archival data; has 1.06x Earth radius and receives 75% of Earth's solar radiation."
  },
  {
    pl_name: "K2-18 b",
    hostname: "K2-18",
    pl_rade: 2.61,
    pl_bmasse: 8.63,
    pl_dens: 2.67,
    pl_orbper: 32.94,
    pl_orbsmax: 0.159,
    pl_eqt: 255,
    pl_insol: 1.23,
    st_teff: 3503,
    st_rad: 0.41,
    st_mass: 0.36,
    st_lum: -1.68,
    st_spectype: "M2.5V",
    sy_dist: 124,
    disc_year: 2015,
    disc_facility: "K2",
    habitability_label: "Hycean World Candidate",
    description: "Detected to have methane and carbon dioxide in its atmosphere by JWST; postulated to be a Hycean world with a global ocean under a hydrogen atmosphere."
  },
  {
    pl_name: "Gliese 667 C c",
    hostname: "GJ 667 C",
    pl_rade: 1.54,
    pl_bmasse: 3.80,
    pl_dens: 5.75,
    pl_orbper: 28.14,
    pl_orbsmax: 0.125,
    pl_eqt: 277,
    pl_insol: 0.88,
    st_teff: 3350,
    st_rad: 0.38,
    st_mass: 0.33,
    st_lum: -1.87,
    st_spectype: "M1.5V",
    sy_dist: 23.6,
    disc_year: 2011,
    disc_facility: "HARPS",
    habitability_label: "Triple-Star System Super-Earth",
    description: "Orbits in the habitable zone of red dwarf GJ 667 C, which itself is part of a spectacular triple-star system."
  },
  {
    pl_name: "Ross 128 b",
    hostname: "Ross 128",
    pl_rade: 1.11,
    pl_bmasse: 1.40,
    pl_dens: 5.60,
    pl_orbper: 9.87,
    pl_orbsmax: 0.049,
    pl_eqt: 280,
    pl_insol: 1.38,
    st_teff: 3192,
    st_rad: 0.20,
    st_mass: 0.17,
    st_lum: -2.44,
    st_spectype: "M4V",
    sy_dist: 11.0,
    disc_year: 2017,
    disc_facility: "HARPS",
    habitability_label: "Quiet Red Dwarf Exoplanet",
    description: "Just 11 light-years away, its host star is inactive and un-flaring, making it one of the most benign red dwarf environments known."
  },
  {
    pl_name: "Wolf 1061 c",
    hostname: "Wolf 1061",
    pl_rade: 1.66,
    pl_bmasse: 3.41,
    pl_dens: 4.10,
    pl_orbper: 17.87,
    pl_orbsmax: 0.089,
    pl_eqt: 223,
    pl_insol: 0.72,
    st_teff: 3342,
    st_rad: 0.31,
    st_mass: 0.29,
    st_lum: -2.14,
    st_spectype: "M3V",
    sy_dist: 14.1,
    disc_year: 2015,
    disc_facility: "HARPS",
    habitability_label: "Nearby Super-Earth",
    description: "Orbits within the habitable zone of red dwarf star Wolf 1061, approximately 14 light years from Earth."
  },
  {
    pl_name: "LP 890-9 c",
    hostname: "LP 890-9",
    pl_rade: 1.37,
    pl_bmasse: 2.50,
    pl_dens: 5.35,
    pl_orbper: 8.46,
    pl_orbsmax: 0.040,
    pl_eqt: 272,
    pl_insol: 0.91,
    st_teff: 2871,
    st_rad: 0.16,
    st_mass: 0.12,
    st_lum: -2.85,
    st_spectype: "M6V",
    sy_dist: 105,
    disc_year: 2022,
    disc_facility: "SPECULOOS / TESS",
    habitability_label: "SPECULOOS Habitable Discovery",
    description: "A super-Earth around a very cool M6 dwarf, receiving stellar radiation closely matching Earth's solar insolation."
  },
  {
    pl_name: "Kepler-1229 b",
    hostname: "Kepler-1229",
    pl_rade: 1.40,
    pl_bmasse: 2.70,
    pl_dens: 5.43,
    pl_orbper: 86.83,
    pl_orbsmax: 0.301,
    pl_eqt: 213,
    pl_insol: 0.49,
    st_teff: 3784,
    st_rad: 0.51,
    st_mass: 0.54,
    st_lum: -1.33,
    st_spectype: "M0V",
    sy_dist: 865,
    disc_year: 2016,
    disc_facility: "Kepler",
    habitability_label: "Sub-Earth in Red Dwarf HZ",
    description: "Validated rocky exoplanet orbiting within the circumstellar habitable zone of an early red dwarf star."
  },
  // Extreme / Non-Habitable Comparisons for Model Robustness
  {
    pl_name: "WASP-12 b",
    hostname: "WASP-12",
    pl_rade: 19.38, // 1.73 Jupiter radii = 19.4 Earth radii
    pl_bmasse: 467.0, // 1.47 Jupiter masses
    pl_dens: 0.33,
    pl_orbper: 1.09,
    pl_orbsmax: 0.023,
    pl_eqt: 2580,
    pl_insol: 7420,
    st_teff: 6300,
    st_rad: 1.63,
    st_mass: 1.43,
    st_lum: 0.49,
    st_spectype: "F8V",
    sy_dist: 1410,
    disc_year: 2008,
    disc_facility: "SuperWASP",
    habitability_label: "Ultra-Hot Jupiter",
    description: "An ultra-hot gas giant orbiting so close to its star that tidal gravitational forces are stretching it into an egg shape (Score near 0)."
  },
  {
    pl_name: "HD 209458 b",
    hostname: "HD 209458",
    pl_rade: 15.46, // 1.38 R_Jup
    pl_bmasse: 232.0, // 0.73 M_Jup
    pl_dens: 0.37,
    pl_orbper: 3.52,
    pl_orbsmax: 0.047,
    pl_eqt: 1450,
    pl_insol: 1010,
    st_teff: 6065,
    st_rad: 1.20,
    st_mass: 1.15,
    st_lum: 0.22,
    st_spectype: "G0V",
    sy_dist: 159,
    disc_year: 1999,
    disc_facility: "Keck / Haute-Provence",
    habitability_label: "Archetypal Hot Jupiter",
    description: "The famous 'Osiris' exoplanet, the first known transiting exoplanet with an evaporating hydrogen atmosphere."
  },
  {
    pl_name: "55 Cancri e",
    hostname: "55 Cancri",
    pl_rade: 1.87,
    pl_bmasse: 7.99,
    pl_dens: 6.66,
    pl_orbper: 0.74,
    pl_orbsmax: 0.015,
    pl_eqt: 1950,
    pl_insol: 2450,
    st_teff: 5196,
    st_rad: 0.94,
    st_mass: 0.91,
    st_lum: -0.15,
    st_spectype: "G8V",
    sy_dist: 41.0,
    disc_year: 2004,
    disc_facility: "McDonald Observatory",
    habitability_label: "Ultra-Short-Period Lava World",
    description: "A scorching super-Earth orbiting in just 18 hours with a molten silicate surface magma ocean."
  },
  {
    pl_name: "HD 189733 b",
    hostname: "HD 189733",
    pl_rade: 12.6,
    pl_bmasse: 362.0,
    pl_dens: 0.96,
    pl_orbper: 2.22,
    pl_orbsmax: 0.031,
    pl_eqt: 1200,
    pl_insol: 480,
    st_teff: 5040,
    st_rad: 0.81,
    st_mass: 0.85,
    st_lum: -0.42,
    st_spectype: "K0V",
    sy_dist: 64.5,
    disc_year: 2005,
    disc_facility: "Haute-Provence",
    habitability_label: "Cobalt Blue Gas Giant",
    description: "A deep azure-blue gas giant where winds howl at 8,700 km/h and rain consists of molten glass (silicates)."
  },
  {
    pl_name: "GJ 1214 b",
    hostname: "GJ 1214",
    pl_rade: 2.74,
    pl_bmasse: 8.17,
    pl_dens: 2.20,
    pl_orbper: 1.58,
    pl_orbsmax: 0.014,
    pl_eqt: 596,
    pl_insol: 21.0,
    st_teff: 3250,
    st_rad: 0.22,
    st_mass: 0.18,
    st_lum: -2.38,
    st_spectype: "M4.5V",
    sy_dist: 48.0,
    disc_year: 2009,
    disc_facility: "MEarth",
    habitability_label: "Warm Water-World / Mini-Neptune",
    description: "A prototypical sub-Neptune enveloped by an opaque, high-altitude haze or dense water-vapor steam atmosphere."
  },
  {
    pl_name: "Kepler-16 b",
    hostname: "Kepler-16",
    pl_rade: 8.45,
    pl_bmasse: 105.0,
    pl_dens: 0.96,
    pl_orbper: 228.78,
    pl_orbsmax: 0.705,
    pl_eqt: 170,
    pl_insol: 0.37,
    st_teff: 4450,
    st_rad: 0.65,
    st_mass: 0.69,
    st_lum: -0.74,
    st_spectype: "K / M Binary",
    sy_dist: 245,
    disc_year: 2011,
    disc_facility: "Kepler",
    habitability_label: "Circumbinary 'Tatooine' World",
    description: "First confirmed circumbinary planet orbiting two stars. While a gas giant, hypothetical moons might enjoy dual sunsets."
  }
];

/**
 * Normalizes planet names for robust lookup:
 * removes hyphens, spaces, converts to lowercase.
 * "Kepler-452b", "kepler 452 b", "Kepler452b" -> "kepler452b"
 */
export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[-\s_]/g, '').trim();
}

/**
 * Autocomplete / search lookup for planet names
 */
export function searchPlanets(query: string, limit = 8): { pl_name: string; hostname: string; label?: string }[] {
  if (!query || query.trim().length === 0) {
    return KNOWN_PLANETS.slice(0, limit).map(p => ({
      pl_name: p.pl_name,
      hostname: p.hostname,
      label: p.habitability_label
    }));
  }

  const cleanQuery = normalizeName(query);

  // Exact or prefix matches
  const directMatches = KNOWN_PLANETS.filter(p => {
    const normPl = normalizeName(p.pl_name);
    const normHost = normalizeName(p.hostname);
    return normPl.includes(cleanQuery) || normHost.includes(cleanQuery);
  });

  if (directMatches.length > 0) {
    return directMatches.slice(0, limit).map(p => ({
      pl_name: p.pl_name,
      hostname: p.hostname,
      label: p.habitability_label
    }));
  }

  // Fuzzy fallback: check character overlap or Levenshtein-like similarity
  const scored = KNOWN_PLANETS.map(p => {
    const normPl = normalizeName(p.pl_name);
    let score = 0;
    for (const char of cleanQuery) {
      if (normPl.includes(char)) score += 1;
    }
    return { planet: p, similarity: score / Math.max(cleanQuery.length, normPl.length) };
  })
  .filter(item => item.similarity > 0.4)
  .sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, limit).map(item => ({
    pl_name: item.planet.pl_name,
    hostname: item.planet.hostname,
    label: item.planet.habitability_label
  }));
}

/**
 * Look up exact or fuzzy planet record
 */
export function findPlanetByName(name: string): PlanetRecord | null {
  if (!name) return null;
  const target = normalizeName(name);

  // 1. Direct normalized match
  const exact = KNOWN_PLANETS.find(p => normalizeName(p.pl_name) === target);
  if (exact) return exact;

  // 2. Check if host star was searched (e.g. "TRAPPIST-1", "Kepler-452")
  const hostMatch = KNOWN_PLANETS.find(p => normalizeName(p.hostname) === target);
  if (hostMatch) return hostMatch;

  // 3. Partial match (e.g. "452b" -> "Kepler-452 b", "proxima" -> "Proxima Centauri b")
  const partial = KNOWN_PLANETS.find(p => {
    const norm = normalizeName(p.pl_name);
    return norm.includes(target) || target.includes(norm);
  });
  if (partial) return partial;

  return null;
}
