import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Dynamic import for Daily.co
let DailyIframe: typeof import('@daily-co/daily-js').default | null = null;

interface DailyCallFrame {
  join(options: { url: string; token?: string }): Promise<void>;
  leave(): Promise<void>;
  destroy(): void;
  iframe(): HTMLIFrameElement;
  on(event: string, handler: (event?: unknown) => void): void;
  off(event: string, handler: (event?: unknown) => void): void;
}

interface DailyFrameOptions {
  showLeaveButton: boolean;
  showFullscreenButton: boolean;
  showLocalVideo: boolean;
  showParticipantsBar: boolean;
}

// Initialize Daily.co SDK
const initializeDaily = async (): Promise<boolean> => {
  try {
    if (!DailyIframe) {
      const DailyJs = await import('@daily-co/daily-js');
      DailyIframe = DailyJs.default;
    }
    return true;
  } catch (error) {
    console.error('Failed to load Daily.co SDK:', error);
    return false;
  }
};

// API functions for room and token management
const createRoom = async (roomName: string): Promise<{ roomName: string; url: string } | null> => {
  try {
    const response = await fetch('/.netlify/functions/create-daily-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create room: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating room:', error);
    return null;
  }
};

const createToken = async (room: string, user: string, isHost: boolean): Promise<string | null> => {
  try {
    const response = await fetch('/.netlify/functions/create-daily-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, user, isHost })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create token: ${response.status}`);
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error creating token:', error);
    return null;
  }
};

interface VideoRoomProps {
  roomName?: string;
  userName?: string;
  isHost?: boolean;
}

export default function VideoRoom({ roomName = 'quiz-room', userName = 'User', isHost = false }: VideoRoomProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  
  const callFrameRef = useRef<HTMLDivElement>(null);
  const callFrame = useRef<DailyCallFrame | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const setup = async () => {
      setIsLoading(true);
      setError(null);

      // Initialize Daily.co SDK
      const dailyAvailable = await initializeDaily();
      if (!dailyAvailable) {
        setError('Daily.co SDK not available');
        setIsLoading(false);
        return;
      }

      try {
        // Create room first
        const roomData = await createRoom(roomName);
        if (!roomData) {
          setError('Failed to create video room');
          setIsLoading(false);
          return;
        }

        setRoomUrl(roomData.url);

        // Create token for user
        const token = await createToken(roomName, userName, isHost);
        if (!token) {
          setError('Failed to create access token');
          setIsLoading(false);
          return;
        }

        // If this is a host PC (control only), don't initialize video
        if (isHost && !userName.includes('mobile')) {
          setIsLoading(false);
          return;
        }

        // Initialize Daily.co frame
        if (DailyIframe && !callFrame.current) {
          const frameOptions: DailyFrameOptions = {
            showLeaveButton: true,
            showFullscreenButton: false,
            showLocalVideo: true,
            showParticipantsBar: true
          };

          callFrame.current = DailyIframe.createFrame(frameOptions) as DailyCallFrame;

          // Event listeners
          const handleJoined = () => {
            console.log('Successfully joined Daily.co room');
            setIsConnected(true);
            setIsLoading(false);
          };

          const handleLeft = () => {
            console.log('Left Daily.co room');
            setIsConnected(false);
          };

          const handleError = (event?: unknown) => {
            const errorEvent = event as { errorMsg?: string } | undefined;
            console.error('Daily.co error:', event);
            setError(`Video error: ${errorEvent?.errorMsg || 'Unknown error'}`);
            setIsLoading(false);
          };

          callFrame.current.on('joined-meeting', handleJoined);
          callFrame.current.on('left-meeting', handleLeft);
          callFrame.current.on('error', handleError);

          // Append iframe to container
          if (callFrameRef.current && callFrame.current.iframe()) {
            callFrameRef.current.innerHTML = '';
            callFrameRef.current.appendChild(callFrame.current.iframe());
          }

          // Join room with token
          await callFrame.current.join({
            url: roomData.url,
            token: token
          });
        }

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Setup error:', errorMessage);
        setError(`Setup failed: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    setup();

    // Cleanup
    return () => {
      if (callFrame.current) {
        try {
          callFrame.current.destroy();
        } catch (error) {
          console.warn('Error destroying Daily.co frame:', error);
        }
        callFrame.current = null;
      }
      isInitialized.current = false;
    };
  }, [roomName, userName, isHost]);

  // Host PC view (control only, no video)
  if (isHost && !userName.includes('mobile')) {
    return (
      <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="text-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-white text-lg font-arabic mb-2">🎮 جهاز التحكم</div>
            <p className="text-white/70 text-sm font-arabic mb-4">هذا الجهاز للتحكم في اللعبة فقط</p>
            {roomUrl && (
              <div className="bg-blue-500/20 rounded-lg p-3">
                <p className="text-blue-300 text-xs font-arabic mb-1">غرفة الفيديو جاهزة</p>
                <p className="text-blue-200 text-xs font-mono">{roomName}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-sm font-arabic">جاري الاتصال بالفيديو...</p>
            <p className="text-white/70 text-xs font-arabic mt-1">{userName}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative w-full aspect-video bg-gradient-to-br from-red-900/30 to-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <motion.div 
            className="text-center max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-red-400 text-lg mb-2">⚠️</div>
            <p className="text-red-300 text-sm font-arabic mb-4">{error}</p>
            
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-blue-400 text-xs font-arabic underline hover:text-blue-300"
            >
              عرض البدائل المجانية
            </button>

            {showInstructions && (
              <motion.div 
                className="mt-4 p-3 bg-blue-500/10 rounded-lg text-right"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <p className="text-blue-300 text-xs font-arabic mb-2">بدائل مجانية للفيديو:</p>
                <div className="text-blue-200 text-xs font-arabic space-y-1">
                  <p>• واتساب (مكالمة جماعية)</p>
                  <p>• ديسكورد (مجاني تماماً)</p>
                  <p>• زوم (40 دقيقة مجاناً)</p>
                  <p>• جوجل ميت (مجاني)</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Video interface
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div ref={callFrameRef} className="w-full h-full" />
      
      {/* User info overlay */}
      <div className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-1">
        <p className="text-white text-xs font-arabic">{userName}</p>
      </div>

      {/* Connection status */}
      <div className="absolute top-2 right-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
    </div>
  );
}