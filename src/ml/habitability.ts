/**
 * Habitability Potential Engine
 * Implements physics-based Earth Similarity Index (ESI), Kopparapu et al. (2013)
 * Habitable Zone flux boundaries, rocky composition thresholds, and stellar stability.
 */

import { HabitabilityResult, HabitabilityComponents, PlanetRecord } from '../types.ts';

/**
 * Single-property ESI component:
 * ESI_x = (1 - |x - x0| / (x + x0))^(w/n)
 */
function computePropertyESI(x: number, x0: number, w: number, n: number): number {
  if (x <= 0 || x0 <= 0) return 0;
  const ratio = Math.abs(x - x0) / (x + x0);
  if (ratio >= 1.0) return 0;
  return Math.pow(1 - ratio, w / n);
}

/**
 * Kopparapu et al. (2013) Habitable Zone Factor
 * Conservative limits: S in [0.36, 1.10] Earth units -> 1.0
 * Optimistic limits: S in [0.32, 1.80] Earth units -> Smooth falloff to 0
 */
function computeHZFactor(insol: number, starTeff: number): { factor: number; zone: HabitabilityResult['hz_position'] } {
  // Star temperature shifts the habitable zone limits slightly:
  // For hotter stars, peak emission is bluer, raising inner runaway limit.
  // We use baseline Kopparapu bounds:
  const consInner = 1.10; // Runaway greenhouse (hot boundary)
  const consOuter = 0.36; // Maximum greenhouse (cold boundary)
  const optInner = 1.80;  // Recent Venus
  const optOuter = 0.32;  // Early Mars

  let factor = 0;
  let zoneType: 'too_hot' | 'conservative_hz' | 'optimistic_hz' | 'too_cold' = 'too_cold';
  let zoneLabel = "";

  if (insol > optInner) {
    // Too hot (beyond optimistic inner edge)
    factor = Math.max(0, 0.05 * Math.exp(-(insol - optInner) / 2.0));
    zoneType = 'too_hot';
    zoneLabel = "Too Hot (Interior to Habitable Zone)";
  } else if (insol > consInner) {
    // Optimistic inner zone (between 1.10 and 1.80)
    // Smooth transition from 1.0 down to 0.1
    const t = (optInner - insol) / (optInner - consInner); // 0 at 1.80, 1 at 1.10
    factor = 0.1 + 0.9 * Math.sin((t * Math.PI) / 2);
    zoneType = 'optimistic_hz';
    zoneLabel = "Optimistic Habitable Zone (Warm Edge)";
  } else if (insol >= consOuter) {
    // Conservative prime habitable zone
    factor = 1.0;
    zoneType = 'conservative_hz';
    zoneLabel = "Conservative Habitable Zone (Prime)";
  } else if (insol >= optOuter) {
    // Optimistic outer zone (between 0.32 and 0.36)
    const t = (insol - optOuter) / (consOuter - optOuter); // 0 at 0.32, 1 at 0.36
    factor = 0.2 + 0.8 * Math.sin((t * Math.PI) / 2);
    zoneType = 'optimistic_hz';
    zoneLabel = "Optimistic Habitable Zone (Cold Edge)";
  } else {
    // Too cold (outer freeze out)
    factor = Math.max(0, 0.1 * Math.exp(-(optOuter - insol) / 0.5));
    zoneType = 'too_cold';
    zoneLabel = "Too Cold (Beyond Habitable Zone)";
  }

  // Normalize relative position: 0 = far outer cold, 0.5 = center HZ, 1.0 = inner scorch
  // Logarithmic scale for wide flux ranges
  const logInsol = Math.log10(Math.max(0.01, insol));
  const minLog = Math.log10(0.1); // 0.1 S_earth
  const maxLog = Math.log10(10.0); // 10 S_earth
  const relativePos = Math.min(1, Math.max(0, (logInsol - minLog) / (maxLog - minLog)));

  return {
    factor: Math.min(1.0, Math.max(0, factor)),
    zone: {
      zone: zoneType,
      label: zoneLabel,
      insolation: insol,
      conservative_inner: consInner,
      conservative_outer: consOuter,
      optimistic_inner: optInner,
      optimistic_outer: optOuter,
      relative_position: relativePos
    }
  };
}

/**
 * Rocky Size Factor:
 * Planets <= 1.6 R_earth are predominantly rocky (Fulton gap).
 * Transition between 1.6 and 2.0 R_earth.
 * > 2.0 R_earth have dense volatile / H-He envelopes.
 */
function computeRockyFactor(radiusRe: number): number {
  if (radiusRe <= 1.6) {
    return 1.0;
  } else if (radiusRe <= 2.0) {
    // Gentle decline from 1.0 to 0.2
    const t = (radiusRe - 1.6) / (2.0 - 1.6);
    return 1.0 - 0.8 * (0.5 - 0.5 * Math.cos(t * Math.PI));
  } else if (radiusRe <= 3.0) {
    return Math.max(0.02, 0.2 * Math.exp(-(radiusRe - 2.0) * 2.0));
  } else {
    return 0.01; // Gas giants
  }
}

/**
 * Stellar Suitability Factor:
 * Evaluates host star stability, lifetime, and flaring.
 * Sun-like G & early K dwarfs (4800K - 6000K) are best (1.0).
 * Mid-M dwarfs have severe flare activity and UV erosion (0.75 - 0.90).
 * Massive hot stars (>6500K) live < 2-3 Gyr, insufficient for complex life.
 */
function computeStarFactor(teffK: number): number {
  if (teffK >= 4800 && teffK <= 6000) {
    return 1.0; // Sun-like G and K dwarfs
  } else if (teffK >= 3800 && teffK < 4800) {
    return 0.95; // Early K dwarfs (astronomers consider orange dwarfs the absolute sweet spot)
  } else if (teffK >= 3000 && teffK < 3800) {
    return 0.82; // M-dwarfs (flares, coronal mass ejections, tidal locking risk)
  } else if (teffK >= 2400 && teffK < 3000) {
    return 0.70; // Ultra-cool M dwarfs (like TRAPPIST-1)
  } else if (teffK > 6000 && teffK <= 6800) {
    return 0.75; // F-type stars (shorter lifetime)
  } else if (teffK > 6800) {
    return Math.max(0.1, 0.75 * Math.exp(-(teffK - 6800) / 1500)); // A/B giants
  } else {
    return 0.5;
  }
}

/**
 * Estimates mass from radius using Chen & Kipping (2017) mass-radius relation
 */
export function estimateMassFromRadius(radiusRe: number): number {
  if (radiusRe <= 1.23) {
    // Terran rocky regime
    return Math.pow(radiusRe, 3.28);
  } else if (radiusRe <= 2.0) {
    // Super-Earth / Small sub-Neptune
    return 1.30 * Math.pow(radiusRe, 1.7);
  } else if (radiusRe <= 4.0) {
    // Sub-Neptune
    return 1.43 * Math.pow(radiusRe, 1.7);
  } else {
    // Jovian / gas giant regime
    return Math.min(3000, 317.8 * Math.pow(radiusRe / 11.2, 0.5));
  }
}

export function computeHabitability(params: {
  pl_name?: string;
  hostname?: string;
  pl_rade: number;
  pl_bmasse?: number;
  pl_dens?: number;
  pl_orbper?: number;
  pl_orbsmax?: number;
  pl_eqt?: number;
  pl_insol?: number;
  st_teff?: number;
  st_rad?: number;
  st_mass?: number;
  st_lum?: number;
  st_spectype?: string;
  sy_dist?: number;
}): HabitabilityResult {
  const estimatedFields: string[] = [];

  const name = params.pl_name || "Custom Exoplanet";
  const hostname = params.hostname || "Host Star";
  const radius = Math.max(0.05, params.pl_rade);
  
  // 1. Mass estimation if missing
  let mass = params.pl_bmasse;
  if (mass == null || mass <= 0) {
    mass = estimateMassFromRadius(radius);
    estimatedFields.push("Mass (estimated via Chen-Kipping mass-radius relation)");
  }

  // 2. Density computation
  // Earth density = 5.51 g/cm^3.
  // Density in Earth units: rho_rel = mass / (radius^3)
  // rho_cgs = rho_rel * 5.51
  let density = params.pl_dens;
  if (density == null || density <= 0) {
    const rhoRel = mass / Math.pow(radius, 3);
    density = rhoRel * 5.51;
    estimatedFields.push("Density (derived from mass and radius volume)");
  }
  const densityEarthUnits = density / 5.51;

  // 3. Escape velocity in Earth units
  // v_esc / v_esc_earth = sqrt(M / R)
  // Earth v_esc = 11.19 km/s
  const vescEarthUnits = Math.sqrt(mass / radius);
  const vescKms = vescEarthUnits * 11.19;

  // 4. Stellar properties
  const starTeff = params.st_teff || 5500;
  const starRad = params.st_rad || 1.0;
  const starMass = params.st_mass || 1.0;
  
  // Stellar Luminosity: L / L_sun = (R / R_sun)^2 * (T / T_sun)^4
  let starLum = 1.0;
  if (params.st_lum != null) {
    starLum = Math.pow(10, params.st_lum); // Convert log10(L/L_sun) to linear
  } else {
    starLum = Math.pow(starRad, 2) * Math.pow(starTeff / 5778, 4);
  }

  // 5. Semi-major axis (AU)
  let sma = params.pl_orbsmax;
  if (sma == null || sma <= 0) {
    if (params.pl_orbper != null && params.pl_orbper > 0) {
      // Kepler's 3rd Law: a^3 = M_star * P_yr^2
      const periodYr = params.pl_orbper / 365.25;
      sma = Math.cbrt(starMass * periodYr * periodYr);
      estimatedFields.push("Semi-major axis (calculated via Kepler's 3rd Law)");
    } else {
      sma = 1.0;
    }
  }

  // 6. Insolation Flux S (Earth units)
  let insol = params.pl_insol;
  if (insol == null || insol <= 0) {
    // S = L_star / a^2
    insol = starLum / Math.pow(sma, 2);
    estimatedFields.push("Insolation flux (calculated from stellar luminosity and orbit)");
  }

  // 7. Equilibrium Temperature (K)
  // T_eq = 255 K * (S)^0.25 (assuming Earth-like albedo A = 0.3)
  let eqTemp = params.pl_eqt;
  if (eqTemp == null || eqTemp <= 0) {
    eqTemp = Math.round(255 * Math.pow(Math.max(0.001, insol), 0.25));
    estimatedFields.push("Equilibrium temperature (derived from stellar insolation)");
  }

  // --- Compute Exact Formulations from PDF ---

  // (a) ESI:
  // Interior ESI: radius (w=0.57) & density (w=1.07), n=2
  const esiRadius = computePropertyESI(radius, 1.0, 0.57, 2);
  const esiDensity = computePropertyESI(densityEarthUnits, 1.0, 1.07, 2);
  const esiInterior = Math.sqrt(esiRadius * esiDensity);

  // Surface ESI: escape velocity (w=0.70) & eq temperature (w=5.58), n=2
  const esiVesc = computePropertyESI(vescEarthUnits, 1.0, 0.70, 2);
  const esiTemp = computePropertyESI(eqTemp, 255.0, 5.58, 2);
  const esiSurface = Math.sqrt(esiVesc * esiTemp);

  // Global ESI
  const esiGlobal = Math.sqrt(esiInterior * esiSurface);

  // (b) Habitable-Zone Factor
  const hzData = computeHZFactor(insol, starTeff);
  const hzFactor = hzData.factor;

  // (c) Rocky-Size Factor
  const rockyFactor = computeRockyFactor(radius);

  // (d) Stellar Suitability Factor
  const starFactor = computeStarFactor(starTeff);

  // Step 3: Combine into one score (0 to 100)
  // score = 100 * (0.40 * ESI + 0.35 * HZ_factor + 0.15 * rocky_factor + 0.10 * star_factor)
  const rawScore = 100 * (
    0.40 * esiGlobal +
    0.35 * hzFactor +
    0.15 * rockyFactor +
    0.10 * starFactor
  );

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Uncertainty range when fields are estimated
  const uncertaintySpread = estimatedFields.length > 0 ? Math.min(12, estimatedFields.length * 4) : 2;
  const scoreRange: [number, number] = [
    Math.max(0, Math.round(finalScore - uncertaintySpread)),
    Math.min(100, Math.round(finalScore + uncertaintySpread))
  ];

  // Band classification
  let band: HabitabilityResult['band'] = 'Hostile';
  let bandColor = '#F87171'; // Red/Rose
  let bandDescription = 'Extreme conditions far from Earth-like standards.';

  if (finalScore >= 80) {
    band = 'Earth-like potential';
    bandColor = '#34D399'; // Emerald
    bandDescription = 'Rocky terrestrial size, situated comfortably within circumstellar habitable zone with Earth-like insolation and equilibrium temperature.';
  } else if (finalScore >= 60) {
    band = 'Promising';
    bandColor = '#5EEAD4'; // Teal
    bandDescription = 'Mostly favorable habitability conditions with one or two milder variances or uncertainties in composition.';
  } else if (finalScore >= 40) {
    band = 'Marginal';
    bandColor = '#FBBF24'; // Amber
    bandDescription = 'Possesses isolated Earth-like traits but suffers from significant limitations such as extreme insolation, non-optimal radius, or harsh stellar environment.';
  } else if (finalScore >= 20) {
    band = 'Unlikely';
    bandColor = '#FB923C'; // Orange
    bandDescription = 'Environmental conditions diverge considerably from terrestrial life prerequisites.';
  } else {
    band = 'Hostile';
    bandColor = '#F87171'; // Red
    bandDescription = 'Hostile regime (e.g. scorching hot Jupiter, tidal lava world, or deep frozen void).';
  }

  // Why this score breakdown:
  const whyBreakdown = [
    {
      factor: "Earth Similarity Index (ESI)",
      score: Math.round(esiGlobal * 100),
      weight: 40,
      contribution: Math.round(0.40 * esiGlobal * 100),
      commentary: `Interior ESI: ${(esiInterior * 100).toFixed(0)}%, Surface ESI: ${(esiSurface * 100).toFixed(0)}% based on radius (${radius.toFixed(2)} R⊕), density (${density.toFixed(2)} g/cm³), and temperature (${eqTemp} K).`
    },
    {
      factor: "Habitable Zone Factor",
      score: Math.round(hzFactor * 100),
      weight: 35,
      contribution: Math.round(0.35 * hzFactor * 100),
      commentary: `Stellar insolation is ${insol.toFixed(2)} S⊕. ${hzData.zone.label}.`
    },
    {
      factor: "Rocky Composition Factor",
      score: Math.round(rockyFactor * 100),
      weight: 15,
      contribution: Math.round(0.15 * rockyFactor * 100),
      commentary: radius <= 1.6
        ? `Terrestrial radius (${radius.toFixed(2)} R⊕ <= 1.6 R⊕) strongly favors a solid rocky crust.`
        : `Radius (${radius.toFixed(2)} R⊕) enters the volatile-rich sub-Neptune or Jovian gas envelope regime.`
    },
    {
      factor: "Stellar Suitability Factor",
      score: Math.round(starFactor * 100),
      weight: 10,
      contribution: Math.round(0.10 * starFactor * 100),
      commentary: `Host star Teff is ${starTeff} K (${params.st_spectype || 'Main Sequence'}). Moderate flaring and stellar lifespan constraints accounted for.`
    }
  ];

  // Earth comparison table
  const earthComparison = [
    {
      property: "Radius",
      planet_value: `${radius.toFixed(2)} R⊕`,
      earth_value: "1.00 R⊕",
      ratio: `${(radius / 1.0).toFixed(2)}x`,
      status: Math.abs(radius - 1.0) < 0.25 ? 'similar' : radius > 2.0 ? 'extreme' : radius > 1.0 ? 'higher' : 'lower'
    },
    {
      property: "Mass",
      planet_value: `${mass.toFixed(2)} M⊕`,
      earth_value: "1.00 M⊕",
      ratio: `${(mass / 1.0).toFixed(2)}x`,
      status: Math.abs(mass - 1.0) < 0.5 ? 'similar' : mass > 10.0 ? 'extreme' : mass > 1.0 ? 'higher' : 'lower'
    },
    {
      property: "Density",
      planet_value: `${density.toFixed(2)} g/cm³`,
      earth_value: "5.51 g/cm³",
      ratio: `${(density / 5.51).toFixed(2)}x`,
      status: Math.abs(densityEarthUnits - 1.0) < 0.25 ? 'similar' : 'higher'
    },
    {
      property: "Orbital Period",
      planet_value: params.pl_orbper ? `${params.pl_orbper.toFixed(1)} days` : `${(sma * 365).toFixed(0)} days`,
      earth_value: "365.3 days",
      ratio: params.pl_orbper ? `${(params.pl_orbper / 365.25).toFixed(2)}x` : `${sma.toFixed(2)}x`,
      status: 'similar'
    },
    {
      property: "Equilibrium Temp",
      planet_value: `${eqTemp} K`,
      earth_value: "255 K",
      ratio: `${(eqTemp / 255).toFixed(2)}x`,
      status: Math.abs(eqTemp - 255) < 30 ? 'similar' : eqTemp > 350 ? 'extreme' : eqTemp > 255 ? 'higher' : 'lower'
    },
    {
      property: "Stellar Insolation",
      planet_value: `${insol.toFixed(2)} S⊕`,
      earth_value: "1.00 S⊕",
      ratio: `${insol.toFixed(2)}x`,
      status: Math.abs(insol - 1.0) < 0.3 ? 'similar' : insol > 3.0 ? 'extreme' : insol > 1.0 ? 'higher' : 'lower'
    },
    {
      property: "Host Star Teff",
      planet_value: `${starTeff} K (${params.st_spectype || 'Dwarf'})`,
      earth_value: "5,778 K (G2V)",
      ratio: `${(starTeff / 5778).toFixed(2)}x`,
      status: Math.abs(starTeff - 5778) < 800 ? 'similar' : starTeff < 3500 ? 'lower' : 'higher'
    }
  ] as HabitabilityResult['earth_comparison'];

  return {
    planet_name: name,
    hostname: hostname,
    score: finalScore,
    score_range: scoreRange,
    band: band,
    band_color: bandColor,
    band_description: bandDescription,
    components: {
      esi_global: Math.round(esiGlobal * 1000) / 1000,
      esi_interior: Math.round(esiInterior * 1000) / 1000,
      esi_surface: Math.round(esiSurface * 1000) / 1000,
      hz_factor: Math.round(hzFactor * 1000) / 1000,
      rocky_factor: Math.round(rockyFactor * 1000) / 1000,
      star_factor: Math.round(starFactor * 1000) / 1000
    },
    hz_position: hzData.zone,
    estimated_fields: estimatedFields,
    planet_parameters: {
      radius_re: Math.round(radius * 100) / 100,
      mass_me: Math.round(mass * 100) / 100,
      density_gcm3: Math.round(density * 100) / 100,
      escape_vel_kms: Math.round(vescKms * 10) / 10,
      orbit_period_days: Math.round((params.pl_orbper || 365) * 10) / 10,
      semi_major_axis_au: Math.round(sma * 1000) / 1000,
      eq_temp_k: eqTemp,
      insolation_flux: Math.round(insol * 100) / 100
    },
    star_parameters: {
      hostname: hostname,
      teff_k: starTeff,
      radius_rsun: Math.round(starRad * 100) / 100,
      mass_msun: Math.round(starMass * 100) / 100,
      luminosity_lsun: Math.round(starLum * 1000) / 1000,
      spectral_type: params.st_spectype || (starTeff > 6000 ? "F-type" : starTeff > 5200 ? "G-type" : starTeff > 3700 ? "K-type" : "M-dwarf"),
      distance_ly: params.sy_dist
    },
    earth_comparison: earthComparison,
    why_breakdown: whyBreakdown,
    model_version: "esi-kopparapu-v1"
  };
}

/**
 * Score a known planet by looking it up in the catalog
 */
export function scorePlanetByName(planet: PlanetRecord): HabitabilityResult {
  return computeHabitability({
    pl_name: planet.pl_name,
    hostname: planet.hostname,
    pl_rade: planet.pl_rade,
    pl_bmasse: planet.pl_bmasse,
    pl_dens: planet.pl_dens,
    pl_orbper: planet.pl_orbper,
    pl_orbsmax: planet.pl_orbsmax,
    pl_eqt: planet.pl_eqt,
    pl_insol: planet.pl_insol,
    st_teff: planet.st_teff,
    st_rad: planet.st_rad,
    st_mass: planet.st_mass,
    st_lum: planet.st_lum,
    st_spectype: planet.st_spectype,
    sy_dist: planet.sy_dist
  });
}
