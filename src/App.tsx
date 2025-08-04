import { Routes, Route } from 'react-router-dom';
import { Provider as JotaiProvider } from 'jotai';
import { lazy, Suspense } from 'react';
import ConnectionBanner from '@/components/ConnectionBanner';
import LanguageToggle from '@/components/LanguageToggle';

// Lazy load page components to reduce initial bundle size
const Landing = lazy(() => import('@/pages/Landing'));
const CreateSession = lazy(() => import('@/pages/CreateSession'));
const Join = lazy(() => import('@/pages/Join'));
const Lobby = lazy(() => import('@/pages/Lobby'));

const QuizRoom = lazy(() => import('@/pages/QuizRoom'));
const ControlRoom = lazy(() => import('@/pages/ControlRoom'));
const FinalScores = lazy(() => import('@/pages/FinalScores'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Alpha Quiz components
const AlphaEntry = lazy(() => import('@/alphaquiz/pages/AlphaEntry'));
const AlphaHost = lazy(() => import('@/alphaquiz/pages/AlphaHost'));
const AlphaPlayer = lazy(() => import('@/alphaquiz/pages/AlphaPlayer'));

// Loading component for suspense fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-black via-[#10102a] to-accent2 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-white/70">Loading...</div>
      </div>
    </div>
  );
}

/**
 * Root application component with lazy-loaded routes for optimal bundle splitting.
 * This ensures fast initial page load while keeping individual page chunks small.
 */
export default function App() {
  return (
    <JotaiProvider>
      <div className="dark min-h-screen bg-gradient-to-tr from-black via-[#10102a] to-accent2">
        <ConnectionBanner />
        <LanguageToggle />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create-session" element={<CreateSession />} />
            <Route path="/control-room" element={<ControlRoom />} />
            <Route path="/join" element={<Join />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/lobby/:gameId" element={<Lobby />} />
            <Route path="/quiz" element={<QuizRoom />} />
            <Route path="/scores" element={<FinalScores />} />
            {/* Alpha Quiz Routes */}
            <Route path="/alpha-quiz" element={<AlphaEntry />} />
            <Route path="/alpha-quiz/host" element={<AlphaHost />} />
            <Route path="/alpha-quiz/player" element={<AlphaPlayer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </JotaiProvider>
  );
}
