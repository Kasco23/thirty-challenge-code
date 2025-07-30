import type { Handler } from '@netlify/functions';

// Netlify functions must export a handler; top-level await is not supported.
export const handler: Handler = async (event) => {
  // Parse the incoming request body when present
  const row = event.body ? JSON.parse(event.body) : {};

  // TODO: Replace this with the real logic for your game event
  // For now, return a simple success response to avoid build failures.
  return {
    statusCode: 200,
    body: JSON.stringify({ received: row }),
  };
};
