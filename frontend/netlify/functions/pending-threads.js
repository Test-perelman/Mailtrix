// Netlify serverless function to retrieve and consume pending thread updates
// GET /api/pending-threads - reads from Netlify Blobs and deletes consumed entries

import { getStore } from "@netlify/blobs";

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const store = getStore({ name: "mailtrix-threads", consistency: "strong" });
    const { blobs } = await store.list({ prefix: "pending_" });

    if (blobs.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updates: [], count: 0 })
      };
    }

    const updates = [];
    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: 'json' });
      if (data) {
        updates.push(data);
      }
      await store.delete(blob.key);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ updates, count: updates.length })
    };
  } catch (error) {
    console.error('Error fetching pending threads:', error);
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
