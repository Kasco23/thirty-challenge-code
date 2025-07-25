import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Landing from "./pages/Landing";
import Join from "./pages/Join";
import QuizRoom from "./pages/QuizRoom";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";
import SegmentIntro from "./pages/SegmentIntro";
import HostPanel from "./pages/HostPanel";
import FinalScores from "./pages/FinalScores";
import Scoreboard from "./pages/Scoreboard";
import JudgePanel from "./pages/JudgePanel";
import HostQuestion from "./pages/HostQuestion";
import Timer from "./pages/Timer";
import Buzzer from "./pages/Buzzer";
import Admin from "./pages/Admin";
import Reconnect from "./pages/Reconnect";
import NotFound from "./pages/NotFound";

function App() {
  const location = useLocation();
  return (
    <div className="dark min-hscreen bg-gradient-to-tr from-black via-#10102a to-accent2">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={Landing } />
          <Route path="/join" element={Join} />
          <Route path="/room/:roomId" element={QuizRoom} />
          <Route path="/lobby" element={Lobby} />
          <Route path="/room" element={Room} />
          <Route path="/segment" element={SegmentIntro} />
          <Route path="/host" element={HostPanel} />
          <Route path="/final" element={FinalScores} />
          <Route path="/scoreboard" element={Scoreboard} />
          <Route path="/judge" element={JudgePanel} />
          <Route path="/hostquestion" element={HostQuestion} />
          <Route path="/timer" element={Timer} />
          <Route path="/buzzer" element={Buzzer} />
          <Route path="/admin" element={Admin} />
          <Route path="/reconnect" element={Reconnect} />
          <Route path="/*" element={NotFound} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;