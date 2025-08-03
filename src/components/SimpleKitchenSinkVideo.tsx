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
      <div className="aspect-[3/4] sm:aspect-video relative">
        <DailyVideo 
          sessionId={sessionId}
          type="video"
          automirror={sessionId === localParticipantId}
          className="w-full h-full object-cover"
        />
        
        {/* Participant name overlay - now shows actual name */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-arabic">
          {participantName} {sessionId === localParticipantId ? '(أنت)' : ''}
        </div>
        
        {/* Video number indicator */}
        <div className="absolute top-2 right-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
          {index + 1}
        </div>
      </div>
      
      {/* Player name below video */}
      <div className="p-3 bg-gray-800/80 text-center">
        <p className="text-white font-arabic font-semibold">
          {participantName}
        </p>
        {participant?.user_id && participant.user_id !== participantName && (
          <p className="text-gray-400 text-xs font-arabic mt-1">
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
  
  const [roomUrl, setRoomUrl] = useState('');
  const [userName, setUserName] = useState(myParticipant.name);
  const [isJoining, setIsJoining] = useState(false);
  const [preAuthToken, setPreAuthToken] = useState('');
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  // Auto-populate room URL and generate token when component mounts or game state changes
  useEffect(() => {
    if (gameState.videoRoomUrl && roomUrl !== gameState.videoRoomUrl) {
      setRoomUrl(gameState.videoRoomUrl);
      showAlertMessage('تم تحميل رابط الغرفة تلقائياً', 'success');
    } else if (!gameState.videoRoomUrl && !gameState.videoRoomCreated && myParticipant.type.startsWith('host')) {
      // Auto-create room for host if none exists
      const createRoom = async () => {
        try {
          showAlertMessage('جاري إنشاء غرفة فيديو جديدة...', 'info');
          const result = await createVideoRoom(gameId);
          if (result.success && result.roomUrl) {
            setRoomUrl(result.roomUrl);
            showAlertMessage('تم إنشاء غرفة الفيديو بنجاح!', 'success');
          } else {
            showAlertMessage('فشل في إنشاء غرفة الفيديو', 'error');
          }
        } catch (error) {
          console.error('Failed to auto-create video room:', error);
          showAlertMessage('خطأ في إنشاء غرفة الفيديو تلقائياً', 'error');
        }
      };
      createRoom();
    }
  }, [gameState.videoRoomUrl, gameState.videoRoomCreated, roomUrl, myParticipant.type, gameId, createVideoRoom, showAlertMessage]);

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
            showAlertMessage('تم إنشاء رمز الدخول تلقائياً', 'success');
          } else {
            showAlertMessage('تعذر إنشاء رمز الدخول، يمكنك المتابعة بدونه', 'warning');
          }
        })
        .catch((error) => {
          console.error('Failed to generate token:', error);
          showAlertMessage('تعذر إنشاء رمز الدخول، يمكنك المتابعة بدونه', 'warning');
        })
        .finally(() => {
          setIsGeneratingToken(false);
        });
    }
  }, [gameState.videoRoomUrl, preAuthToken, isGeneratingToken, generateDailyToken, gameId, myParticipant.name, myParticipant.type, showAlertMessage]);

  // Join call function
  const joinCall = useCallback(async () => {
    if (!daily || !roomUrl.trim() || isJoining) return;

    setIsJoining(true);
    try {
      showAlertMessage('جاري الانضمام للمكالمة...', 'info');
      
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
      
      showAlertMessage('تم الانضمام للمكالمة بنجاح!', 'success');
    } catch (error) {
      console.error('Failed to join call:', error);
      showAlertMessage(`فشل في الانضمام للمكالمة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, 'error');
    } finally {
      setIsJoining(false);
    }
  }, [daily, roomUrl, userName, myParticipant.name, preAuthToken, isJoining, showAlertMessage]);

  // Leave call function
  const leaveCall = useCallback(async () => {
    if (!daily) return;

    try {
      await daily.leave();
      showAlertMessage('تم مغادرة المكالمة', 'info');
    } catch (error) {
      console.error('Failed to leave call:', error);
      showAlertMessage('خطأ في مغادرة المكالمة', 'error');
    }
  }, [daily, showAlertMessage]);

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
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600/30 space-y-6">
      <h3 className="text-xl font-bold text-white text-center font-arabic">
        Daily.co Kitchen Sink Video
      </h3>

      {/* Control Panel */}
      <div className="bg-gray-700/50 rounded-lg p-4 space-y-4">
        <h4 className="text-lg font-semibold text-white font-arabic">إعدادات الاتصال</h4>
        
        {/* Auto-filled Room URL */}
        <div>
          <label className="block text-white font-arabic text-sm mb-2">
            رابط الغرفة {gameState.videoRoomUrl ? '✅ (تم التحميل تلقائياً)' : '*'}
          </label>
          <input
            type="url"
            value={roomUrl}
            onChange={(e) => setRoomUrl(e.target.value)}
            placeholder="https://yourdomain.daily.co/room-name"
            disabled={isInCall}
            className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-400 focus:outline-none disabled:opacity-50"
          />
          {gameState.videoRoomUrl && roomUrl === gameState.videoRoomUrl && (
            <p className="text-green-400 text-xs mt-1 font-arabic">
              تم تحميل رابط الغرفة من الجلسة الحالية
            </p>
          )}
        </div>

        {/* Pre-filled User Name */}
        <div>
          <label className="block text-white font-arabic text-sm mb-2">
            اسم المستخدم ✅ (من معلومات الجلسة)
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isInCall}
            className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-400 focus:outline-none disabled:opacity-50"
          />
          <p className="text-green-400 text-xs mt-1 font-arabic">
            تم تحميل الاسم من معلومات المشارك
          </p>
        </div>

        {/* Auto-generated Pre-Auth Token */}
        <div>
          <label className="block text-white font-arabic text-sm mb-2">
            رمز التحقق المسبق {preAuthToken ? '✅ (تم الإنشاء تلقائياً)' : isGeneratingToken ? '⏳ (جاري الإنشاء...)' : '(اختياري)'}
          </label>
          <input
            type="text"
            value={preAuthToken}
            onChange={(e) => setPreAuthToken(e.target.value)}
            placeholder={isGeneratingToken ? "جاري إنشاء رمز الدخول..." : "Meeting token (optional)"}
            disabled={isInCall || isGeneratingToken}
            className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-400 focus:outline-none disabled:opacity-50"
          />
          {preAuthToken && (
            <p className="text-green-400 text-xs mt-1 font-arabic">
              تم إنشاء رمز الدخول تلقائياً
            </p>
          )}
          {isGeneratingToken && (
            <p className="text-blue-400 text-xs mt-1 font-arabic">
              جاري إنشاء رمز الدخول...
            </p>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex gap-3 justify-center">
          {!isInCall ? (
            <button
              onClick={joinCall}
              disabled={!canJoin}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded font-arabic transition-colors"
            >
              {isJoining ? 'جاري الانضمام...' : 'انضمام للمكالمة'}
            </button>
          ) : (
            <>
              <button
                onClick={leaveCall}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-arabic transition-colors"
              >
                مغادرة المكالمة
              </button>
              <button
                onClick={toggleCamera}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-arabic transition-colors"
              >
                🎥 كاميرا
              </button>
              <button
                onClick={toggleMicrophone}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-arabic transition-colors"
              >
                🎤 ميكروفون
              </button>
            </>
          )}
        </div>
      </div>

      {/* Meeting Status */}
      <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30 text-center">
        <div className="text-blue-300 font-arabic">
          حالة الاجتماع: <span className="font-mono text-accent2">{meetingState}</span>
        </div>
        <div className="text-blue-200 font-arabic mt-1">
          المشاركون: {participantIds.length}
        </div>
      </div>

      {/* Video Grid - Mobile-optimized layout */}
      <div className="bg-gray-900/50 rounded-lg p-4 min-h-[500px]">
        <h4 className="text-white font-arabic text-center mb-4">
          الفيديوهات (محسّن للهواتف الذكية)
        </h4>
        
        {isInCall && participantIds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="aspect-[3/4] sm:aspect-video flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">👤</div>
                    <div className="font-arabic">في انتظار المشارك {participantIds.length + index + 1}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isInCall ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-4xl mb-4">⏳</div>
            <div className="font-arabic">متصل، في انتظار المشاركين...</div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-20">
            <div className="text-4xl mb-4">📹</div>
            <div className="font-arabic">أدخل رابط الغرفة وانقر "انضمام للمكالمة"</div>
          </div>
        )}
      </div>

      {/* Audio component for call audio */}
      {isInCall && <DailyAudio />}

      {/* Info Panel */}
      <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
        <p className="text-green-300 text-sm text-center font-arabic">
          ✅ تطبيق Daily.co Kitchen Sink المحسن - تحميل تلقائي للإعدادات
        </p>
        <div className="text-green-200 text-xs text-center mt-2 font-arabic space-y-1">
          <div>• رابط الغرفة محمل تلقائياً من الجلسة</div>
          <div>• اسم المستخدم محمل من معلومات المشارك</div>
          <div>• رمز الدخول يتم إنشاؤه تلقائياً</div>
          <div>• كل ما عليك فعله هو الضغط على "انضمام للمكالمة"</div>
          <div>• الفيديوهات مرتبة عمودياً مع أرقام واضحة</div>
        </div>
      </div>
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

  // Create call object
  useEffect(() => {
    const createCallObject = async () => {
      try {
        const newCallObject = DailyIframe.createCallObject({
          iframeStyle: {
            position: 'relative',
            width: '100%',
            height: '100%',
            border: 'none',
          },
        });
        setCallObject(newCallObject);
      } catch (error) {
        console.error('Failed to create Daily call object:', error);
        showAlertMessage('فشل في تهيئة مكونات الفيديو', 'error');
      }
    };

    if (!callObject) {
      createCallObject();
    }

    // Cleanup
    return () => {
      if (callObject) {
        try {
          callObject.destroy();
        } catch (error) {
          console.warn('Error during call object cleanup:', error);
        }
      }
    };
  }, [showAlertMessage]); // Fixed dependency array

  if (!callObject) {
    return (
      <div className={`bg-gray-500/20 border border-gray-500/30 rounded-xl p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg font-bold mb-2 font-arabic">
            جاري تهيئة مكونات الفيديو...
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