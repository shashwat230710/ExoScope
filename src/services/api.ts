/**
 * API Client for ExoScope
 * Interacts with backend FastAPI/Express REST endpoints with resilient fallbacks
 */

import { ClassifierInput, ClassifierResult, HabitabilityResult, HeldOutSample, ModelMetrics } from '../types.ts';
import { classifyCandidate } from '../ml/classifier.ts';
import { computeHabitability, scorePlanetByName } from '../ml/habitability.ts';
import { findPlanetByName, searchPlanets } from '../data/planets.ts';
import { HELD_OUT_SAMPLES } from '../data/samples.ts';
import { MODEL_METRICS } from '../data/modelInfo.ts';

const BASE_URL = '';

export async function fetchHealth(): Promise<{ status: string; models: any }> {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }
  return { status: 'healthy', models: { classifier: 'xgb-kepler-v1', habitability: 'esi-kopparapu-v1' } };
}

export async function classifyTransit(params: ClassifierInput): Promise<ClassifierResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Backend API request failed, executing client-side ML engine:", e);
  }
  // Local fallback
  return classifyCandidate(params);
}

export async function fetchSamples(): Promise<HeldOutSample[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/samples`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Using bundled test set samples:", e);
  }
  return HELD_OUT_SAMPLES;
}

export async function searchPlanetNames(query: string): Promise<{ pl_name: string; hostname: string; label?: string }[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // fallback
  }
  return searchPlanets(query, 8);
}

export async function fetchHabitabilityByName(name: string): Promise<HabitabilityResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/habitability?name=${encodeURIComponent(name)}`);
    if (res.ok) {
      return await res.json();
    }
    if (res.status === 404) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Exoplanet "${name}" not found.`);
    }
  } catch (e: any) {
    if (e.message && e.message.includes("not found")) {
      throw e;
    }
    console.warn("Using local habitability engine fallback:", e);
  }
  const planet = findPlanetByName(name);
  if (!planet) {
    throw new Error(`Exoplanet "${name}" not found in catalog.`);
  }
  return scorePlanetByName(planet);
}

export async function scoreManualHabitability(params: any): Promise<HabitabilityResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/habitability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Using client-side habitability calculation:", e);
  }
  return computeHabitability(params);
}

export async function fetchModelInfo(): Promise<ModelMetrics> {
  try {
    const res = await fetch(`${BASE_URL}/api/model-info`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // fallback
  }
  return MODEL_METRICS;
}
