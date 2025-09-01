import type { Handler } from '@netlify/functions';

/**
 * Session event handler for game sessions.
 * Handles session lifecycle events like start, end, join, leave, etc.
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
    // Handle GET request - session status
    if (event.httpMethod === 'GET') {
      const sessionId = event.queryStringParameters?.sessionId;
      
      if (!sessionId) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            error: 'Session ID is required',
            code: 'MISSING_SESSION_ID',
          }),
        };
      }

      // Return basic session status
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          sessionId,
          status: 'active',
          timestamp: new Date().toISOString(),
          message: 'Session status retrieved successfully',
        }),
      };
    }

    // Handle POST request - session events
    if (event.httpMethod === 'POST') {
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

      const { sessionId, eventType, data } = requestBody;

      // Validate required fields
      if (!sessionId) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            error: 'Session ID is required',
            code: 'MISSING_SESSION_ID',
          }),
        };
      }

      if (!eventType) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            error: 'Event type is required',
            code: 'MISSING_EVENT_TYPE',
            supportedEvents: ['session_start', 'session_end', 'player_join', 'player_leave', 'game_action'],
          }),
        };
      }

      // Validate sessionId format
      if (typeof sessionId !== 'string' || sessionId.length === 0) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            error: 'Invalid session ID format',
            code: 'INVALID_SESSION_ID',
          }),
        };
      }

      // Process different event types
      const timestamp = new Date().toISOString();
      const eventId = `${sessionId}-${eventType}-${Date.now()}`;

      const eventRecord = {
        eventId,
        sessionId,
        eventType,
        data: data || {},
        timestamp,
        processed: true,
      };

      // Log the event (in a real implementation, this might be stored in a database)
      console.log('Session event processed:', eventRecord);

      // Handle specific event types
      switch (eventType) {
        case 'session_start':
          console.log(`Session started: ${sessionId}`);
          break;
        
        case 'session_end':
          console.log(`Session ended: ${sessionId}`);
          break;
        
        case 'player_join':
          console.log(`Player joined session ${sessionId}:`, data?.playerId);
          break;
        
        case 'player_leave':
          console.log(`Player left session ${sessionId}:`, data?.playerId);
          break;
        
        case 'game_action':
          console.log(`Game action in session ${sessionId}:`, data?.action);
          break;
        
        default:
          console.log(`Unknown event type ${eventType} in session ${sessionId}`);
      }

      // Return success response
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: true,
          eventId,
          sessionId,
          eventType,
          timestamp,
          message: 'Session event processed successfully',
        }),
      };
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Method not allowed',
        allowedMethods: ['GET', 'POST', 'OPTIONS'],
      }),
    };
  } catch (error) {
    console.error('Session event function error:', error);
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
        timestamp: new Date().toISOString(),
      }),
    };
  }
};