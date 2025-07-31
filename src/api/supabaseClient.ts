/**
 * Daily helper utilities for Thirty Challenge
 *
 * Depends on:
 *   pnpm add @daily-co/daily-js   # low-level SDK
 *   pnpm add @daily-co/daily-react  # optional hooks wrapper
 *
 * Environment:
 *   VITE_DAILY_DOMAIN   e.g. "thirty.daily.co"
 *   DAILY_API_KEY       (optional) – required only if you create rooms server-side
 */

import DailyIframe, {
  DailyCall,
  DailyEventObjectParticipant,
  DailyEventObjectMeetingState,
} from '@daily-co/daily-js';

/* ------------------------------------------------------------------ */
/*  Low-level Call-Object helpers                                      */
/* ------------------------------------------------------------------ */

/** Singleton factory – create once per device */
export const createCall = (): DailyCall =>
  DailyIframe.createCallObject({ dailyConfig: { userName: 'Anonymous' } });

/**
 * Join an existing Daily room.
 * If you use token-based auth, pass the token.
 */
export async function joinRoom(
  call: DailyCall,
  roomUrl: string,
  token?: string,
) {
  if (!roomUrl) throw new Error('[dailyClient] joinRoom: roomUrl missing');
  await call.join({ url: roomUrl, token });
}

/** Cleanly leave and destroy the call instance */
export async function leaveRoom(call: DailyCall) {
  await call.leave();
  call.destroy();
}

/* ------------------------------------------------------------------ */
/*  React convenience hook (uses daily-js directly – no extra deps)    */
/* ------------------------------------------------------------------ */

import { useEffect, useRef, useState } from 'react';

/**
 * React hook that wraps a Daily call object and tracks
 *  – meetingState ('new' | 'joining-meeting' | …)
 *  – participants ({ id → participantObj })
 */
export function useDaily(roomUrl: string, token?: string) {
  const callRef = useRef<DailyCall | null>(null);
  const [meetingState, setMeetingState] = useState<
    DailyEventObjectMeetingState['meetingState']
  >('new');
  const [participants, setParticipants] = useState<
    Record<string, DailyEventObjectParticipant>
  >({});

  /* initialise call on first render -------------------------------- */
  useEffect(() => {
    const call = createCall();
    callRef.current = call;

    /* meeting-level events */
    const onMeetingState = (e: DailyEventObjectMeetingState) =>
      setMeetingState(e.action);
    call.on('joining-meeting', onMeetingState)
        .on('joined-meeting', onMeetingState)
        .on('left-meeting', onMeetingState)
        .on('error', onMeetingState);

    /* participant events */
    const upsert = (p: DailyEventObjectParticipant['participant']) =>
      setParticipants((prev) => ({ ...prev, [p.session_id]: p }));

    call.on('participant-joined', (e) => upsert(e.participant))
        .on('participant-updated', (e) => upsert(e.participant))
        .on('participant-left', (e) =>
          setParticipants((prev) => {
            const copy = { ...prev };
            delete copy[e.participant.session_id];
            return copy;
          }),
        );

    /* join immediatly */
    joinRoom(call, roomUrl, token).catch(console.error);

    /* cleanup on unmount */
    return () => {
      leaveRoom(call).catch(console.error);
    };
  }, [roomUrl, token]);

  return { call: callRef.current, meetingState, participants };
}

/* ------------------------------------------------------------------ */
/*  Optional helpers for serverless room creation                      */
/* ------------------------------------------------------------------ */

/**
 * Create a brand-new Daily room via Netlify function.
 * Your function should call Daily REST API with DAILY_API_KEY
 * and return `{ url: string }`.
 */
export async function createRoom(): Promise<{ url: string }> {
  const res = await fetch('/.netlify/functions/createDailyRoom');
  if (!res.ok) throw new Error('Failed to create Daily room');
  return res.json();
}

/**
 * Generate an owner (moderator) token via Netlify function.
 * Useful when you want to enable room-level admin privileges.
 */
export async function createOwnerToken(
  roomName: string,
): Promise<{ token: string }> {
  const res = await fetch('/.netlify/functions/createDailyToken', {
    method: 'POST',
    body: JSON.stringify({ roomName, isOwner: true }),
  });
  if (!res.ok) throw new Error('Failed to create owner token');
  return res.json();
}
