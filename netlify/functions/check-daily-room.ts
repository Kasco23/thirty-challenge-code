import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!process.env.DAILY_API_KEY) {
    console.error('DAILY_API_KEY environment variable is missing');
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Daily API key not configured',
        code: 'MISSING_API_KEY',
      }),
    };
  }

  try {
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        }),
      };
    }

    const { roomName } = requestBody;

    if (!roomName) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Room name is required',
          code: 'MISSING_ROOM_NAME',
        }),
      };
    }

    // Check if room exists using Daily.co API
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          exists: false,
          roomName,
        }),
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      console.error('Daily.co API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        roomName,
      });

      return {
        statusCode: response.status >= 500 ? 502 : response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Failed to check room status',
          code: 'CHECK_FAILED',
          details: errorData,
        }),
      };
    }

    const room = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        exists: true,
        roomName: room.name,
        url: room.url,
        created: room.created_at,
        config: room.config,
        participants: room.participants || [],
      }),
    };
  } catch (error) {
    console.error('Check room function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};