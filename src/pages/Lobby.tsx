// src/pages/Lobby.tsx
import React from "react";
import VideoRoom from "../components/VideoRoom";

const Lobby: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center min-h-screen p-4 bg-gradient-to-br from-neutral-800 to-neutral-900">
      <div className="w-full md:w-1/2">
        <VideoRoom />
      </div>
      <div className="w-full md:w-1/3 flex flex-col gap-4 text-white">
        <h2 className="text-3xl font-bold mb-2">غرفة الانتظار</h2>
        <div className="rounded-xl bg-neutral-700 p-4 shadow-xl">
          {/* Players list, host controls, or game status here */}
          <div>انتظر دخول جميع اللاعبين للبدء...</div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
