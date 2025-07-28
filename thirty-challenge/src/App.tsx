import { Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import ConnectionBanner from './components/ConnectionBanner';

// Only import the minimal set of pages needed for this test branch.
import Landing from './pages/Landing';
import Join from './pages/Join';
import TestAPI from './pages/TestAPI';
import NotFound from './pages/NotFound';

/**
 * Root application component.  The `Test_arena` branch aims to focus on
 * API and state management logic without the distraction of full game
 * flows.  To that end, the router exposes only the home page, join
 * page, a `/test-api` page for backend testing, and a catch‑all 404.
 */
export default function App() {
  return (
    <GameProvider>
      <div className="dark min-h-screen bg-gradient-to-tr from-black via-[#10102a] to-accent2">
        <ConnectionBanner />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/join" element={<Join />} />
          <Route path="/test-api" element={<TestAPI />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </GameProvider>
  );
}