import { useEffect, useRef, useState } from 'react';
import { createCall, joinRoom, leaveRoom } from '@/lib/dailyLazy';
import type { 
  DailyCall, 
  DailyParticipant, 
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft 
} from '@/lib/dailyLazy';

/* ---------------- factory helpers --------------- */

export { createCall, joinRoom, leaveRoom } from '@/lib/dailyLazy';

/* -------------- React convenience hook ----------- */

export const useDaily = (
  roomUrl: string,
  token?: string,
  userName?: string,
) => {
  const callRef = useRef<DailyCall>(null);
  const [meetingState, setMeetingState] = useState<string>('new');
  const [participants, setParticipants] = useState<
    Record<string, DailyParticipant>
  >({});

  useEffect(() => {
    let call: DailyCall | null = null;

    const initializeCall = async () => {
      call = await createCall();
      callRef.current = call;

      /* meeting state */
      const onMeetingStateChanged = () =>
        setMeetingState(call!.meetingState()); // returns string union
      call
        .on('joining-meeting', onMeetingStateChanged)
        .on('joined-meeting', onMeetingStateChanged)
        .on('left-meeting', onMeetingStateChanged)
        .on('error', onMeetingStateChanged);

      /* participants */
      const upsert = (p: DailyParticipant) =>
        setParticipants((prev) => ({ ...prev, [p.session_id]: p }));

      call
        .on('participant-joined', (e: DailyEventObjectParticipant) =>
          upsert(e.participant),
        )
        .on('participant-updated', (e: DailyEventObjectParticipant) =>
          upsert(e.participant),
        )
        .on('participant-left', (e: DailyEventObjectParticipantLeft) =>
          setParticipants((prev) => {
            const copy = { ...prev };
            delete copy[e.participant.session_id];
            return copy;
          }),
        );

      /* join immediately */
      try {
        await joinRoom(call, roomUrl, token, userName);
      } catch (error) {
        console.error('Failed to join room:', error);
      }
    };

    initializeCall();

    return () => {
      if (call) {
        leaveRoom(call).catch(console.error);
      }
    };
  }, [roomUrl, token, userName]);

  return { call: callRef.current, meetingState, participants };
};
