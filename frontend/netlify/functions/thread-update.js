// Netlify V2 function to receive thread updates from n8n
// POST /api/thread-update - stores in Netlify Blobs

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
    const payload = await req.json();

    if (!payload.job_id || !payload.message) {
      return Response.json(
        { error: "Invalid payload", message: "job_id and message are required" },
        { status: 400 }
      );
    }

    const { message } = payload;
    if (!message.id || !message.direction || !message.body) {
      return Response.json(
        { error: "Invalid message structure", message: "message must include id, direction, and body" },
        { status: 400 }
      );
    }

    const store = getStore({ name: "mailtrix-threads", consistency: "strong" });
    const key = `pending_${Date.now()}_${payload.job_id}_${message.id}`;
    await store.setJSON(key, payload);

    console.log("Stored thread update in Blobs:", payload.job_id, "message:", message.id);

    return Response.json({
      status: "received",
      job_id: payload.job_id,
      message_id: message.id,
      timestamp: new Date().toISOString(),
      message: "Thread update received and stored.",
    });
  } catch (error) {
    console.error("Error processing thread update:", error);
    return Response.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
};

export const config = {
  path: "/api/thread-update",
};
