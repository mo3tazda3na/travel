import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import { sendSuccess } from './interfaces/http/utils/response.js';

import apiV1Router from './interfaces/http/routes/v1/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok' });
});

app.use('/api/v1', apiV1Router);
app.use('/api', apiV1Router);

app.use((err, _req, res, _next) => {
  const logId = err.logId || randomUUID();
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${logId}]`, err);
  }

  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';
  const status = Number.isInteger(err.status) ? err.status : 500;
  const response = {
    logId,
    success: false,
    status,
    code:
      err.code ||
      (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'UNEXPECTED_ERROR'),
    message:
      !isProduction || status < 500
        ? err.message || 'Something went wrong'
        : 'Internal server error',
    data: !isProduction || status < 500 ? (err.data ?? null) : null,
  };

  if (!isProduction) {
    response.src = err.src || `${env}:err:middleware`;
  }

  if (!isProduction && err.stack) {
    response.debug = { stack: err.stack };
  }

  res.status(status).json(response);
});

const port = process.env.API_PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

export default app;
