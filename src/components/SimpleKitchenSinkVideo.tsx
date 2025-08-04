import { useState, useCallback, useEffect } from 'react';
import {
  DailyProvider,
  useDaily,
  useParticipantIds,
  useParticipant,
  useMeetingState,
  useLocalParticipant,
  DailyVideo,
  DailyAudio,
} from '@daily-co/daily-react';
import DailyIframe, { type DailyCall } from '@daily-co/daily-js';
import { useGameState, useGameActions } from '@/hooks/useGameAtoms';
import { useTranslation } from '@/hooks/useTranslation';
import type { LobbyParticipant } from '@/state';

interface SimpleKitchenSinkVideoProps {
  gameId: string;
  myParticipant: LobbyParticipant;
  showAlertMessage: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  className?: string;
}

// Individual participant video component
function ParticipantVideo({ 
  sessionId, 
  index, 
  localParticipantId 
}: { 
  sessionId: string; 
  index: number; 
  localParticipantId?: string; 
}) {
  const participant = useParticipant(sessionId);
  const participantName = participant?.user_name || participant?.user_id || `مشارك ${index + 1}`;
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-600/50">
      <div className="aspect-[4/3] relative">
        <DailyVideo 
          sessionId={sessionId}
          type="video"
          automirror={sessionId === localParticipantId}
          className="w-full h-full object-cover"
        />
        
        {/* Participant name overlay - now shows actual name */}
        <div className="absolute bottom-1 left-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {participantName} {sessionId === localParticipantId ? '(أنت)' : ''}
        </div>
        
        {/* Video number indicator */}
        <div className="absolute top-1 right-1 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">
          {index + 1}
        </div>
      </div>
      
      {/* Player name below video - more compact */}
      <div className="p-2 bg-gray-800/80 text-center">
        <p className="text-white text-sm font-semibold">
          {participantName}
        </p>
        {participant?.user_id && participant.user_id !== participantName && (
          <p className="text-gray-400 text-xs mt-1">
            معرف: {participant.user_id}
          </p>
        )}
      </div>
    </div>
  );
}

// Video Content Component (inside DailyProvider)
function VideoContent({ 
  gameId,
  myParticipant, 
  showAlertMessage 
}: { 
  gameId: string;
  myParticipant: LobbyParticipant;
  showAlertMessage: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}) {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const meetingState = useMeetingState();
  const localParticipant = useLocalParticipant();
  const gameState = useGameState();
  const { generateDailyToken, createVideoRoom } = useGameActions();
  const { t } = useTranslation();
  
  const [roomUrl, setRoomUrl] = useState('');
  const [userName, setUserName] = useState(myParticipant.name);
  const [isJoining, setIsJoining] = useState(false);
  const [preAuthToken, setPreAuthToken] = useState('');
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomCreationAttempted, setRoomCreationAttempted] = useState(false);

  // Auto-populate room URL when game state is loaded
  useEffect(() => {
    if (gameState.videoRoomUrl && roomUrl !== gameState.videoRoomUrl) {
      setRoomUrl(gameState.videoRoomUrl);
      showAlertMessage(t('roomUrlLoaded'), 'success');
      console.log('[VideoRoom] Loaded existing room URL from game state:', gameState.videoRoomUrl);
    }
  }, [gameState.videoRoomUrl, roomUrl, showAlertMessage, t]);

  // Reset creation flags when gameId changes
  useEffect(() => {
    setRoomCreationAttempted(false);
    setIsCreatingRoom(false);
    console.log('[VideoRoom] GameId changed, resetting room creation flags for:', gameId);
  }, [gameId]);

  // Auto-create room for host/controller if none exists - with safeguards
  useEffect(() => {
    console.log('[VideoRoom] Checking room creation conditions:', {
      participantType: myParticipant.type,
      gameStateGameId: gameState.gameId,
      currentGameId: gameId,
      hasVideoRoomUrl: !!gameState.videoRoomUrl,
      videoRoomCreated: gameState.videoRoomCreated,
      roomCreationAttempted,
      isCreatingRoom
    });

    // Only proceed if:
    // 1. We're a host or controller
    // 2. Game state is loaded (gameId matches our gameId)
    // 3. No room URL exists in game state
    // 4. Room creation was not marked as done in game state
    // 5. We haven't attempted creation yet
    // 6. We're not currently creating a room
    if (
      (myParticipant.type === 'host' || myParticipant.type === 'controller') &&
      gameState.gameId === gameId && // Ensure game state is loaded for this gameId
      !gameState.videoRoomUrl &&
      !gameState.videoRoomCreated &&
      !roomCreationAttempted &&
      !isCreatingRoom
    ) {
      console.log('[VideoRoom] All conditions met - creating new room for gameId:', gameId);
      
      // Add a small delay to ensure all state updates are processed
      const timeoutId = setTimeout(() => {
        const createRoom = async () => {
          setIsCreatingRoom(true);
          setRoomCreationAttempted(true);
          
          try {
            showAlertMessage('Creating video room...', 'info');
            const result = await createVideoRoom(gameId);
            if (result.success && result.roomUrl) {
              setRoomUrl(result.roomUrl);
              showAlertMessage('Video room created successfully!', 'success');
              console.log('[VideoRoom] Room created successfully:', result.roomUrl);
            } else {
              showAlertMessage('Failed to create video room', 'error');
              console.error('[VideoRoom] Room creation failed:', result);
            }
          } catch (error) {
            console.error('[VideoRoom] Failed to auto-create video room:', error);
            showAlertMessage('Error creating video room automatically', 'error');
          } finally {
            setIsCreatingRoom(false);
          }
        };
        
        createRoom();
      }, 1000); // 1 second delay to ensure state is stable
      
      return () => clearTimeout(timeoutId);
    }
  }, [
    gameState.gameId,
    gameState.videoRoomUrl, 
    gameState.videoRoomCreated, 
    myParticipant.type, 
    gameId, 
    roomCreationAttempted, 
    isCreatingRoom, 
    createVideoRoom, 
    showAlertMessage
  ]);

  // Auto-generate token when room URL is available
  useEffect(() => {
    if (gameState.videoRoomUrl && !preAuthToken && !isGeneratingToken) {
      setIsGeneratingToken(true);
      generateDailyToken(
        gameId,
        myParticipant.name,
        myParticipant.type.startsWith('host'),
        false // Not observer mode
      )
        .then((token) => {
          if (token) {
            setPreAuthToken(token);
            showAlertMessage(t('tokenGenerated'), 'success');
          } else {
            showAlertMessage(t('failedGenerateToken'), 'warning');
          }
        })
        .catch((error) => {
          console.error('Failed to generate token:', error);
          showAlertMessage(t('failedGenerateToken'), 'warning');
        })
        .finally(() => {
          setIsGeneratingToken(false);
        });
    }
  }, [gameState.videoRoomUrl, preAuthToken, isGeneratingToken, generateDailyToken, gameId, myParticipant.name, myParticipant.type, showAlertMessage, t]);

  // Join call function
  const joinCall = useCallback(async () => {
    if (!daily || !roomUrl.trim() || isJoining) return;

    setIsJoining(true);
    try {
      showAlertMessage(t('joiningCallMsg'), 'info');
      
      // Prepare join options
      const joinOptions: {
        url: string;
        userName: string;
        token?: string;
      } = {
        url: roomUrl.trim(),
        userName: userName || myParticipant.name,
      };

      // Add token if provided
      if (preAuthToken.trim()) {
        joinOptions.token = preAuthToken.trim();
      }

      // Join the call
      await daily.join(joinOptions);
      
      showAlertMessage(t('joinedCallSuccessfully'), 'success');
    } catch (error) {
      console.error('Failed to join call:', error);
      showAlertMessage(`${t('failedJoinCall')}: ${error instanceof Error ? error.message : t('unknownError')}`, 'error');
    } finally {
      setIsJoining(false);
    }
  }, [daily, roomUrl, userName, myParticipant.name, preAuthToken, isJoining, showAlertMessage, t]);

  // Leave call function
  const leaveCall = useCallback(async () => {
    if (!daily) return;

    try {
      await daily.leave();
      showAlertMessage(t('leftCall'), 'info');
    } catch (error) {
      console.error('Failed to leave call:', error);
      showAlertMessage(t('failedLeaveCall'), 'error');
    }
  }, [daily, showAlertMessage, t]);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (!daily) return;
    try {
      const isVideoOn = daily.localVideo();
      await daily.setLocalVideo(!isVideoOn);
    } catch (error) {
      console.error('Failed to toggle camera:', error);
    }
  }, [daily]);

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    if (!daily) return;
    try {
      const isAudioOn = daily.localAudio();
      await daily.setLocalAudio(!isAudioOn);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  }, [daily]);

  const isInCall = meetingState === 'joined-meeting';
  const canJoin = !isInCall && roomUrl.trim() && !isJoining;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30 space-y-4">
      <h3 className="text-lg font-bold text-white text-center">
        {t('dailyVideoSystem')}
      </h3>

      {/* Control Panel - Compact Layout */}
      <div className="bg-gray-700/50 rounded-lg p-3 space-y-3">
        <h4 className="text-base font-semibold text-white">{t('connectionSettings')}</h4>
        
        {/* Side by side layout for larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Room URL and Name */}
          <div className="space-y-3">
            <div>
              <label className="block text-white text-sm mb-1">
                {t('roomUrl')} {gameState.videoRoomUrl ? t('roomUrlAutoLoaded') : '*'}
              </label>
              <input
                type="url"
                value={roomUrl}
                onChange={(e) => setRoomUrl(e.target.value)}
                placeholder="https://yourdomain.daily.co/room-name"
                disabled={isInCall}
                className="w-full px-2 py-1 text-sm bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-400 focus:outline-none disabled:opacity-50"
              />
              {gameState.videoRoomUrl && roomUrl === gameState.videoRoomUrl && (
                <p className="text-green-400 text-xs mt-1">
                  {t('roomUrlFromSession')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-white text-sm mb-1">
                {t('userName')} {t('userNameFromSession')}
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isInCall}
                className="w-full px-2 py-1 text-sm bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-400 focus:outline-none disabled:opacity-50"
              />
              <p className="text-green-400 text-xs mt-1">
                {t('userNameLoaded')}
              </p>
            </div>
          </div>

          {/* Token and Controls */}
          <div className="space-y-3">
            <div>
              <label className="block text-white text-sm mb-1">
                {t('preAuthToken')} {preAuthToken ? t('preAuthTokenAutoGenerated') : isGeneratingToken ? t('preAuthTokenGenerating') : t('preAuthTokenOptional')}
              </label>
              <input
                type="text"
                value={preAuthToken}
                onChange={(e) => setPreAuthToken(e.target.value)}
                placeholder={isGeneratingToken ? t('generatingToken') : "Meeting token (optional)"}
                disabled={isInCall || isGeneratingToken}
                className="w-full px-2 py-1 text-sm bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-400 focus:outline-none disabled:opacity-50"
              />
              {preAuthToken && (
                <p className="text-green-400 text-xs mt-1">
                  {t('tokenGenerated')}
                </p>
              )}
              {isGeneratingToken && (
                <p className="text-blue-400 text-xs mt-1">
                  {t('tokenGenerating')}
                </p>
              )}
            </div>

            {/* Call Controls */}
            <div className="flex gap-2 flex-wrap">
              {!isInCall ? (
                <button
                  onClick={joinCall}
                  disabled={!canJoin}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                >
                  {isJoining ? t('joiningCall') : t('joinCall')}
                </button>
              ) : (
                <>
                  <button
                    onClick={leaveCall}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    {t('leaveCall')}
                  </button>
                  <button
                    onClick={toggleCamera}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    {t('camera')}
                  </button>
                  <button
                    onClick={toggleMicrophone}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                  >
                    {t('microphone')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Meeting Status - Compact */}
      <div className="bg-blue-500/20 rounded-lg p-2 border border-blue-500/30 text-center">
        <div className="text-blue-300 text-sm">
          {t('meetingState')}: <span className="font-mono text-accent2">{meetingState}</span>
        </div>
        <div className="text-blue-200 text-xs mt-1">
          {t('participants')}: {participantIds.length}
        </div>
      </div>

      {/* Video Grid - Mobile-optimized, compact layout */}
      <div className="bg-gray-900/50 rounded-lg p-3 min-h-[300px]">
        <h4 className="text-white text-sm text-center mb-3">
          {t('videosTitle')}
        </h4>
        
        {isInCall && participantIds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {participantIds.slice(0, 3).map((id, index) => (
              <ParticipantVideo
                key={id}
                sessionId={id}
                index={index}
                localParticipantId={localParticipant?.session_id}
              />
            ))}
            
            {/* Fill remaining slots with placeholders */}
            {Array.from({ length: Math.max(0, 3 - participantIds.length) }).map((_, index) => (
              <div key={`placeholder-${index}`} className="bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600">
                <div className="aspect-[4/3] flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-2xl mb-1">👤</div>
                    <div className="text-xs">{t('waitingForParticipant')} {participantIds.length + index + 1}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isInCall ? (
          <div className="text-center text-gray-400 py-10">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-sm">{t('connectedWaiting')}</div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-10">
            <div className="text-2xl mb-2">📹</div>
            <div className="text-sm">{t('enterRoomAndJoin')}</div>
          </div>
        )}
      </div>

      {/* Audio component for call audio */}
      {isInCall && <DailyAudio />}
    </div>
  );
}

// Main component
export default function SimpleKitchenSinkVideo({ 
  gameId,
  myParticipant, 
  showAlertMessage, 
  className = '' 
}: SimpleKitchenSinkVideoProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const { t } = useTranslation();

  // Create call object - only once
  useEffect(() => {
    let isMounted = true;
    
    const createCallObject = async () => {
      try {
        console.log('[VideoRoom] Creating Daily call object...');
        const newCallObject = DailyIframe.createCallObject({
          iframeStyle: {
            position: 'relative',
            width: '100%',
            height: '100%',
            border: 'none',
          },
        });
        
        if (isMounted) {
          setCallObject(newCallObject);
          console.log('[VideoRoom] Daily call object created successfully');
        } else {
          // Component was unmounted, cleanup
          newCallObject.destroy();
        }
      } catch (error) {
        console.error('[VideoRoom] Failed to create Daily call object:', error);
        if (isMounted && showAlertMessage && t) {
          showAlertMessage(t('failedInitVideoComponents'), 'error');
        }
      }
    };

    if (!callObject) {
      createCallObject();
    }

    // Cleanup
    return () => {
      isMounted = false;
      if (callObject) {
        try {
          console.log('[VideoRoom] Cleaning up Daily call object...');
          callObject.destroy();
        } catch (error) {
          console.warn('[VideoRoom] Error during call object cleanup:', error);
        }
      }
    };
  }, [callObject, showAlertMessage, t]); // Include dependencies

  if (!callObject) {
    return (
      <div className={`bg-gray-500/20 border border-gray-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400 text-base font-bold mb-2">
            {t('loadingVideoComponents')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <DailyProvider callObject={callObject}>
        <VideoContent 
          gameId={gameId}
          myParticipant={myParticipant}
          showAlertMessage={showAlertMessage}
        />
      </DailyProvider>
    </div>
  );
}