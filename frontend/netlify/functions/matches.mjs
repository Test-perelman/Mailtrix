// Netlify V2 function to receive job matches from n8n
// POST /api/matches - stores data in Netlify Blobs

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method === "OPTIONS") {
    return new Response("", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const jobMatch = await req.json();

    if (!jobMatch.job_id || !jobMatch.candidates) {
      return Response.json(
        { error: "Invalid payload", message: "job_id and candidates are required" },
        { status: 400 }
      );
    }

    const store = getStore({ name: "mailtrix-matches", consistency: "strong" });
    const key = `pending_${Date.now()}_${jobMatch.job_id}`;
    await store.setJSON(key, jobMatch);

    console.log("Stored job match in Blobs:", jobMatch.job_id, "key:", key);

    return Response.json({
      status: "received",
      job_id: jobMatch.job_id,
      candidates_count: jobMatch.candidates?.length || 0,
      timestamp: new Date().toISOString(),
      message: "Job match received and stored. Dashboard will display it shortly.",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return Response.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
};

export const config = {
  path: "/api/matches",
};
