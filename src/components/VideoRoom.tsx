import { useEffect, useRef, useCallback, useMemo } from 'react';
import {
  useDaily,
  useParticipantIds,
  useParticipant,
  DailyProvider,
} from '@daily-co/daily-react';
import DailyIframe, { type DailyCall } from '@daily-co/daily-js';
import { useGameState, useGameActions } from '@/hooks/useGameAtoms';

interface VideoRoomProps {
  gameId: string;
  className?: string;
  observerMode?: boolean;
}

interface ParticipantVideoProps {
  participantId: string;
}

function ParticipantVideo({ participantId }: ParticipantVideoProps) {
  const participant = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Set up video stream using MediaStreamTrack
  useEffect(() => {
    if (participant?.tracks.video.persistentTrack && videoRef.current) {
      const videoElement = videoRef.current;
      const stream = new MediaStream([participant.tracks.video.persistentTrack]);
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      
      // Mute local user video to prevent echo
      if (participant.local) {
        videoElement.muted = true;
      }
    }
  }, [participant?.tracks.video.persistentTrack, participant?.local]);

  // Set up audio stream using MediaStreamTrack
  useEffect(() => {
    if (participant?.tracks.audio.persistentTrack && audioRef.current && !participant.local) {
      const audioElement = audioRef.current;
      const stream = new MediaStream([participant.tracks.audio.persistentTrack]);
      audioElement.srcObject = stream;
      audioElement.autoplay = true;
    }
  }, [participant?.tracks.audio.persistentTrack, participant?.local]);

  if (!participant) {
    return null;
  }

  const hasVideo = participant.tracks.video.state === 'playable' || participant.tracks.video.state === 'sendable';
  const hasAudio = participant.tracks.audio.state === 'playable' || participant.tracks.audio.state === 'sendable';

  return (
    <div className="flex-1 min-w-0 bg-gray-800 rounded-lg overflow-hidden relative">
      {/* Video element */}
      <div className="aspect-video relative bg-gray-900">
        {hasVideo ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted={participant.local}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2">
                {(participant.user_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="text-gray-400 text-sm">Camera off</div>
            </div>
          </div>
        )}
        
        {/* Audio element (hidden, for non-local participants) */}
        {!participant.local && (
          <audio
            ref={audioRef}
            autoPlay
          />
        )}

        {/* Status indicators */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          <div className={`w-6 h-6 rounded flex items-center justify-center ${
            hasAudio ? 'bg-green-600' : 'bg-red-600'
          }`}>
            <span className="text-white text-xs">
              {hasAudio ? '🎤' : '🚫'}
            </span>
          </div>
          <div className={`w-6 h-6 rounded flex items-center justify-center ${
            hasVideo ? 'bg-green-600' : 'bg-red-600'
          }`}>
            <span className="text-white text-xs">
              {hasVideo ? '📷' : '🚫'}
            </span>
          </div>
        </div>
        
        {/* Participant name overlay */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
          {participant.user_name || participantId}
          {participant.local && ' (You)'}
        </div>
      </div>
    </div>
  );
}

function VideoRoomContent({ gameId, className = '', observerMode = false }: VideoRoomProps) {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const state = useGameState();
  const { generateDailyToken } = useGameActions();

  // Get user info from URL parameters
  const getUserInfo = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    const name = urlParams.get('name') || 'User';
    
    if (observerMode) {
      return {
        userName: state.hostName || name,
        isHost: true,
        isObserver: true
      };
    }
    
    if (role === 'host' || role === 'host-mobile') {
      return {
        userName: state.hostName || name,
        isHost: true,
        isObserver: false
      };
    } else if (role === 'playerA' || role === 'playerB') {
      return {
        userName: name,
        isHost: false,
        isObserver: false
      };
    }
    
    return {
      userName: name,
      isHost: false,
      isObserver: false
    };
  }, [state.hostName, observerMode]);

  // Join room when URL is available
  useEffect(() => {
    if (!daily || !state.videoRoomUrl) return;

    const joinRoom = async () => {
      try {
        const userInfo = getUserInfo();
        console.log('[VideoRoom] Joining with user info:', userInfo);

        // Generate token for this user
        const token = await generateDailyToken(
          gameId,
          userInfo.userName,
          userInfo.isHost,
          userInfo.isObserver
        );

        if (!token) {
          throw new Error('Failed to get access token');
        }

        // Join the Daily call
        await daily.join({
          url: state.videoRoomUrl,
          token: token,
          userName: userInfo.userName
        });

        console.log('[VideoRoom] Successfully joined the call');
      } catch (error) {
        console.error('[VideoRoom] Failed to join call:', error);
      }
    };

    joinRoom();
  }, [daily, state.videoRoomUrl, gameId, generateDailyToken, getUserInfo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (daily) {
        daily.leave().catch(console.error);
      }
    };
  }, [daily]);

  if (!state.videoRoomCreated || !state.videoRoomUrl) {
    return (
      <div className={`bg-gray-500/20 border border-gray-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 text-lg font-bold mb-2">
            Video room not available
          </div>
          <div className="text-gray-300 text-sm">
            Waiting for video room creation...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
        <h3 className="text-lg font-bold text-white mb-4 text-center">
          Live Video Room
        </h3>
        
        {/* Horizontal participant layout with dividers */}
        <div className="flex gap-4 min-h-[200px]">
          {participantIds.map((participantId, index) => (
            <div key={participantId} className="flex items-stretch">
              <ParticipantVideo participantId={participantId} />
              
              {/* Divider between participants (not after the last one) */}
              {index < participantIds.length - 1 && (
                <div className="w-px bg-gray-600 mx-2 self-stretch" />
              )}
            </div>
          ))}
          
          {/* Show message if no participants */}
          {participantIds.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-lg font-bold mb-2">
                  No participants connected
                </div>
                <div className="text-gray-300 text-sm">
                  Waiting for participants to join...
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Info note */}
        <div className="mt-4 bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
          <p className="text-blue-300 text-sm text-center">
            💡 Horizontal layout with individual video frames and auto-play
          </p>
          <p className="text-blue-200 text-xs text-center mt-1">
            Connected participants: {participantIds.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VideoRoom(props: VideoRoomProps) {
  const state = useGameState();

  // Memoize Daily call object so the same instance is reused across re-renders.
  // Daily recommends creating a call object per room and disposing it when finished
  // to avoid leaking video/audio resources.
  const callObject = useMemo<DailyCall>(() => {
    try {
      return DailyIframe.createCallObject();
    } catch (error) {
      console.warn('[VideoRoom] Failed to create Daily call object:', error);
      // Return a mock object that won't cause issues
      return null as any;
    }
  }, []);

  // Destroy the Daily call object on unmount to free resources and prevent
  // lingering connections that could leave the UI in a loading state.
  useEffect(() => {
    return () => {
      if (callObject) {
        try {
          // Only destroy if not already destroyed or destroying
          const meetingState = callObject.meetingState();
          // Only destroy if not in a state that doesn't require cleanup
          if (
            meetingState !== "left-meeting" &&
            meetingState !== "error" &&
            meetingState !== "new" &&
            meetingState !== "loading"
          ) {
            callObject.destroy();
          }
        } catch (error) {
          console.warn('[VideoRoom] Error during cleanup:', error);
        }
      }
    };
  }, [callObject]);

  // Only render if video room is created and call object is available
  if (!state.videoRoomCreated || !state.videoRoomUrl || !callObject) {
    return (
      <div className={`bg-gray-500/20 border border-gray-500/30 rounded-xl p-6 ${props.className || ''}`}>
        <div className="text-center">
          <div className="text-gray-400 text-lg font-bold mb-2">
            Video room not available
          </div>
          <div className="text-gray-300 text-sm">
            {!callObject ? 'Daily.co initialization failed' : 'Waiting for video room creation...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DailyProvider callObject={callObject}>
      <VideoRoomContent {...props} />
    </DailyProvider>
  );
}