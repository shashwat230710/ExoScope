/**
 * Core type definitions for ExoScope
 * NASA Exoplanet Classifier & Habitability Explorer
 */

export interface ClassifierInput {
  mission: 'kepler' | 'tess';
  orbital_period: number;       // days
  transit_duration_hr: number;  // hours
  transit_depth_ppm: number;    // parts per million
  impact_parameter: number;     // dimensionless (0 - 1.5)
  planet_radius_re: number;     // Earth radii
  equilibrium_temp_k: number;   // Kelvin
  snr: number;                  // model signal-to-noise
  star_teff_k: number;          // Kelvin
  star_radius_rsun: number;     // Solar radii
  star_logg: number;            // log10(cm/s^2)
  insolation_flux?: number;     // Earth flux units
}

export interface FeatureImpact {
  feature: string;
  name: string;
  impact: number;               // SHAP value (positive increases confirmed prob, negative decreases)
  value: number;
  unit: string;
  description: string;
}

export interface ClassifierResult {
  label: 'CONFIRMED' | 'FALSE POSITIVE';
  probability: number;          // Calibrated probability [0, 1]
  threshold: number;            // 0.50
  top_features: FeatureImpact[];
  model_version: string;
  confidence_level: 'High' | 'Moderate' | 'Low';
  astrophysical_summary: string;
}

export interface PlanetRecord {
  pl_name: string;
  hostname: string;
  pl_rade: number;              // Earth radii
  pl_bmasse?: number;           // Earth mass
  pl_dens?: number;             // g/cm^3
  pl_orbper: number;            // days
  pl_orbsmax: number;           // AU
  pl_eqt: number;               // K
  pl_insol: number;             // Earth flux units
  st_teff: number;              // K
  st_rad: number;               // Solar radii
  st_mass: number;              // Solar masses
  st_lum?: number;              // log10(L / L_sun)
  st_spectype?: string;         // e.g. "G2V", "M4V"
  sy_dist?: number;             // parsecs or light years
  disc_year: number;
  disc_facility: string;
  habitability_label?: string;  // e.g., "Earth-like candidate", "Gas Giant"
  description?: string;
}

export interface HabitabilityComponents {
  esi_global: number;           // Earth Similarity Index [0, 1]
  esi_interior: number;         // Radius & density component
  esi_surface: number;          // Escape velocity & temperature component
  hz_factor: number;            // Habitable zone factor [0, 1]
  rocky_factor: number;         // Rocky composition factor [0, 1]
  star_factor: number;          // Host star suitability factor [0, 1]
}

export interface HabitabilityResult {
  planet_name: string;
  hostname: string;
  score: number;                // 0 to 100
  score_range: [number, number];// [min, max] confidence interval
  band: 'Earth-like potential' | 'Promising' | 'Marginal' | 'Unlikely' | 'Hostile';
  band_color: string;
  band_description: string;
  components: HabitabilityComponents;
  hz_position: {
    zone: 'too_hot' | 'conservative_hz' | 'optimistic_hz' | 'too_cold';
    label: string;
    insolation: number;         // S in Earth units
    conservative_inner: number; // e.g. 1.10
    conservative_outer: number; // e.g. 0.36
    optimistic_inner: number;   // e.g. 1.80
    optimistic_outer: number;   // e.g. 0.32
    relative_position: number;  // 0 (outer cold) to 1 (inner hot)
  };
  estimated_fields: string[];
  planet_parameters: {
    radius_re: number;
    mass_me: number;
    density_gcm3: number;
    escape_vel_kms: number;
    orbit_period_days: number;
    semi_major_axis_au: number;
    eq_temp_k: number;
    insolation_flux: number;
  };
  star_parameters: {
    hostname: string;
    teff_k: number;
    radius_rsun: number;
    mass_msun: number;
    luminosity_lsun: number;
    spectral_type: string;
    distance_ly?: number;
  };
  earth_comparison: {
    property: string;
    planet_value: string;
    earth_value: string;
    ratio: string;
    status: 'similar' | 'higher' | 'lower' | 'extreme';
  }[];
  why_breakdown: {
    factor: string;
    score: number;
    weight: number;
    contribution: number;
    commentary: string;
  }[];
  model_version: string;
}

export interface HeldOutSample {
  id: string;
  name: string;
  description: string;
  true_disposition: 'CONFIRMED' | 'FALSE POSITIVE' | 'CANDIDATE';
  data: ClassifierInput;
  verified_notes: string;
}

export interface ModelMetrics {
  roc_auc: number;
  pr_auc: number;
  accuracy: number;
  f1_score: number;
  precision: number;
  recall: number;
  threshold: number;
  confusion_matrix: {
    true_positive: number;
    false_positive: number;
    true_negative: number;
    false_negative: number;
  };
  calibration_curve: {
    mean_predicted_prob: number;
    fraction_positives_uncalibrated: number;
    fraction_positives_calibrated: number;
  }[];
  feature_importance: {
    feature: string;
    name: string;
    importance: number;
    description: string;
  }[];
  training_summary: {
    model_name: string;
    version: string;
    training_set: string;
    samples_total: number;
    confirmed_count: number;
    false_positive_count: number;
    leakage_prevention: string;
    cv_strategy: string;
    last_trained: string;
  };
  candidate_leaderboard: {
    candidate_id: string;
    star_name: string;
    orbital_period: number;
    planet_radius: number;
    snr: number;
    ml_probability: number;
    status: string;
    notes: string;
  }[];
  dataset_stats: {
    total_confirmed_exoplanets: number;
    total_kepler_kois: number;
    total_tess_tois: number;
    discovery_methods: { method: string; count: number; percentage: number }[];
    yearly_discoveries: { year: number; count: number }[];
  };
}
