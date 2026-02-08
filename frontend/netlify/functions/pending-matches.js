// Netlify V2 function to retrieve and consume pending job matches
// GET /api/pending-matches - reads from Netlify Blobs and deletes consumed entries

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method === "OPTIONS") {
    return new Response("", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const store = getStore({ name: "mailtrix-matches", consistency: "strong" });
    const { blobs } = await store.list({ prefix: "pending_" });

    if (blobs.length === 0) {
      return Response.json({ matches: [], count: 0 });
    }

    const matches = [];
    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: "json" });
      if (data) {
        matches.push(data);
      }
      await store.delete(blob.key);
    }

    return Response.json({ matches, count: matches.length });
  } catch (error) {
    console.error("Error fetching pending matches:", error);
    return Response.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
};

export const config = {
  path: "/api/pending-matches",
};
