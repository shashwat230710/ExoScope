import express from 'express';
import { apiRouter } from '../src/apiRouter.ts';

const app = express();
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

// Support both /api/* and root rewrites on Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
