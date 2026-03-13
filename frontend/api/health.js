// GET /api/health — verifies PostgreSQL connectivity
import { getPool } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const result = await getPool().query('SELECT NOW() AS time');
    return res.status(200).json({ status: 'ok', db: 'connected', time: result.rows[0].time });
  } catch (err) {
    console.error('Health check failed:', err.message);
    return res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
}
