import { parseBackendResponse } from '../../../lib/api.js';

const API_BASE_URL =
  process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  const url = `${API_BASE_URL}/api/v1/trips`;

  if (req.method === 'POST') {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      const { data } = await parseBackendResponse(response);
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Failed to create trip', error);
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to create trip',
        logId: error.logId ?? error.payload?.logId ?? null,
        details: error.payload ?? null
      });
    }
    return;
  }

  try {
    const response = await fetch(url);
    const { data } = await parseBackendResponse(response);
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Failed to fetch trips', error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to fetch trips',
      logId: error.logId ?? error.payload?.logId ?? null,
      details: error.payload ?? null
    });
  }
}
