import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  if (!process.env.DAILY_API_KEY) {
    console.error("DAILY_API_KEY environment variable is missing");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Daily API key not configured" }),
    };
  }

  try {
    if (!process.env.DAILY_API_KEY) {
      console.error("DAILY_API_KEY environment variable is missing");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server configuration error" }),
      };
    }
    const { roomName, properties = {} } = JSON.parse(event.body || "{}");

    if (!roomName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Room name is required" }),
      };
    }

    // Create room using Daily.co API
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          max_participants: 10,
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          ...properties,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Daily.co API error:", error);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to create room" }),
      };
    }

    const room = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        roomName: room.name,
        url: room.url,
        created: room.created_at,
      }),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
