// Netlify serverless function to receive thread updates from n8n
// POST /api/thread-update - stores in Netlify Blobs

import { getStore } from "@netlify/blobs";

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body);

    if (!payload.job_id || !payload.message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Invalid payload',
          message: 'job_id and message are required'
        })
      };
    }

    const { message } = payload;
    if (!message.id || !message.direction || !message.body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Invalid message structure',
          message: 'message must include id, direction, and body'
        })
      };
    }

    // Store in Netlify Blobs
    const store = getStore({ name: "mailtrix-threads", consistency: "strong" });
    const key = `pending_${Date.now()}_${payload.job_id}_${message.id}`;
    await store.setJSON(key, payload);

    console.log('Stored thread update in Blobs:', payload.job_id, 'message:', message.id);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'received',
        job_id: payload.job_id,
        message_id: message.id,
        timestamp: new Date().toISOString(),
        message: 'Thread update received and stored.'
      })
    };
  } catch (error) {
    console.error('Error processing thread update:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
}
