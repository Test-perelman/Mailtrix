// /api/matches
// POST  — receive new job match from n8n (upsert)
// GET   — load matches for dashboard (?since=ISO&limit=N)
// PATCH — batch update candidate statuses / sent_at
// POST {_type:'status_update'} — sendBeacon path (same as PATCH)

import { getPool } from './_db.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
};

export default async function handler(req, res) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pool = getPool();

  // ── POST ──────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body = req.body || {};

    // sendBeacon sends POST; detect batch-save payload by _type field
    if (body._type === 'status_update') {
      return handleBatchUpdate(pool, body.updates, res);
    }

    // Normal n8n inbound match upsert
    const {
      job_id, job_title, job_location, recruiter_email, recruiter_name,
      received_at, required_skills, min_experience, candidates,
    } = body;

    if (!job_id || !Array.isArray(candidates)) {
      return res.status(400).json({ error: 'job_id and candidates are required' });
    }

    try {
      await pool.query(
        `INSERT INTO job_matches
           (job_id, job_title, job_location, recruiter_email, recruiter_name,
            received_at, required_skills, min_experience, candidates, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
         ON CONFLICT (job_id) DO UPDATE SET
           job_title       = EXCLUDED.job_title,
           job_location    = EXCLUDED.job_location,
           recruiter_email = EXCLUDED.recruiter_email,
           recruiter_name  = EXCLUDED.recruiter_name,
           received_at     = EXCLUDED.received_at,
           required_skills = EXCLUDED.required_skills,
           min_experience  = EXCLUDED.min_experience,
           candidates      = EXCLUDED.candidates,
           updated_at      = NOW()`,
        [
          job_id, job_title, job_location, recruiter_email, recruiter_name,
          received_at || new Date().toISOString(),
          JSON.stringify(required_skills || []),
          min_experience || null,
          JSON.stringify(candidates),
        ]
      );
      return res.status(200).json({
        status: 'received',
        job_id,
        candidates_count: candidates.length,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('POST /api/matches error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── GET ───────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const since = req.query.since;

    // Validate since
    if (since && isNaN(Date.parse(since))) {
      return res.status(400).json({ error: '`since` must be a valid ISO timestamp' });
    }

    // Safe limit
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);

    try {
      let result;
      if (since) {
        result = await pool.query(
          `SELECT * FROM job_matches WHERE updated_at > $1 ORDER BY updated_at ASC LIMIT $2`,
          [since, limit]
        );
      } else {
        result = await pool.query(
          `SELECT * FROM job_matches ORDER BY created_at DESC LIMIT $1`,
          [limit]
        );
      }

      // Always use MAX(updated_at) across all returned rows as the bookmark.
      // This is critical for the initial (no `since`) load: rows are sorted by
      // created_at DESC, so the last row is the oldest — its updated_at may be
      // earlier than a recently-modified row near the top. Using MAX ensures the
      // first incremental poll does not miss any updates.
      const last_updated_at =
        result.rows.length > 0
          ? result.rows.reduce(
              (max, r) => (r.updated_at > max ? r.updated_at : max),
              result.rows[0].updated_at
            )
          : since || new Date().toISOString();

      return res.status(200).json({ matches: result.rows, last_updated_at });
    } catch (err) {
      console.error('GET /api/matches error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PATCH ─────────────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    return handleBatchUpdate(pool, req.body?.updates, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleBatchUpdate(pool, updates, res) {
  if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'updates must be a non-empty object' });
  }

  try {
    const promises = Object.entries(updates).map(([job_id, fields]) => {
      const setClauses = [];
      const values = [];

      if (fields.candidates !== undefined) {
        setClauses.push(`candidates = $${values.length + 1}`);
        values.push(JSON.stringify(fields.candidates));
      }
      if (fields.sent_at !== undefined) {
        setClauses.push(`sent_at = $${values.length + 1}`);
        values.push(fields.sent_at);
      }

      // Skip if no meaningful fields were provided
      if (setClauses.length === 0) return Promise.resolve();

      setClauses.push('updated_at = NOW()');
      values.push(job_id); // always last

      return pool.query(
        `UPDATE job_matches SET ${setClauses.join(', ')} WHERE job_id = $${values.length}`,
        values
      );
    });

    await Promise.all(promises);
    return res.status(200).json({ status: 'updated', count: Object.keys(updates).length });
  } catch (err) {
    console.error('PATCH /api/matches error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
