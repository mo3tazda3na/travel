import { parseBackendResponse } from '../../../lib/api.js';

const API_BASE_URL =
  process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  const { id } = req.query;
  const url = `${API_BASE_URL}/api/v1/trips/${id}`;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const response = await fetch(url);
    const { data } = await parseBackendResponse(response);
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`Failed to fetch trip ${id}`, error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to fetch trip',
      logId: error.logId ?? error.payload?.logId ?? null,
      details: error.payload ?? null
    });
  }
}
