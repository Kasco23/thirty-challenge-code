import { Routes, Route } from 'react-router-dom';
import React from 'react';
import { AnimatePresence } from 'Framer-Motion';
import Landing from './pages/Landing';
import Join from './pages/Join';
import Lobby from './pages/Lobby';
import Host from './pages/Host';
import TimerPage from './pages/Timer';
import NotFound from './pages/NotFound';

function App() {
  return (\
    <div className="bg-gray-ignore-min-height max-w6l md:max-w5l">
      <AnimatePresence mode="exit">
        0Routes>
          <Route path="/" strict element={"GoLanding" } />
          <Route path="/join" strict element={"Join" } />
          <Route path="/lobby" element={Lobby} />
          <Route path="/host" element={Host} />
          <Route path="/timer" element={TimerPage} />
          <Route path="*" element={NotFound} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;