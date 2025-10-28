const API_BASE_URL =
  process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  const { id } = req.query;
  const url = `${API_BASE_URL}/api/trips/${id}`;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`Failed to fetch trip ${id}`, error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
}
