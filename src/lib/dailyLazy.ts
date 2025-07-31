/**
 * Lazy loading wrapper for Daily.co SDK to reduce initial bundle size
 */

// Type-only imports for better tree-shaking
import type { 
  DailyCall, 
  DailyParticipant, 
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft 
} from '@daily-co/daily-js';

// Cache the dynamic import promise to avoid multiple loads
let dailyImportPromise: Promise<typeof import('@daily-co/daily-js')> | null = null;

/**
 * Lazy load the Daily.co SDK only when needed
 */
async function loadDaily(): Promise<typeof import('@daily-co/daily-js')> {
  if (!dailyImportPromise) {
    dailyImportPromise = import('@daily-co/daily-js');
  }
  return dailyImportPromise;
}

/**
 * Factory function to create a Daily call object - lazy loaded
 */
export async function createCall(): Promise<DailyCall> {
  const DailyIframe = await loadDaily();
  return DailyIframe.default.createCallObject({});
}

/**
 * Join a Daily.co room with lazy loading
 */
export async function joinRoom(
  call: DailyCall,
  roomUrl: string,
  token?: string,
  userName?: string,
): Promise<void> {
  if (!roomUrl) throw new Error('[dailyLazy] joinRoom: roomUrl missing');
  await call.join({ url: roomUrl, token });
  if (userName) call.setUserName(userName);
}

/**
 * Leave and cleanup a Daily.co room
 */
export async function leaveRoom(call: DailyCall): Promise<void> {
  await call.leave();
  call.destroy();
}

// Re-export types for convenience
export type { 
  DailyCall, 
  DailyParticipant, 
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft 
};