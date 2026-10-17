import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyCandidate, validateClassifierInput } from './src/ml/classifier.ts';
import { computeHabitability, scorePlanetByName } from './src/ml/habitability.ts';
import { findPlanetByName, searchPlanets, KNOWN_PLANETS } from './src/data/planets.ts';
import { HELD_OUT_SAMPLES } from './src/data/samples.ts';
import { MODEL_METRICS } from './src/data/modelInfo.ts';
import { ClassifierInput } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // 1. Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
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

  // 2. Classify endpoint (POST /api/classify)
  app.post('/api/classify', (req: Request, res: Response) => {
    const body = req.body as Partial<ClassifierInput>;
    const validation = validateClassifierInput(body);
    if (!validation.valid) {
      return res.status(422).json({
        error: "Unprocessable Entity",
        message: validation.error
      });
    }

    try {
      const result = classifyCandidate(body as ClassifierInput);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Classification error", message: err.message });
    }
  });

  // 3. Held-out test set samples (GET /api/samples)
  app.get('/api/samples', (req: Request, res: Response) => {
    res.json(HELD_OUT_SAMPLES);
  });

  // 4. Autocomplete search (GET /api/search?q=)
  app.get('/api/search', (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string || '8', 10);
    const results = searchPlanets(q, limit);
    res.json(results);
  });

  // 5. Habitability score for named planet (GET /api/habitability?name=)
  app.get('/api/habitability', (req: Request, res: Response) => {
    const name = (req.query.name as string) || '';
    if (!name.trim()) {
      return res.status(400).json({ error: "Missing parameter", message: "Query parameter 'name' is required" });
    }

    const planet = findPlanetByName(name);
    if (!planet) {
      const suggestions = searchPlanets(name, 5);
      return res.status(404).json({
        error: "Planet Not Found",
        message: `Exoplanet "${name}" not found in current catalog.`,
        suggestions: suggestions.map(s => s.pl_name)
      });
    }

    const result = scorePlanetByName(planet);
    res.json(result);
  });

  // 6. Score for manually entered parameters (POST /api/habitability)
  app.post('/api/habitability', (req: Request, res: Response) => {
    const body = req.body;
    if (body.pl_rade == null || body.pl_rade <= 0) {
      return res.status(422).json({
        error: "Unprocessable Entity",
        message: "pl_rade (planet radius in Earth radii) must be greater than 0"
      });
    }

    try {
      const result = computeHabitability(body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Scoring error", message: err.message });
    }
  });

  // 7. Model Card & Dataset stats (GET /api/model-info)
  app.get('/api/model-info', (req: Request, res: Response) => {
    res.json(MODEL_METRICS);
  });

  // Dev vs Prod Vite Integration
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ExoScope backend server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
