import type { Handler } from '@netlify/functions';

// Netlify functions must export a handler; top-level await is not supported.
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

  // Parse the incoming request body when present
  const row = event.body ? JSON.parse(event.body) : {};

  // TODO: Replace this with the real logic for your game event
  // For now, return a simple success response to avoid build failures.
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ received: row }),
  };
};
