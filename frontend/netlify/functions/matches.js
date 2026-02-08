// Netlify serverless function to receive job matches from n8n
// POST /api/matches - stores data in Netlify Blobs for frontend to pick up

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

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const jobMatch = JSON.parse(event.body);

    // Validate required fields
    if (!jobMatch.job_id || !jobMatch.candidates) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Invalid payload',
          message: 'job_id and candidates are required'
        })
      };
    }

    // Store in Netlify Blobs with strong consistency so frontend can read immediately
    const store = getStore({ name: "mailtrix-matches", consistency: "strong" });
    const key = `pending_${Date.now()}_${jobMatch.job_id}`;
    await store.setJSON(key, jobMatch);

    console.log('Stored job match in Blobs:', jobMatch.job_id, 'key:', key);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'received',
        job_id: jobMatch.job_id,
        candidates_count: jobMatch.candidates?.length || 0,
        timestamp: new Date().toISOString(),
        message: 'Job match received and stored. Dashboard will display it shortly.'
      })
    };
  } catch (error) {
    console.error('Error processing request:', error);
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
