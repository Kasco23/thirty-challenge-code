import type { Handler } from '@netlify/functions';

// Enhanced Daily.co token generation with comprehensive error handling and validation
export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Validate environment configuration
  if (!process.env.DAILY_API_KEY) {
    console.error('DAILY_API_KEY environment variable is missing');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Daily API key not configured',
        code: 'MISSING_API_KEY'
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        }),
      };
    }

    const { room, user, isHost = false, isObserver = false } = requestBody;

    // Validate required parameters
    if (!room || !user) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Room and user are required',
          code: 'MISSING_PARAMETERS',
          required: ['room', 'user']
        }),
      };
    }

    // Validate parameter types and lengths
    if (typeof room !== 'string' || typeof user !== 'string') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Room and user must be strings',
          code: 'INVALID_PARAMETER_TYPE'
        }),
      };
    }

    if (room.length > 200 || user.length > 200) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Room and user names too long (max 200 characters)',
          code: 'PARAMETER_TOO_LONG'
        }),
      };
    }

    // Create meeting token using Daily.co API with enhanced error handling
    const tokenRequest = {
      properties: {
        room_name: room.trim(),
        user_name: user.trim(),
        is_owner: Boolean(isHost),
        enable_screenshare: Boolean(isHost && !isObserver),
        enable_recording: false,
        start_video_off: Boolean(isObserver),
        start_audio_off: Boolean(isObserver),
        exp: Math.round(Date.now() / 1000) + 3600, // Token expires in 1 hour
      },
    };

    console.log('Creating Daily.co token for:', { room: room.trim(), user: user.trim(), isHost, isObserver });

    const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenRequest),
    });

    // Enhanced response handling
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      console.error('Daily.co token API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        request: tokenRequest
      });

      // Map common Daily.co errors to user-friendly messages
      const errorMessage = (() => {
        if (response.status === 401) return 'Invalid Daily.co API key';
        if (response.status === 403) return 'Access denied to Daily.co API';
        if (response.status === 404) return 'Daily.co room not found';
        if (response.status === 429) return 'Too many requests to Daily.co API';
        if (errorData?.info?.includes('invalid property')) return `Invalid property: ${errorData.info}`;
        return `Daily.co API error: ${errorData?.error || errorText || response.statusText}`;
      })();

      return {
        statusCode: response.status >= 500 ? 502 : response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: errorMessage,
          code: 'DAILY_API_ERROR',
          status: response.status,
          details: errorData
        }),
      };
    }

    const tokenData = await response.json();

    if (!tokenData.token) {
      console.error('Daily.co API returned no token:', tokenData);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Daily.co API did not return a token',
          code: 'NO_TOKEN_RETURNED'
        }),
      };
    }

    console.log('Successfully created Daily.co token for:', { room: room.trim(), user: user.trim() });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST',
      },
      body: JSON.stringify({
        token: tokenData.token,
        expires: tokenRequest.properties.exp,
        room: room.trim(),
        user: user.trim(),
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
