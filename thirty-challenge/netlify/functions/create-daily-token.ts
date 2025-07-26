import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { roomName, userName, userRole } = JSON.parse(event.body || '{}');
    
    if (!roomName || !userName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Room name and user name are required' })
      };
    }

    const dailyApiKey = process.env.DAILY_API_KEY;
    if (!dailyApiKey) {
      console.error('DAILY_API_KEY not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Daily.co API key not configured' })
      };
    }

    // Create meeting token using Daily.co REST API
    const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dailyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName,
          is_owner: userRole === 'host-mobile', // Only host mobile is owner
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expire in 24 hours
          enable_screenshare: userRole === 'host-mobile',
          start_video_on: true,
          start_audio_on: true
        }
      })
    });

    if (!response.ok) {
      console.error('Daily.co token API error:', await response.text());
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to create Daily.co token' })
      };
    }

    const tokenData = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify({
        success: true,
        token: tokenData.token
      })
    };
  } catch (error) {
    console.error('Error creating token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};