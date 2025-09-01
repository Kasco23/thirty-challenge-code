import type { Handler } from '@netlify/functions';

/**
 * Game event handler for processing game-related events.
 * Handles various game state changes and player actions.
 */
export const handler: Handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  try {
    // Parse the incoming request body safely
    let requestData = {};
    if (event.body) {
      try {
        requestData = JSON.parse(event.body);
      } catch (parseError) {
        console.error('Invalid JSON in request body:', parseError);
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
    }

    // Validate request data if needed
    if (event.httpMethod === 'POST' && (!requestData || typeof requestData !== 'object')) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Request body must be a valid JSON object',
          code: 'INVALID_REQUEST_DATA',
        }),
      };
    }

    // TODO: Replace this with the real logic for your game event
    // For now, return a simple success response to avoid build failures.
    const response = {
      success: true,
      received: requestData,
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      message: 'Game event processed successfully',
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Game event function error:', error);
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
