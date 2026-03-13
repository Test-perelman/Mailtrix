// POST /api/thread-update — called by n8n to record an inbound or outbound message.
// Bumps job_matches.updated_at so incremental polling detects the change.
import { getPool } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { job_id, message } = req.body || {};
  if (!job_id || !message) {
    return res.status(400).json({ error: 'job_id and message are required' });
  }
  // message.id is required for idempotency — n8n should always send a Gmail message_id
  if (!message.id) {
    return res.status(400).json({ error: 'message.id is required' });
  }

  const pool = getPool();
  try {
    // Upsert message — idempotent via partial unique index on message_id WHERE NOT NULL
    const insertResult = await pool.query(
      `INSERT INTO thread_messages
         (message_id, job_id, direction, from_email, to_email, body, is_read, sent_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (message_id) WHERE message_id IS NOT NULL DO NOTHING`,
      [
        message.id,
        job_id,
        message.direction || 'inbound',
        message.from_email || null,
        message.to_email || null,
        message.body || '',
        false,
        message.sent_at || new Date().toISOString(),
      ]
    );

    // Only update counters if a new row was actually inserted (not a duplicate)
    if (insertResult.rowCount === 0) {
      return res.status(200).json({ status: 'ok', note: 'duplicate message_id, skipped' });
    }

    // Update job counters and bump updated_at so polling detects this
    if (message.direction === 'inbound') {
      await pool.query(
        `UPDATE job_matches
         SET unread_count = unread_count + 1,
             thread_count = thread_count + 1,
             updated_at   = NOW()
         WHERE job_id = $1`,
        [job_id]
      );
    } else {
      await pool.query(
        `UPDATE job_matches
         SET thread_count = thread_count + 1,
             updated_at   = NOW()
         WHERE job_id = $1`,
        [job_id]
      );
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('POST /api/thread-update error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
