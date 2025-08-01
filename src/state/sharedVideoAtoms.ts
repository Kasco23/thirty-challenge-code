/**
 * Shared Daily.co call manager for the lobby
 * Handles a single call object that can be used across multiple video frames
 */

import { atom } from 'jotai';
import type { DailyCall, DailyParticipant } from '@/lib/dailyLazy';

// Shared call state atoms
export const sharedDailyCallAtom = atom<DailyCall | null>(null);
export const sharedMeetingStateAtom = atom<string>('new');
export const sharedParticipantsAtom = atom<Record<string, DailyParticipant>>({});
export const sharedCallErrorAtom = atom<string | null>(null);

// Derived atoms for easier access
export const isSharedCallActiveAtom = atom<boolean>(
  (get) => get(sharedMeetingStateAtom) === 'joined-meeting'
);

export const sharedParticipantByRoleAtom = (role: string) => atom<DailyParticipant | null>(
  (get) => {
    const participants = get(sharedParticipantsAtom);
    // Find participant by checking their user_name for role match
    return Object.values(participants).find(p => 
      p.user_name?.includes(role) || p.user_id?.includes(role)
    ) || null;
  }
);

// Actions for shared call management
export const initializeSharedCallAtom = atom(
  null,
  async (get, set, { roomUrl, token, userName }: { roomUrl: string; token: string; userName: string }) => {
    try {
      // Check if call already exists
      let call = get(sharedDailyCallAtom);
      if (call) {
        console.log('[SharedCall] Call already exists, skipping initialization');
        return call;
      }

      // Lazy load Daily.co SDK
      const DailyIframe = await import('@daily-co/daily-js');
      
      // Create new call object
      call = DailyIframe.default.createCallObject({
        iframeStyle: {
          position: 'relative',
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px',
        },
        showLeaveButton: false,
        showFullscreenButton: false,
        theme: {
          colors: {
            accent: '#3b82f6', // blue-500
            accentText: '#ffffff',
            background: '#1f2937', // gray-800
            backgroundAccent: '#374151', // gray-700
            baseText: '#f9fafb', // gray-50
            border: '#6b7280', // gray-500
            mainAreaBg: '#111827', // gray-900
            mainAreaBgAccent: '#1f2937', // gray-800
            mainAreaText: '#f9fafb', // gray-50
            supportiveText: '#d1d5db', // gray-300
          },
        },
      });

      // Set up event listeners
      call
        .on('joining-meeting', () => {
          console.log('[SharedCall] Joining meeting...');
          set(sharedMeetingStateAtom, 'joining');
        })
        .on('joined-meeting', () => {
          console.log('[SharedCall] Joined meeting successfully');
          set(sharedMeetingStateAtom, 'joined-meeting');
          set(sharedCallErrorAtom, null);
        })
        .on('left-meeting', () => {
          console.log('[SharedCall] Left meeting');
          set(sharedMeetingStateAtom, 'left');
          set(sharedParticipantsAtom, {});
        })
        .on('error', (error: unknown) => {
          console.error('[SharedCall] Daily.co error:', error);
          const errorMsg = 
            (error as { errorMsg?: string })?.errorMsg || 
            (error as { message?: string })?.message || 
            'Video call error';
          set(sharedCallErrorAtom, errorMsg);
          set(sharedMeetingStateAtom, 'error');
        })
        .on('participant-joined', (event: { participant: DailyParticipant }) => {
          console.log('[SharedCall] Participant joined:', event.participant);
          const participants = get(sharedParticipantsAtom);
          set(sharedParticipantsAtom, {
            ...participants,
            [event.participant.session_id]: event.participant
          });
        })
        .on('participant-updated', (event: { participant: DailyParticipant }) => {
          const participants = get(sharedParticipantsAtom);
          set(sharedParticipantsAtom, {
            ...participants,
            [event.participant.session_id]: event.participant
          });
        })
        .on('participant-left', (event: { participant: DailyParticipant }) => {
          console.log('[SharedCall] Participant left:', event.participant);
          const participants = get(sharedParticipantsAtom);
          const newParticipants = { ...participants };
          delete newParticipants[event.participant.session_id];
          set(sharedParticipantsAtom, newParticipants);
        });

      // Store the call object
      set(sharedDailyCallAtom, call);

      // Join the meeting
      await call.join({
        url: roomUrl,
        token,
        userName,
        startVideoOff: false,
        startAudioOff: false,
      });

      console.log('[SharedCall] Successfully initialized and joined');
      return call;

    } catch (error) {
      console.error('[SharedCall] Failed to initialize:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to initialize video call';
      set(sharedCallErrorAtom, errorMsg);
      set(sharedMeetingStateAtom, 'error');
      throw error;
    }
  }
);

export const leaveSharedCallAtom = atom(
  null,
  async (get, set) => {
    const call = get(sharedDailyCallAtom);
    if (!call) return;

    try {
      console.log('[SharedCall] Leaving call...');
      await call.leave();
      await call.destroy();
      
      // Reset all state
      set(sharedDailyCallAtom, null);
      set(sharedMeetingStateAtom, 'new');
      set(sharedParticipantsAtom, {});
      set(sharedCallErrorAtom, null);
      
      console.log('[SharedCall] Successfully left and cleaned up');
    } catch (error) {
      console.error('[SharedCall] Error leaving call:', error);
    }
  }
);

export const attachCallToElementAtom = atom(
  null,
  async (get, _set, element: HTMLElement) => {
    const call = get(sharedDailyCallAtom);
    if (!call) {
      throw new Error('No active call to attach');
    }

    const iframe = call.iframe();
    if (!iframe) {
      throw new Error('Failed to get call iframe');
    }

    // Clear existing content
    element.innerHTML = '';
    
    // Style the iframe
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    
    // Append to element
    element.appendChild(iframe);
    
    console.log('[SharedCall] Attached iframe to element');
    return iframe;
  }
);