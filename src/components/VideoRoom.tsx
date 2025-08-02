import { useEffect, useRef, useState, useCallback } from 'react';
import { useDaily, useParticipantIds, useParticipant, DailyProvider } from '@daily-co/daily-react';
import { useGameState, useGameActions } from '@/hooks/useGameAtoms';

interface VideoRoomProps {
  gameId: string;
  className?: string;
  observerMode?: boolean;
}

interface ParticipantVideoProps {
  participantId: string;
  name: string;
  type: 'host' | 'playerA' | 'playerB';
  className?: string;
}

function ParticipantVideo({ participantId, name, type, className = '' }: ParticipantVideoProps) {
  const participant = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get color scheme for participant type
  const getColorScheme = () => {
    switch (type) {
      case 'host':
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/20',
          text: 'text-blue-300',
          accent: 'bg-blue-600'
        };
      case 'playerA':
        return {
          border: 'border-green-500/30',
          bg: 'bg-green-500/20',
          text: 'text-green-300',
          accent: 'bg-green-600'
        };
      case 'playerB':
        return {
          border: 'border-purple-500/30',
          bg: 'bg-purple-500/20',
          text: 'text-purple-300',
          accent: 'bg-purple-600'
        };
      default:
        return {
          border: 'border-gray-500/30',
          bg: 'bg-gray-500/20',
          text: 'text-gray-300',
          accent: 'bg-gray-600'
        };
    }
  };

  const colors = getColorScheme();

  // Set up video stream
  useEffect(() => {
    if (participant?.videoTrack && videoRef.current) {
      const videoElement = videoRef.current;
      const stream = new MediaStream([participant.videoTrack]);
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      
      // Mute local user video
      if (participant.local) {
        videoElement.muted = true;
      }
    }
  }, [participant?.videoTrack, participant?.local]);

  // Set up audio stream
  useEffect(() => {
    if (participant?.audioTrack && audioRef.current && !participant.local) {
      const audioElement = audioRef.current;
      const stream = new MediaStream([participant.audioTrack]);
      audioElement.srcObject = stream;
      audioElement.autoplay = true;
    }
  }, [participant?.audioTrack, participant?.local]);

  if (!participant) {
    return (
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 ${className}`}>
        <div className="text-center">
          <div className={`${colors.text} text-lg font-bold mb-2 font-arabic`}>
            {name}
          </div>
          <div className="text-gray-400 text-sm font-arabic">
            في انتظار الانضمام...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header with participant info */}
      <div className={`${colors.bg} border ${colors.border} rounded-t-xl p-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            participant ? 'bg-green-500' : 'bg-gray-500'
          }`}></div>
          <div className={`${colors.text} font-bold font-arabic`}>
            {participant.user_name || name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400 font-arabic">
            {type === 'host' ? 'المقدم' : 
             type === 'playerA' ? 'لاعب 1' : 'لاعب 2'}
          </div>
          {participant.local && (
            <div className="px-2 py-1 bg-green-600 text-white text-xs rounded font-arabic">
              أنت
            </div>
          )}
        </div>
      </div>

      {/* Video element */}
      <div className={`relative bg-gray-800 rounded-b-xl border-none ${colors.border} border-t-0`} 
           style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-b-xl"
          playsInline
          autoPlay
          muted={participant.local}
        />
        
        {/* Audio element (hidden, for non-local participants) */}
        {!participant.local && (
          <audio
            ref={audioRef}
            autoPlay
          />
        )}

        {/* Video status indicators */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          <div className={`w-6 h-6 rounded flex items-center justify-center ${
            participant.audioTrack ? 'bg-green-600' : 'bg-red-600'
          }`}>
            <span className="text-white text-xs">
              {participant.audioTrack ? '🎤' : '🚫'}
            </span>
          </div>
          <div className={`w-6 h-6 rounded flex items-center justify-center ${
            participant.videoTrack ? 'bg-green-600' : 'bg-red-600'
          }`}>
            <span className="text-white text-xs">
              {participant.videoTrack ? '📷' : '🚫'}
            </span>
          </div>
        </div>
        
        {/* Participant name overlay */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-arabic">
          {participant.user_name || name}
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
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string>('');

  // Get user info from URL parameters
  const getUserInfo = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    const name = urlParams.get('name') || 'مستخدم';
    
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
    if (!daily || !state.videoRoomUrl || isJoining) return;

    const joinRoom = async () => {
      setIsJoining(true);
      setError('');

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
        setError(error instanceof Error ? error.message : 'Failed to join video call');
      } finally {
        setIsJoining(false);
      }
    };

    joinRoom();
  }, [daily, state.videoRoomUrl, gameId, generateDailyToken, getUserInfo, isJoining]);

  // Enable logs
  useEffect(() => {
    if (daily) {
      // Remove setLogLevel as it doesn't exist in this version
      console.log('[VideoRoom] Daily call instance ready');
    }
  }, [daily]);

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
          <div className="text-gray-400 text-lg font-bold mb-2 font-arabic">
            غرفة الفيديو غير متاحة
          </div>
          <div className="text-gray-300 text-sm font-arabic">
            في انتظار إنشاء غرفة الفيديو...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-500/20 border border-red-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 text-lg font-bold mb-2 font-arabic">
            خطأ في الفيديو
          </div>
          <div className="text-red-300 text-sm mb-4 font-arabic">{error}</div>
          <button
            onClick={() => {
              setError('');
              setIsJoining(false);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-arabic transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className={`bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-blue-400 text-lg font-bold mb-2 font-arabic">
            الانضمام للفيديو
          </div>
          <div className="text-blue-300 text-sm font-arabic">
            جاري الاتصال...
          </div>
        </div>
      </div>
    );
  }

  // Find specific participants by their IDs (we'll let the ParticipantVideo component handle the useParticipant hook)
  const hostParticipantId = participantIds.find(id => 
    id.includes('host') || 
    id === 'host-mobile' || 
    id === 'host-pc'
  );
  const playerAParticipantId = participantIds.find(id => 
    id.includes('playerA') || 
    id === 'playerA'
  );
  const playerBParticipantId = participantIds.find(id => 
    id.includes('playerB') || 
    id === 'playerB'
  );

  return (
    <div className={`${className}`}>
      <div className="bg-gradient-to-br from-blue-800/30 to-purple-800/30 rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-blue-300 mb-6 font-arabic text-center">
          غرفة الفيديو المباشرة
        </h3>
        
        {/* Horizontal layout for participants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Host Video */}
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-blue-300 font-arabic text-center">
              المقدم
            </h4>
            <ParticipantVideo
              participantId={hostParticipantId || 'host'}
              name={state.hostName || 'المقدم'}
              type="host"
              className="w-full"
            />
          </div>
          
          {/* Player A Video */}
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-green-300 font-arabic text-center">
              اللاعب الأول
            </h4>
            <ParticipantVideo
              participantId={playerAParticipantId || 'playerA'}
              name={state.players.playerA.name || 'لاعب 1'}
              type="playerA"
              className="w-full"
            />
          </div>
          
          {/* Player B Video */}
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-purple-300 font-arabic text-center">
              اللاعب الثاني
            </h4>
            <ParticipantVideo
              participantId={playerBParticipantId || 'playerB'}
              name={state.players.playerB.name || 'لاعب 2'}
              type="playerB"
              className="w-full"
            />
          </div>
        </div>
        
        {/* Info note */}
        <div className="mt-6 bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
          <p className="text-blue-300 text-sm font-arabic text-center">
            💡 إطار منفصل لكل مشارك مع الصوت والفيديو المباشر
          </p>
          <p className="text-blue-200 text-xs font-arabic text-center mt-1">
            المشاركون المتصلون: {participantIds.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VideoRoom(props: VideoRoomProps) {
  const state = useGameState();

  // Only render if video room is created
  if (!state.videoRoomCreated || !state.videoRoomUrl) {
    return (
      <div className={`bg-gray-500/20 border border-gray-500/30 rounded-xl p-6 ${props.className || ''}`}>
        <div className="text-center">
          <div className="text-gray-400 text-lg font-bold mb-2 font-arabic">
            غرفة الفيديو غير متاحة
          </div>
          <div className="text-gray-300 text-sm font-arabic">
            في انتظار إنشاء غرفة الفيديو...
          </div>
        </div>
      </div>
    );
  }

  return (
    <DailyProvider>
      <VideoRoomContent {...props} />
    </DailyProvider>
  );
}