import { atom } from 'jotai';
import type { DailyCall, DailyParticipant } from '@/lib/dailyLazy';

// Daily.co video call atoms
export const dailyCallAtom = atom<DailyCall | null>(null);
export const meetingStateAtom = atom<string>('new');
export const participantsAtom = atom<Record<string, DailyParticipant>>({});

// Video room management atoms
export const isJoiningRoomAtom = atom<boolean>(false);
export const isLeavingRoomAtom = atom<boolean>(false);
export const videoErrorAtom = atom<string | null>(null);

// Derived atoms
export const isInMeetingAtom = atom<boolean>(
  (get) => get(meetingStateAtom) === 'joined-meeting'
);

export const participantCountAtom = atom<number>(
  (get) => Object.keys(get(participantsAtom)).length
);

export const localParticipantAtom = atom<DailyParticipant | null>(
  (get) => {
    const participants = get(participantsAtom);
    return Object.values(participants).find(p => p.local) || null;
  }
);

// Actions for video functionality
export const joinVideoRoomAtom = atom(
  null,
  async (get, set, { roomUrl, token, userName }: { roomUrl: string; token?: string; userName?: string }) => {
    // Lazy load Daily.co SDK when video is needed
    const { createCall, joinRoom } = await import('@/lib/dailyLazy');
    
    let call = get(dailyCallAtom);
    if (!call) {
      call = await createCall();
      set(dailyCallAtom, call);
    }

    set(isJoiningRoomAtom, true);
    set(videoErrorAtom, null);

    try {
      await joinRoom(call, roomUrl, token, userName);
    } catch (error) {
      console.error('Failed to join video room:', error);
      set(videoErrorAtom, error instanceof Error ? error.message : 'Failed to join video room');
    } finally {
      set(isJoiningRoomAtom, false);
    }
  }
);

export const leaveVideoRoomAtom = atom(
  null,
  async (get, set) => {
    const call = get(dailyCallAtom);
    if (!call) return;

    set(isLeavingRoomAtom, true);
    set(videoErrorAtom, null);

    try {
      // Lazy load the leave function
      const { leaveRoom } = await import('@/lib/dailyLazy');
      await leaveRoom(call);
      set(dailyCallAtom, null);
      set(participantsAtom, {});
      set(meetingStateAtom, 'new');
    } catch (error) {
      console.error('Failed to leave video room:', error);
      set(videoErrorAtom, error instanceof Error ? error.message : 'Failed to leave video room');
    } finally {
      set(isLeavingRoomAtom, false);
    }
  }
);