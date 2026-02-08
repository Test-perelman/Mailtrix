// Netlify V2 function to fetch thread history for a job
// GET /api/get-threads?job_id=JOB001

export default async (req, context) => {
  if (req.method === "OPTIONS") {
    return new Response("", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("job_id");

    if (!jobId) {
      return Response.json(
        { error: "Missing parameter", message: "job_id query parameter is required" },
        { status: 400 }
      );
    }

    console.log("Fetching threads for job:", jobId);

    const n8nThreadsUrl = Netlify.env.get("N8N_GET_THREADS_URL");

    if (n8nThreadsUrl) {
      const response = await fetch(`${n8nThreadsUrl}?job_id=${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": Netlify.env.get("APPROVAL_API_KEY") || "",
        },
      });

      if (response.ok) {
        const threads = await response.json();
        return Response.json({
          status: "success",
          job_id: jobId,
          threads: threads.messages || [],
          count: threads.messages?.length || 0,
        });
      }
    }

    return Response.json({
      status: "success",
      job_id: jobId,
      threads: [],
      count: 0,
      message: "No n8n endpoint configured. Using client-side storage.",
    });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return Response.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
};

export const config = {
  path: "/api/get-threads",
};
