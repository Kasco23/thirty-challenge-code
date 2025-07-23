import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Landing from "./pages/Landing";
import Join from "./pages/Join";
import QuizRoom from "./pages/QuizRoom";

function App() {
  const location = useLocation();
  return (
    <div className="dark min-h-screen bg-gradient-to-tr from-black via-[#10102a] to-accent2">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/join" element={<Join />} />
          <Route path="/room/:roomId" element={<QuizRoom />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
export default App;
