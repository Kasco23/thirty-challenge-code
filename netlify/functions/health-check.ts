import type { Handler } from '@netlify/functions';

/**
 * Health check endpoint for monitoring the application status.
 * Checks Supabase connectivity and returns system status.
 */
export const handler: Handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  // Only allow GET requests for health checks
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Basic health check response
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'thirty-challenge-api',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Optional: Check Supabase connectivity if URL is configured
    if (process.env.VITE_SUPABASE_URL) {
      try {
        // Simple ping to Supabase REST API
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
            'Content-Type': 'application/json',
          },
        });

        healthStatus.supabase = {
          status: response.ok ? 'connected' : 'error',
          url: process.env.VITE_SUPABASE_URL,
          responseTime: Date.now(),
        };
      } catch (error) {
        healthStatus.supabase = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // Optional: Check Daily.co API connectivity if key is configured
    if (process.env.DAILY_API_KEY) {
      try {
        const response = await fetch('https://api.daily.co/v1/', {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
          },
        });

        healthStatus.daily = {
          status: response.ok ? 'connected' : 'error',
          responseTime: Date.now(),
        };
      } catch (error) {
        healthStatus.daily = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: JSON.stringify(healthStatus),
    };
  } catch (error) {
    console.error('Health check error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};