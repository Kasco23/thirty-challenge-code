import { atom } from 'jotai';

// Simple video error tracking atom
export const videoErrorAtom = atom<string | null>(null);

// Action atom for testing Daily.co connectivity
export const testDailyConnectionAtom = atom(
  null,
  async (_get, set) => {
    set(videoErrorAtom, null);
    
    try {
      // Test room creation
      const response = await fetch('/.netlify/functions/create-daily-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: `test-${Date.now()}`,
          properties: { max_participants: 10 }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create test room');
      }
      
      const roomData = await response.json();
      console.log('Daily.co test successful:', roomData.roomName);
      
      // Clean up test room
      await fetch('/.netlify/functions/delete-daily-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: roomData.roomName })
      });
      
      return true;
    } catch (error) {
      console.error('Daily.co test failed:', error);
      set(videoErrorAtom, error instanceof Error ? error.message : 'Connection test failed');
      return false;
    }
  }
);