import type { Handler } from '@netlify/functions';

/**
 * General Daily.co rooms management endpoint.
 * Handles listing, searching, and batch operations on Daily.co rooms.
 */
export const handler: Handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  // Validate environment configuration
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
    // Handle GET request - list rooms
    if (event.httpMethod === 'GET') {
      const url = new URL(`https://api.daily.co/v1/rooms${event.path || ''}`);
      
      // Add query parameters if provided
      if (event.queryStringParameters) {
        Object.entries(event.queryStringParameters).forEach(([key, value]) => {
          if (value !== null) {
            url.searchParams.append(key, value);
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

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
        });

        return {
          statusCode: response.status >= 500 ? 502 : response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            error: `Daily.co API error: ${errorData?.error || errorText || response.statusText}`,
            code: 'DAILY_API_ERROR',
            status: response.status,
          }),
        };
      }

      const roomsData = await response.json();

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(roomsData),
      };
    }

    // Handle POST request - batch operations
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

      const { action, data } = requestBody;

      if (!action) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            error: 'Action is required',
            code: 'MISSING_ACTION',
            availableActions: ['list', 'search', 'cleanup'],
          }),
        };
      }

      // Handle different actions
      switch (action) {
        case 'list': {
          // List rooms with optional filters
          const listUrl = new URL('https://api.daily.co/v1/rooms');
          if (data?.limit) listUrl.searchParams.append('limit', data.limit.toString());
          if (data?.ending_before) listUrl.searchParams.append('ending_before', data.ending_before);
          if (data?.starting_after) listUrl.searchParams.append('starting_after', data.starting_after);

          const listResponse = await fetch(listUrl.toString(), {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (!listResponse.ok) {
            const errorText = await listResponse.text();
            return {
              statusCode: listResponse.status >= 500 ? 502 : listResponse.status,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({
                error: `Failed to list rooms: ${errorText}`,
                code: 'LIST_FAILED',
              }),
            };
          }

          const listData = await listResponse.json();
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(listData),
          };
        }

        case 'search': {
          // Search rooms by pattern
          const { pattern, fields = ['name'] } = data || {};
          
          if (!pattern) {
            return {
              statusCode: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({
                error: 'Search pattern is required',
                code: 'MISSING_PATTERN',
              }),
            };
          }

          // For now, we'll get all rooms and filter client-side
          // Daily.co API doesn't have built-in search functionality
          const searchResponse = await fetch('https://api.daily.co/v1/rooms?limit=100', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            return {
              statusCode: searchResponse.status >= 500 ? 502 : searchResponse.status,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({
                error: `Failed to search rooms: ${errorText}`,
                code: 'SEARCH_FAILED',
              }),
            };
          }

          const searchData = await searchResponse.json();
          const filteredRooms = searchData.data?.filter((room: Record<string, unknown>) => {
            return fields.some((field: string) => {
              const value = room[field];
              return value && value.toString().toLowerCase().includes(pattern.toLowerCase());
            });
          }) || [];

          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              data: filteredRooms,
              total_count: filteredRooms.length,
              search_pattern: pattern,
              search_fields: fields,
            }),
          };
        }

        case 'cleanup': {
          // Cleanup expired rooms (placeholder - would need proper implementation)
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              message: 'Cleanup functionality not implemented yet',
              code: 'NOT_IMPLEMENTED',
            }),
          };
        }

        default:
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              error: `Unknown action: ${action}`,
              code: 'UNKNOWN_ACTION',
              availableActions: ['list', 'search', 'cleanup'],
            }),
          };
      }
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
    console.error('Daily rooms function error:', error);
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