import { useEffect, useRef, useState, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useGameState, useGameActions } from '@/hooks/useGameAtoms';
import FakeVideoSimulator from './FakeVideoSimulator';
import {
  fakeHostAtom,
  fakePlayerAAtom,
  fakePlayerBAtom,
  addFakeHostAtom,
  addFakePlayerAAtom,
  addFakePlayerBAtom,
  updateFakeHostNameAtom,
  updateFakePlayerANameAtom,
  updateFakePlayerBNameAtom,
  toggleFakeHostConnectionAtom,
  toggleFakePlayerAConnectionAtom,
  toggleFakePlayerBConnectionAtom,
  removeFakeHostAtom,
  removeFakePlayerAAtom,
  removeFakePlayerBAtom
} from '@/state/fakeParticipantsAtoms';

interface IndividualVideoFrameProps {
  gameId: string;
  participantType: 'host' | 'playerA' | 'playerB';
  participantName: string;
  isConnected: boolean;
  className?: string;
  observerMode?: boolean;
}

export default function IndividualVideoFrame({
  gameId,
  participantType,
  participantName,
  isConnected,
  className = '',
  observerMode = false,
}: IndividualVideoFrameProps) {
  const state = useGameState();
  const { generateDailyToken } = useGameActions();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Fake participant state management
  const [fakeHost] = useAtom(fakeHostAtom);
  const [fakePlayerA] = useAtom(fakePlayerAAtom);
  const [fakePlayerB] = useAtom(fakePlayerBAtom);
  
  const addFakeHost = useSetAtom(addFakeHostAtom);
  const addFakePlayerA = useSetAtom(addFakePlayerAAtom);
  const addFakePlayerB = useSetAtom(addFakePlayerBAtom);
  
  const updateFakeHostName = useSetAtom(updateFakeHostNameAtom);
  const updateFakePlayerAName = useSetAtom(updateFakePlayerANameAtom);
  const updateFakePlayerBName = useSetAtom(updateFakePlayerBNameAtom);
  
  const toggleFakeHostConnection = useSetAtom(toggleFakeHostConnectionAtom);
  const toggleFakePlayerAConnection = useSetAtom(toggleFakePlayerAConnectionAtom);
  const toggleFakePlayerBConnection = useSetAtom(toggleFakePlayerBConnectionAtom);
  
  const removeFakeHost = useSetAtom(removeFakeHostAtom);
  const removeFakePlayerA = useSetAtom(removeFakePlayerAAtom);
  const removeFakePlayerB = useSetAtom(removeFakePlayerBAtom);

  // Get the current fake participant for this frame
  const currentFakeParticipant = 
    participantType === 'host' ? fakeHost :
    participantType === 'playerA' ? fakePlayerA :
    participantType === 'playerB' ? fakePlayerB : null;

  // Handler functions for fake participants
  const handleAddFakeParticipant = () => {
    const aspectRatio = 16/9; // Default aspect ratio
    switch (participantType) {
      case 'host':
        addFakeHost(aspectRatio);
        break;
      case 'playerA':
        addFakePlayerA(aspectRatio);
        break;
      case 'playerB':
        addFakePlayerB(aspectRatio);
        break;
    }
  };

  const handleNameChange = (newName: string) => {
    switch (participantType) {
      case 'host':
        updateFakeHostName(newName);
        break;
      case 'playerA':
        updateFakePlayerAName(newName);
        break;
      case 'playerB':
        updateFakePlayerBName(newName);
        break;
    }
  };

  const handleConnectionToggle = () => {
    switch (participantType) {
      case 'host':
        toggleFakeHostConnection();
        break;
      case 'playerA':
        toggleFakePlayerAConnection();
        break;
      case 'playerB':
        toggleFakePlayerBConnection();
        break;
    }
  };

  const handleRemoveFakeParticipant = () => {
    switch (participantType) {
      case 'host':
        removeFakeHost();
        break;
      case 'playerA':
        removeFakePlayerA();
        break;
      case 'playerB':
        removeFakePlayerB();
        break;
    }
  };

  // Get user info from URL parameters for current user
  const getCurrentUserInfo = useCallback(() => {
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

  // Create video URL with token for this specific frame
  const createVideoUrl = useCallback(async () => {
    if (!state.videoRoomUrl) return;

    setIsLoading(true);
    setError('');

    try {
      const currentUserInfo = getCurrentUserInfo();
      console.log(`[IndividualVideoFrame-${participantType}] Creating video URL for current user:`, currentUserInfo);

      // Generate token for the current user (not the participant this frame represents)
      const token = await generateDailyToken(
        gameId,
        currentUserInfo.userName,
        currentUserInfo.isHost,
        currentUserInfo.isObserver
      );

      if (!token) {
        throw new Error('Failed to get access token');
      }

      // Create the complete video URL with token
      // All participants join the same room but each frame shows the full room
      const videoUrl = `${state.videoRoomUrl}?t=${token}&userName=${encodeURIComponent(currentUserInfo.userName)}`;
      setVideoUrl(videoUrl);
      console.log(`[IndividualVideoFrame-${participantType}] Video URL created successfully`);

    } catch (error) {
      console.error(`[IndividualVideoFrame-${participantType}] Failed to create video URL:`, error);
      setError(error instanceof Error ? error.message : 'Failed to join video');
    } finally {
      setIsLoading(false);
    }
  }, [state.videoRoomUrl, generateDailyToken, gameId, getCurrentUserInfo, participantType]);

  // Create video URL when room is available
  useEffect(() => {
    if (state.videoRoomCreated && state.videoRoomUrl && !videoUrl) {
      createVideoUrl();
    }
  }, [state.videoRoomCreated, state.videoRoomUrl, videoUrl, createVideoUrl]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    console.log(`[IndividualVideoFrame-${participantType}] Video iframe loaded successfully`);
    setIsLoading(false);
  }, [participantType]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    console.error(`[IndividualVideoFrame-${participantType}] Video iframe failed to load`);
    setError('Failed to load video interface');
    setIsLoading(false);
  }, [participantType]);

  // Get the appropriate color scheme for this participant type
  const getColorScheme = () => {
    switch (participantType) {
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

  // If there's a fake participant for this frame, show the simulator instead of real video
  if (currentFakeParticipant) {
    return (
      <FakeVideoSimulator
        participant={currentFakeParticipant}
        onNameChange={handleNameChange}
        onConnectionToggle={handleConnectionToggle}
        onRemove={handleRemoveFakeParticipant}
        className={className}
      />
    );
  }

  // Show "Add Fake Participant" button if no real video room and no fake participant
  if (!state.videoRoomCreated) {
    return (
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 ${className}`}>
        <div className="text-center">
          <div className={`${colors.text} text-lg font-bold mb-2 font-arabic`}>
            {participantName}
          </div>
          <div className="text-gray-400 text-sm mb-4 font-arabic">
            في انتظار إنشاء غرفة الفيديو...
          </div>
          <button
            onClick={handleAddFakeParticipant}
            className={`px-4 py-2 ${colors.accent} hover:opacity-80 text-white rounded-lg font-arabic transition-colors`}
          >
            إضافة مشارك وهمي للاختبار
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 ${className}`}>
        <div className="text-center">
          <div className={`${colors.text} text-lg font-bold mb-2 font-arabic`}>
            خطأ في الفيديو
          </div>
          <div className={`${colors.text} text-sm mb-4 font-arabic`}>{error}</div>
          <button
            onClick={createVideoUrl}
            className={`px-4 py-2 ${colors.accent} hover:opacity-80 text-white rounded-lg font-arabic transition-colors`}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!state.videoRoomCreated) {
    return (
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 ${className}`}>
        <div className="text-center">
          <div className={`${colors.text} text-lg font-bold mb-2 font-arabic`}>
            {participantName}
          </div>
          <div className="text-gray-400 text-sm font-arabic">
            في انتظار إنشاء غرفة الفيديو...
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !videoUrl) {
    return (
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className={`${colors.text} text-lg font-bold mb-2 font-arabic`}>
            {participantName}
          </div>
          <div className="text-gray-400 text-sm mb-4 font-arabic">
            جاري تحضير الفيديو...
          </div>
          <button
            onClick={handleAddFakeParticipant}
            className={`px-4 py-2 ${colors.accent} hover:opacity-80 text-white rounded-lg font-arabic transition-colors`}
          >
            إضافة مشارك وهمي للاختبار
          </button>
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
            isConnected ? 'bg-green-500' : 'bg-gray-500'
          }`}></div>
          <div className={`${colors.text} font-bold font-arabic`}>
            {participantName}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400 font-arabic">
            {participantType === 'host' ? 'المقدم' : 
             participantType === 'playerA' ? 'لاعب 1' : 'لاعب 2'}
          </div>
          <button
            onClick={handleAddFakeParticipant}
            className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded font-arabic transition-colors"
          >
            وهمي
          </button>
        </div>
      </div>

      {/* Video iframe */}
      <iframe
        ref={iframeRef}
        src={videoUrl}
        className={`w-full h-full min-h-[200px] max-h-[300px] bg-gray-800 rounded-b-xl border-none ${colors.border} border-t-0`}
        style={{ aspectRatio: '16/9' }}
        allow="camera; microphone; autoplay; display-capture; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title={`Video Conference - ${participantName}`}
      />

      {/* Status overlay */}
      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-arabic">
        {isConnected ? 'متصل' : 'غير متصل'}
      </div>
      
      {/* Real video indicator */}
      <div className="absolute top-1 right-1 bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">
        حقيقي
      </div>
    </div>
  );
}