import { useState } from 'react';
import type { FakeParticipant } from '@/state/fakeParticipantsAtoms';

interface FakeVideoSimulatorProps {
  participant: FakeParticipant;
  onNameChange: (name: string) => void;
  onConnectionToggle: () => void;
  onRemove: () => void;
  className?: string;
}

export default function FakeVideoSimulator({
  participant,
  onNameChange,
  onConnectionToggle,
  onRemove,
  className = '',
}: FakeVideoSimulatorProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(participant.name);

  const handleNameSubmit = () => {
    onNameChange(tempName);
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName(participant.name);
    setIsEditingName(false);
  };

  const getColorScheme = () => {
    switch (participant.type) {
      case 'host':
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/20',
          text: 'text-blue-300',
          accent: 'bg-blue-600',
          light: 'bg-blue-500/10'
        };
      case 'playerA':
        return {
          border: 'border-green-500/30',
          bg: 'bg-green-500/20',
          text: 'text-green-300',
          accent: 'bg-green-600',
          light: 'bg-green-500/10'
        };
      case 'playerB':
        return {
          border: 'border-purple-500/30',
          bg: 'bg-purple-500/20',
          text: 'text-purple-300',
          accent: 'bg-purple-600',
          light: 'bg-purple-500/10'
        };
      default:
        return {
          border: 'border-gray-500/30',
          bg: 'bg-gray-500/20',
          text: 'text-gray-300',
          accent: 'bg-gray-600',
          light: 'bg-gray-500/10'
        };
    }
  };

  const colors = getColorScheme();

  return (
    <div className={`relative ${className}`}>
      {/* Header with participant info and controls */}
      <div className={`${colors.bg} border ${colors.border} rounded-t-xl p-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            participant.isConnected ? 'bg-green-500' : 'bg-gray-500'
          }`}></div>
          
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="px-2 py-1 text-sm bg-gray-800 text-white rounded border border-gray-600 font-arabic"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSubmit();
                  if (e.key === 'Escape') handleNameCancel();
                }}
                autoFocus
              />
              <button
                onClick={handleNameSubmit}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-arabic"
              >
                ✓
              </button>
              <button
                onClick={handleNameCancel}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-arabic"
              >
                ✗
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className={`${colors.text} font-bold font-arabic hover:text-white transition-colors`}
            >
              {participant.name}
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400 font-arabic">
            {participant.type === 'host' ? 'المقدم الوهمي' : 
             participant.type === 'playerA' ? 'لاعب وهمي 1' : 'لاعب وهمي 2'}
          </div>
          <button
            onClick={onConnectionToggle}
            className={`px-2 py-1 text-xs rounded font-arabic transition-colors ${
              participant.isConnected 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {participant.isConnected ? 'متصل' : 'قطع الاتصال'}
          </button>
          <button
            onClick={onRemove}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-arabic transition-colors"
          >
            إزالة
          </button>
        </div>
      </div>

      {/* Simulated video content */}
      <div 
        className={`w-full bg-gray-800 rounded-b-xl border-none ${colors.border} border-t-0 flex items-center justify-center relative overflow-hidden`}
        style={{ aspectRatio: participant.aspectRatio }}
      >
        {participant.isConnected ? (
          <>
            {/* Simulated video background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{ 
                background: `linear-gradient(45deg, ${participant.avatarColor}40, ${participant.avatarColor}20)`,
                backgroundSize: '20px 20px',
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
              }}
            />
            
            {/* Avatar circle */}
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: participant.avatarColor }}
            >
              {participant.name.charAt(0)}
            </div>
            
            {/* Simulated video controls overlay */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              <div className="w-6 h-6 bg-black/70 rounded flex items-center justify-center">
                <span className="text-white text-xs">🎤</span>
              </div>
              <div className="w-6 h-6 bg-black/70 rounded flex items-center justify-center">
                <span className="text-white text-xs">📷</span>
              </div>
            </div>
            
            {/* Participant name overlay */}
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-arabic">
              {participant.name}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <div className="text-4xl mb-2">📵</div>
            <div className="text-sm font-arabic">غير متصل</div>
          </div>
        )}
      </div>

      {/* Fake participant indicator */}
      <div className="absolute top-1 right-1 bg-yellow-500 text-black px-1 py-0.5 rounded text-xs font-bold">
        وهمي
      </div>
    </div>
  );
}