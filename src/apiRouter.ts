import { Router, Request, Response } from 'express';
import { classifyCandidate, validateClassifierInput } from './ml/classifier.ts';
import { computeHabitability, scorePlanetByName } from './ml/habitability.ts';
import { findPlanetByName, searchPlanets, KNOWN_PLANETS } from './data/planets.ts';
import { HELD_OUT_SAMPLES } from './data/samples.ts';
import { MODEL_METRICS } from './data/modelInfo.ts';
import { ClassifierInput } from './types.ts';

export const apiRouter = Router();

// 1. Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    models: {
      classifier: 'xgb-kepler-v1',
      habitability_engine: 'esi-kopparapu-v1',
      catalog_size: KNOWN_PLANETS.length
    }
  });
});

// 2. Classify candidate transit signal
apiRouter.post('/classify', (req: Request, res: Response) => {
  const body = req.body as Partial<ClassifierInput>;
  const validation = validateClassifierInput(body);
  if (!validation.valid) {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: validation.error
    });
  }

  try {
    const result = classifyCandidate(body as ClassifierInput);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Classification error', message: err.message });
  }
});

// 3. Held-out test set samples
apiRouter.get('/samples', (req: Request, res: Response) => {
  res.json(HELD_OUT_SAMPLES);
});

// 4. Autocomplete search
apiRouter.get('/search', (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  const limit = parseInt((req.query.limit as string) || '8', 10);
  const results = searchPlanets(q, limit);
  res.json(results);
});

// 5. Habitability score for named planet
apiRouter.get('/habitability', (req: Request, res: Response) => {
  const name = (req.query.name as string) || '';
  if (!name.trim()) {
    return res.status(400).json({ error: 'Missing parameter', message: "Query parameter 'name' is required" });
  }

  const planet = findPlanetByName(name);
  if (!planet) {
    const suggestions = searchPlanets(name, 5);
    return res.status(404).json({
      error: 'Planet Not Found',
      message: `Exoplanet "${name}" not found in current catalog.`,
      suggestions: suggestions.map(s => s.pl_name)
    });
  }

  const result = scorePlanetByName(planet);
  res.json(result);
});

// 6. Habitability score for manually entered parameters
apiRouter.post('/habitability', (req: Request, res: Response) => {
  const body = req.body;
  if (body.pl_rade == null || body.pl_rade <= 0) {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'pl_rade (planet radius in Earth radii) must be greater than 0'
    });
  }

  try {
    const result = computeHabitability(body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Scoring error', message: err.message });
  }
});

// 7. Model Card & Dataset stats
apiRouter.get('/model-info', (req: Request, res: Response) => {
  res.json(MODEL_METRICS);
});
