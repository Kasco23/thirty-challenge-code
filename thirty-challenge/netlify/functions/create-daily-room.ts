import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { roomName } = JSON.parse(event.body || '{}');
    
    if (!roomName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Room name is required' })
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

    // Create room using Daily.co REST API
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dailyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          max_participants: 3, // Host mobile + 2 players
          enable_screenshare: false,
          enable_chat: false,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Expire in 24 hours
        }
      })
    });

    if (!response.ok) {
      console.error('Daily.co API error:', await response.text());
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to create Daily.co room' })
      };
    }

    const roomData = await response.json();
    
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
        room: roomData
      })
    };
  } catch (error) {
    console.error('Error creating room:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};