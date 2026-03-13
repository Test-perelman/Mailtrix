// GET /api/threads?job_id=<id>
// Fetches all thread messages for a job, then marks them as read
// and resets unread_count on the job.
import { getPool } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { job_id } = req.query;
  if (!job_id) return res.status(400).json({ error: 'job_id is required' });

  const pool = getPool();
  try {
    const result = await pool.query(
      `SELECT * FROM thread_messages WHERE job_id = $1 ORDER BY sent_at ASC`,
      [job_id]
    );

    // Mark all messages read + reset unread count (fire-and-forget is fine)
    await Promise.all([
      pool.query(`UPDATE thread_messages SET is_read = TRUE WHERE job_id = $1`, [job_id]),
      pool.query(`UPDATE job_matches SET unread_count = 0 WHERE job_id = $1`, [job_id]),
    ]);

    return res.status(200).json({ messages: result.rows });
  } catch (err) {
    console.error('GET /api/threads error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
