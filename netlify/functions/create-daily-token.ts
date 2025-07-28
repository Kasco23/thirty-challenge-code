import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
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
    const { room, user, isHost = false } = JSON.parse(event.body || "{}");

    if (!room || !user) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Room and user are required" }),
      };
    }

    // Create meeting token using Daily.co API
    const response = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          room_name: room,
          user_name: user,
          is_owner: isHost,
          enable_screenshare: isHost, // Only hosts can screenshare
          enable_recording: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Daily.co token API error:", error);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to create token" }),
      };
    }

    const tokenData = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        token: tokenData.token,
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
