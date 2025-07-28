import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GameProvider } from "./context/GameContext";
import Landing from "./pages/Landing";
import Join from "./pages/Join";
import HostSetup from "./pages/HostSetup";
import QuizRoom from "./pages/QuizRoom";
import Lobby from "./pages/Lobby";
import TrueLobby from "./pages/TrueLobby";
import Room from "./pages/Room";
import SegmentIntro from "./pages/SegmentIntro";
import HostPanel from "./pages/HostPanel";
import FinalScores from "./pages/FinalScores";
import Scoreboard from "./pages/Scoreboard";
import JudgePanel from "./pages/JudgePanel";
import HostQuestion from "./pages/HostQuestion";
import Timer from "./components/Timer";
import Buzzer from "./components/Buzzer";
import Admin from "./pages/Admin";
import Reconnect from "./pages/Reconnect";
import DebugStatus from "./pages/DebugStatus";
import ConnectionBanner from "./components/ConnectionBanner";
import NotFound from "./pages/NotFound";
import WSHA from "./pages/segments/WSHA";
import AUCT from "./pages/segments/AUCT";
import BELL from "./pages/segments/BELL";
import SING from "./pages/segments/SING";
import REMO from "./pages/segments/REMO";

function App() {
  const location = useLocation();
  return (
    <GameProvider>
      <div className="dark min-h-screen bg-gradient-to-tr from-black via-[#10102a] to-accent2">
        <ConnectionBanner />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/join" element={<Join />} />
            <Route path="/host-setup/:gameId" element={<HostSetup />} />

            {/* New proper routing structure */}
            <Route path="/lobby/:gameId" element={<TrueLobby />} />
            <Route path="/game/:gameId" element={<QuizRoom />} />

            {/* Legacy routes for backward compatibility */}
            <Route path="/room/:roomId" element={<QuizRoom />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/room" element={<Room />} />

            {/* Game flow routes */}
            <Route path="/segment" element={<SegmentIntro />} />
            <Route path="/host" element={<HostPanel />} />
            <Route path="/final" element={<FinalScores />} />
            <Route path="/scoreboard" element={<Scoreboard />} />
            <Route path="/judge" element={<JudgePanel />} />
            <Route path="/hostquestion" element={<HostQuestion />} />

            {/* Component routes */}
            <Route path="/timer" element={<Timer />} />
            <Route path="/buzzer" element={<Buzzer />} />

            {/* Admin and utility routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/reconnect" element={<Reconnect />} />
            <Route path="/debug" element={<DebugStatus />} />

            {/* Segment routes */}
            <Route path="/wsha" element={<WSHA />} />
            <Route path="/auct" element={<AUCT />} />
            <Route path="/bell" element={<BELL />} />
            <Route path="/sing" element={<SING />} />
            <Route path="/remo" element={<REMO />} />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
    </GameProvider>
  );
}

export default App;
