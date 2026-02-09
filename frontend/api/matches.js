// Vercel serverless function to receive job matches from n8n
// POST /api/matches - stores data in Upstash Redis

import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jobMatch = req.body;

    if (!jobMatch.job_id || !jobMatch.candidates) {
      return res.status(400).json({
        error: 'Invalid payload',
        message: 'job_id and candidates are required'
      });
    }

    const key = `matches:pending_${Date.now()}_${jobMatch.job_id}`;
    await redis.set(key, JSON.stringify(jobMatch));

    console.log('Stored job match in Redis:', jobMatch.job_id, 'key:', key);

    return res.status(200).json({
      status: 'received',
      job_id: jobMatch.job_id,
      candidates_count: jobMatch.candidates?.length || 0,
      timestamp: new Date().toISOString(),
      message: 'Job match received and stored. Dashboard will display it shortly.'
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
