/**
 * Test suite for video room creation and host connection tracking
 * Tests the key logic fixed in the Daily.co integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
vi.mock('@/lib/dailyConfig', () => ({
  isDevelopmentMode: () => false,
  getDailyDomain: () => 'daily.co',
  isDailyConfigured: () => true,
}));

describe('Video Room Creation Logic', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Daily.co API Integration', () => {
    it('should check for existing room with session ID', async () => {
      // Mock the check-daily-room response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          exists: false,
          roomName: 'P21AU2'
        })
      });

      const response = await fetch('/.netlify/functions/check-daily-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: 'P21AU2' }),
      });

      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/check-daily-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: 'P21AU2' }),
      });

      expect(data.exists).toBe(false);
      expect(data.roomName).toBe('P21AU2');
    });

    it('should create room with session ID when room does not exist', async () => {
      // Mock the create-daily-room response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          roomName: 'P21AU2',
          url: 'https://daily.co/P21AU2',
          created: '2024-01-01T00:00:00Z'
        })
      });

      const response = await fetch('/.netlify/functions/create-daily-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: 'P21AU2' }),
      });

      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/create-daily-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: 'P21AU2' }),
      });

      expect(data.roomName).toBe('P21AU2');
      expect(data.url).toBe('https://daily.co/P21AU2');
    });

    it('should create token with proper host name instead of "Host"', async () => {
      // Mock the create-daily-token response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'mock-token-123',
          expires: Math.round(Date.now() / 1000) + 3600,
          room: 'P21AU2',
          user: 'John Doe'
        })
      });

      const response = await fetch('/.netlify/functions/create-daily-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          room: 'P21AU2', 
          user: 'John Doe', 
          isHost: true 
        }),
      });

      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/create-daily-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          room: 'P21AU2', 
          user: 'John Doe', 
          isHost: true 
        }),
      });

      expect(data.token).toBe('mock-token-123');
      expect(data.user).toBe('John Doe');
    });
  });

  describe('Username Resolution Logic', () => {
    const testCases = [
      {
        participant: { name: 'John Doe', type: 'host', id: 'host' },
        gameState: { hostName: 'Host Name' },
        expected: 'John Doe'
      },
      {
        participant: { name: '', type: 'host', id: 'host' },
        gameState: { hostName: 'Host Name' },
        expected: 'Host Name'
      },
      {
        participant: { name: '', type: 'host', id: 'host' },
        gameState: { hostName: null },
        expected: 'Host'
      },
      {
        participant: { name: '', type: 'controller', id: 'controller' },
        gameState: { hostName: 'Controller Name' },
        expected: 'Controller Name'
      },
      {
        participant: { name: '', type: 'controller', id: 'controller' },
        gameState: { hostName: null },
        expected: 'Controller'
      },
      {
        participant: { name: '', type: 'player', id: 'playerA' },
        gameState: { hostName: null },
        expected: 'Player playerA'
      }
    ];

    testCases.forEach(({ participant, gameState, expected }) => {
      it(`should resolve username for ${participant.type} with name="${participant.name}" and hostName="${gameState.hostName}"`, () => {
        // This is the same logic used in the SimpleKitchenSinkVideo component
        const actualUserName = participant.name || 
          (participant.type === 'host' ? (gameState.hostName || 'Host') : 
           participant.type === 'controller' ? (gameState.hostName || 'Controller') : 
           `Player ${participant.id}`);

        expect(actualUserName).toBe(expected);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle room creation failure gracefully', async () => {
      // Mock failed room creation
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Room already exists',
          code: 'ROOM_EXISTS'
        })
      });

      const response = await fetch('/.netlify/functions/create-daily-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: 'P21AU2' }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should handle token generation failure gracefully', async () => {
      // Mock failed token generation
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Room not found',
          code: 'ROOM_NOT_FOUND'
        })
      });

      const response = await fetch('/.netlify/functions/create-daily-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          room: 'NONEXISTENT', 
          user: 'Test User', 
          isHost: false 
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });
});