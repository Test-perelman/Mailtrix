// GET /api/config — returns all config rows as { key: value }
// PUT /api/config — upserts one or more { key: value } pairs
import { getPool } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pool = getPool();

  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT key, value FROM config');
      const config = Object.fromEntries(result.rows.map(r => [r.key, r.value]));
      return res.status(200).json(config);
    } catch (err) {
      console.error('GET /api/config error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT') {
    const updates = req.body;
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ error: 'Body must be a { key: value } object' });
    }
    if (Object.keys(updates).length > 50) {
      return res.status(400).json({ error: 'Too many keys in a single PUT (max 50)' });
    }
    try {
      await Promise.all(
        Object.entries(updates).map(([key, value]) =>
          pool.query(
            `INSERT INTO config (key, value, updated_at) VALUES ($1, $2, NOW())
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
            [key, String(value)]
          )
        )
      );
      return res.status(200).json({ status: 'updated', keys: Object.keys(updates) });
    } catch (err) {
      console.error('PUT /api/config error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
