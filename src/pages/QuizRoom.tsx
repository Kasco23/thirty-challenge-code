// src/pages/QuizRoom.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// import DailyIframe from '@daily-co/daily-js'; // Uncomment when using Daily.co
import { CLUB_THEMES } from '../themes/clubs';

// --- Context for Team/Theme selection ---
const ThemeContext = React.createContext({
  playerThemes: {},
  setPlayerTheme: (player: string, club: string) => {},
});

export default function QuizRoom() {
  // Demo state (replace with actual player/room data later)
  const [players] = useState([
    { id: 'host', name: 'المقدم' },
    { id: 'playerA', name: 'لاعب أ' },
    { id: 'playerB', name: 'لاعب ب' }
  ]);
  const [playerThemes, setPlayerThemes] = useState({});
  const [showThemePicker, setShowThemePicker] = useState(true);

  // Sample quiz/segment state (replace with real logic)
  const [segment, setSegment] = useState({ name: 'وش تعرف', code: 'WSHA', question: 1, total: 10 });
  const [scores, setScores] = useState({ playerA: 0, playerB: 0 });
  const [strikes, setStrikes] = useState({ playerA: 0, playerB: 0 });

  // Choose club for player (simulate per-join, later sync with backend)
  const handlePickTheme = (playerId, club) => {
    setPlayerThemes((prev) => ({ ...prev, [playerId]: club }));
    // Once all picked, hide picker
    if (Object.keys({ ...playerThemes, [playerId]: club }).length === players.length) {
      setShowThemePicker(false);
    }
  };

  // Placeholder for Daily.co video (integrate real video when ready)
  const CameraFrame = ({ user }) => (
    <div className="relative flex flex-col items-center p-2">
      {/* Show club logo and name if picked */}
      {playerThemes[user] && (
        <img src={CLUB_THEMES[playerThemes[user]].logo} alt={playerThemes[user]} className="h-12 mb-2" />
      )}
      <div className={`rounded-2xl shadow-md bg-gray-200 dark:bg-gray-700 w-full aspect-video flex items-center justify-center ${playerThemes[user] ? CLUB_THEMES[playerThemes[user]].primary : ''}`}>
        {/* TODO: Replace with Daily.co video stream */}
        <span className="text-2xl">{players.find(p => p.id === user)?.name}</span>
      </div>
    </div>
  );

  // Segment banner (Arabic, animated)
  const SegmentBanner = () => (
    <motion.div
      className="mx-auto my-4 text-center py-3 px-6 rounded-2xl shadow-lg bg-gradient-to-r from-red-100 to-yellow-100 dark:from-neutral-800 dark:to-neutral-700"
      initial={{ opacity: 0, y: -32 }} animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-bold tracking-wider">
        {segment.name} <span className="text-sm">({segment.code})</span>
      </h2>
      <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        سؤال {segment.question} / {segment.total}
      </div>
    </motion.div>
  );

  // Scoreboard (club themes, strikes)
  const Scoreboard = () => (
    <div className="grid grid-cols-3 gap-4 text-center mt-2 mb-4">
      {players.map((p, i) => (
        <div key={p.id} className={`rounded-xl p-2 ${playerThemes[p.id] ? CLUB_THEMES[playerThemes[p.id]].primary : 'bg-gray-100'} shadow-md`}>
          <div className="font-bold text-lg">{p.name}</div>
          <div className="mt-1 text-md">
            {scores[p.id] ?? 0} <span className="text-xs text-gray-500">نقاط</span>
          </div>
          {p.id !== 'host' && (
            <div className="mt-1">
              {Array(strikes[p.id] ?? 0).fill(0).map((_, idx) =>
                <span key={idx} className="text-red-600 text-xl mx-0.5">✗</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Question/Answer area (placeholder)
  const QuestionPanel = () => (
    <motion.div className="rounded-xl p-6 shadow-lg bg-white dark:bg-neutral-800 text-center my-4">
      <div className="text-lg font-bold mb-2">هنا يظهر السؤال بالعربية</div>
      {/* TODO: Render answers/inputs based on segment */}
      <div className="flex gap-2 justify-center mt-4">
        <span className="bg-green-100 text-green-800 rounded px-3 py-1">إجابة 1</span>
        <span className="bg-blue-100 text-blue-800 rounded px-3 py-1">إجابة 2</span>
      </div>
    </motion.div>
  );

  // Host-only controls (advance, reveal, bell)
  const HostControls = () => (
    <div className="mt-4 flex gap-4 justify-center">
      <button className="rounded-xl bg-blue-600 text-white px-6 py-2 shadow hover:bg-blue-700 transition">التالي</button>
      <button className="rounded-xl bg-yellow-400 text-black px-6 py-2 shadow hover:bg-yellow-500 transition">إظهار الإجابة</button>
      <button className="rounded-xl bg-red-500 text-white px-6 py-2 shadow hover:bg-red-600 transition">الجرس</button>
    </div>
  );

  // Theme picker modal/dialog (per player, on join)
  const ThemePicker = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 min-w-[300px]">
        <h3 className="font-bold text-xl text-center mb-2">اختر فريقك</h3>
        {players.map(p => (
          <div key={p.id} className="flex gap-2 items-center justify-between">
            <span>{p.name}</span>
            <div className="flex gap-2">
              <button
                className={`rounded-full w-12 h-12 border-4 ${playerThemes[p.id]==='liverpool' ? 'border-black' : 'border-transparent'}`}
                style={{ background: '#c8102e' }}
                onClick={() => handlePickTheme(p.id, 'liverpool')}
              >
                <img src={CLUB_THEMES.liverpool.logo} alt="Liverpool" className="w-8 mx-auto" />
              </button>
              <button
                className={`rounded-full w-12 h-12 border-4 ${playerThemes[p.id]==='madrid' ? 'border-black' : 'border-transparent'}`}
                style={{ background: '#fff', borderColor: '#febd2f' }}
                onClick={() => handlePickTheme(p.id, 'madrid')}
              >
                <img src={CLUB_THEMES.madrid.logo} alt="Madrid" className="w-8 mx-auto" />
              </button>
            </div>
          </div>
        ))}
        <button
          className="rounded-xl bg-neutral-700 text-white px-4 py-2 mt-4"
          onClick={() => setShowThemePicker(false)}
        >متابعة</button>
      </div>
    </div>
  );

  // ---- Main Page Layout ----
  return (
    <ThemeContext.Provider value={{ playerThemes, setPlayerTheme: handlePickTheme }}>
      <main dir="rtl" className="relative min-h-screen bg-gray-50 dark:bg-neutral-900 px-2 md:px-8">
        <SegmentBanner />
        <section className="grid md:grid-cols-3 gap-4 mt-2">
          <CameraFrame user="host" />
          <CameraFrame user="playerA" />
          <CameraFrame user="playerB" />
        </section>
        <Scoreboard />
        <QuestionPanel />
        <HostControls />
        {showThemePicker && <ThemePicker />}
      </main>
    </ThemeContext.Provider>
  );
}

// --- Liverpool & Real Madrid color mapping: src/themes/clubs.ts ---
export const CLUB_THEMES = {
  liverpool: {
    primary: 'bg-[#c8102e]',
    accent: 'bg-[#00b2a9]',
    text: 'text-white',
    logo: '/assets/liverpool.png',
  },
  madrid: {
    primary: 'bg-[#ffffff]',
    accent: 'bg-[#febd2f]',
    text: 'text-black',
    logo: '/assets/realmadrid.png',
  }
};
