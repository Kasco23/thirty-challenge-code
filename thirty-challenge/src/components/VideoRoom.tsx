import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// For now, this is a placeholder component
// To use Daily.co, you'll need to:
// 1. Sign up at https://daily.co
// 2. Get your API key
// 3. Install @daily-co/daily-js: npm install @daily-co/daily-js
// 4. Replace this component with actual Daily.co integration

export default function VideoRoom() {
  const [isConnected, setIsConnected] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Simulate connection for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => setIsConnected(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
      {/* Video placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isConnected ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <p className="text-white text-sm font-arabic">كاميرا متصلة</p>
          </motion.div>
        ) : (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white/70 text-sm font-arabic">جاري الاتصال...</p>
          </div>
        )}
      </div>

      {/* Setup instructions button */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-1 rounded text-xs"
        title="Video Setup Instructions"
      >
        ℹ️
      </button>

      {/* Instructions overlay */}
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
          
          <h3 className="font-bold mb-2">Daily.co Video Setup:</h3>
          <div className="space-y-2 text-xs">
            <p>1. Sign up at https://daily.co (free tier available)</p>
            <p>2. Get your API key from dashboard</p>
            <p>3. Install: npm install @daily-co/daily-js</p>
            <p>4. Add to .env: VITE_DAILY_API_KEY=your_key</p>
            <p>5. Replace this component with real Daily.co integration</p>
          </div>
          
          <div className="mt-4 p-2 bg-yellow-500/20 rounded">
            <p className="text-yellow-200">
              <strong>Note:</strong> This is currently a placeholder. 
              The app works without video chat for now.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}