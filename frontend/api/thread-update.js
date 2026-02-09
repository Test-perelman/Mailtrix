// Vercel serverless function to receive thread updates from n8n
// POST /api/thread-update - stores in Upstash Redis

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
    const payload = req.body;

    if (!payload.job_id || !payload.message) {
      return res.status(400).json({
        error: 'Invalid payload',
        message: 'job_id and message are required'
      });
    }

    const { message } = payload;
    if (!message.id || !message.direction || !message.body) {
      return res.status(400).json({
        error: 'Invalid message structure',
        message: 'message must include id, direction, and body'
      });
    }

    const key = `threads:pending_${Date.now()}_${payload.job_id}_${message.id}`;
    await redis.set(key, JSON.stringify(payload));

    console.log('Stored thread update in Redis:', payload.job_id, 'message:', message.id);

    return res.status(200).json({
      status: 'received',
      job_id: payload.job_id,
      message_id: message.id,
      timestamp: new Date().toISOString(),
      message: 'Thread update received and stored.'
    });
  } catch (error) {
    console.error('Error processing thread update:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
