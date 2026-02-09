// Vercel serverless function to retrieve and consume pending thread updates
// GET /api/pending-threads

import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const keys = await redis.keys('threads:pending_*');

    if (keys.length === 0) {
      return res.status(200).json({ updates: [], count: 0 });
    }

    // Get all values in a pipeline
    const getPipeline = redis.pipeline();
    for (const key of keys) {
      getPipeline.get(key);
    }
    const results = await getPipeline.exec();

    // Delete all consumed keys in a pipeline
    const delPipeline = redis.pipeline();
    for (const key of keys) {
      delPipeline.del(key);
    }
    await delPipeline.exec();

    const updates = results
      .filter(Boolean)
      .map(r => typeof r === 'string' ? JSON.parse(r) : r);

    return res.status(200).json({ updates, count: updates.length });
  } catch (error) {
    console.error('Error fetching pending threads:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
