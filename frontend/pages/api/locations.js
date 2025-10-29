import { parseBackendResponse } from '../../lib/api.js';

const API_BASE_URL =
  process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  const url = `${API_BASE_URL}/api/v1/locations`;

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
      console.error('Failed to create location', error);
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to create location',
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
    console.error('Failed to fetch locations', error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to fetch locations',
      logId: error.logId ?? error.payload?.logId ?? null,
      details: error.payload ?? null
    });
  }
}
