import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import tripsRouter from './routes/trips.js';
import locationsRouter from './routes/locations.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/trips', tripsRouter);
app.use('/api/locations', locationsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

const port = process.env.API_PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

export default app;
