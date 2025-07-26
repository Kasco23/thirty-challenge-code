import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Daily.co integration
let DailyIframe: typeof import('@daily-co/daily-js').default | null = null;

// Daily.co types
interface DailyCallFrame {
  iframe(): HTMLIFrameElement;
  join(options: { url: string; userName: string }): Promise<void>;
  on(event: string, callback: (data: { error?: { msg: string } }) => void): DailyCallFrame;
  destroy(): void;
}

interface DailyFrameOptions {
  iframeStyle: {
    width: string;
    height: string;
    border: string;
    borderRadius: string;
  };
  showLeaveButton: boolean;
  showFullscreenButton: boolean;
  showLocalVideo: boolean;
  showParticipantsBar: boolean;
}

// Dynamically import Daily.co only if API key is available
const initializeDaily = async () => {
  if (import.meta.env.VITE_DAILY_API_KEY && import.meta.env.VITE_DAILY_API_KEY !== 'your_daily_api_key_here') {
    try {
      const Daily = await import('@daily-co/daily-js');
      DailyIframe = Daily.default;
      return true;
    } catch (error) {
      console.warn('Failed to load Daily.co:', error);
      return false;
    }
  }
  return false;
};

interface VideoRoomProps {
  roomName?: string;
  userName?: string;
}

export default function VideoRoom({ roomName = 'quiz-room', userName = 'User' }: VideoRoomProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [dailyAvailable, setDailyAvailable] = useState(false);
  const callFrameRef = useRef<HTMLDivElement>(null);
  const callFrame = useRef<DailyCallFrame | null>(null);

  // Initialize Daily.co
  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      const available = await initializeDaily();
      setDailyAvailable(available);
      
      if (available && DailyIframe) {
        try {
          // Create Daily call frame
          const frameOptions: DailyFrameOptions = {
            iframeStyle: {
              width: '100%',
              height: '100%',
              border: '0',
              borderRadius: '8px',
            },
            showLeaveButton: false,
            showFullscreenButton: false,
            showLocalVideo: true,
            showParticipantsBar: false,
          };
          
          callFrame.current = DailyIframe.createFrame(frameOptions) as DailyCallFrame;

          // Attach to DOM
          if (callFrameRef.current && callFrame.current.iframe()) {
            callFrameRef.current.appendChild(callFrame.current.iframe());
          }

          // Set up event listeners
          callFrame.current
            .on('joined-meeting', () => {
              setIsConnected(true);
              setIsLoading(false);
              setError(null);
            })
            .on('left-meeting', () => {
              setIsConnected(false);
            })
            .on('error', (event: { error?: { msg: string } }) => {
              setError(`Connection error: ${event.error?.msg || 'Unknown error'}`);
              setIsLoading(false);
            });

          // Join the room
          const roomUrl = `https://thirty-challenge.daily.co/${roomName}`;
          await callFrame.current.join({ 
            url: roomUrl,
            userName: userName
          });

        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(`Failed to initialize video: ${errorMessage}`);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    setup();

    // Cleanup
    return () => {
      if (callFrame.current) {
        callFrame.current.destroy();
      }
    };
  }, [roomName, userName]);

  // If Daily.co is not available, show placeholder with instructions
  if (!dailyAvailable) {
    return (
      <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <p className="text-white text-sm font-arabic">إعداد الفيديو مطلوب</p>
            <button
              onClick={() => setShowInstructions(true)}
              className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
            >
              إعداد Daily.co
            </button>
          </motion.div>
        </div>

        {/* Setup instructions overlay */}
        {showInstructions && (
          <motion.div
            className="absolute inset-0 bg-black/90 p-4 text-white text-xs overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-300"
            >
              ✕
            </button>
            
            <h3 className="font-bold mb-3 text-yellow-300">🎥 Daily.co Setup Instructions:</h3>
            
            <div className="space-y-3">
              <div className="bg-blue-500/20 p-3 rounded">
                <p className="font-bold text-blue-300">1. Get Daily.co API Key:</p>
                <p>• Go to https://daily.co/dashboard</p>
                <p>• Sign up (free account)</p>
                <p>• Go to Developers → API Keys</p>
                <p>• Copy your API key</p>
              </div>
              
              <div className="bg-green-500/20 p-3 rounded">
                <p className="font-bold text-green-300">2. Add to Environment:</p>
                <p>• Local: Add to your .env file:</p>
                <code className="block bg-black/50 p-2 mt-1 rounded text-xs">
                  VITE_DAILY_API_KEY=your_api_key_here
                </code>
                <p className="mt-2">• Netlify: Add in Site Settings → Environment Variables</p>
              </div>
              
              <div className="bg-purple-500/20 p-3 rounded">
                <p className="font-bold text-purple-300">3. Daily.co Free Tier:</p>
                <p>• 10,000 minutes/month FREE</p>
                <p>• $15 credit for evaluation</p>
                <p>• Perfect for your quiz sessions!</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-500/20 rounded">
              <p className="text-yellow-200 font-bold">💡 Alternative Options:</p>
              <p className="text-yellow-200">If you prefer not to use Daily.co:</p>
              <p>• Use WhatsApp video call on phones</p>
              <p>• Use Discord voice chat</p>
              <p>• Use Zoom (40min limit)</p>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // Daily.co is available - show video interface
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {/* Video container */}
      <div ref={callFrameRef} className="w-full h-full" />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm font-arabic">جاري الاتصال بالفيديو...</p>
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <p className="text-sm font-arabic mb-2">خطأ في الاتصال:</p>
            <p className="text-xs">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}
      
      {/* Connection status indicator */}
      <div className="absolute top-2 left-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
    </div>
  );
}