// Vercel serverless function to fetch thread history for a job
// GET /api/get-threads?job_id=JOB001

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jobId = req.query.job_id;

    if (!jobId) {
      return res.status(400).json({
        error: 'Missing parameter',
        message: 'job_id query parameter is required'
      });
    }

    console.log('Fetching threads for job:', jobId);

    const n8nThreadsUrl = process.env.N8N_GET_THREADS_URL;

    if (n8nThreadsUrl) {
      const response = await fetch(`${n8nThreadsUrl}?job_id=${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.APPROVAL_API_KEY || '',
        },
      });

      if (response.ok) {
        const threads = await response.json();
        return res.status(200).json({
          status: 'success',
          job_id: jobId,
          threads: threads.messages || [],
          count: threads.messages?.length || 0,
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      job_id: jobId,
      threads: [],
      count: 0,
      message: 'No n8n endpoint configured. Using client-side storage.',
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
