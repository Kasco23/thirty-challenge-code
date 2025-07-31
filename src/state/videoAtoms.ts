import { atom } from 'jotai';
import type { DailyCall, DailyParticipant } from '@daily-co/daily-js';

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
    const call = get(dailyCallAtom);
    if (!call) return;

    set(isJoiningRoomAtom, true);
    set(videoErrorAtom, null);

    try {
      await call.join({ url: roomUrl, token });
      if (userName) {
        call.setUserName(userName);
      }
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
      await call.leave();
      call.destroy();
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