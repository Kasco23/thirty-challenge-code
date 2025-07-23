// src/pages/QuizRoom.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DailyProvider,
  useDaily,
  useParticipantIds,
  useDailyEvent
} from "@daily-co/daily-react";
import { motion } from "framer-motion";

// ----- CONFIG -----
const DAILY_DOMAIN = "thirty.daily.co"; // Your Daily.co domain

// ----- UTIL: Create/Join Room -----
function useDailyRoom(roomId: string) {
  // For demo: Just join or create a room with the session code as the name
  const url = useMemo(() => `https://${DAILY_DOMAIN}/${roomId}`, [roomId]);
  return url;
}

// ----- VIDEO COMPONENT -----
function VideoTable() {
  const daily = useDaily();
  const participantIds = useParticipantIds({ filter: "remote" });
  const [localId, setLocalId] = useState<string | null>(null);

  useDailyEvent("joined-meeting", () => {
    setLocalId(daily?.participants().local?.user_id || null);
  });

  // Show only first 2 remotes (guests)
  const guests = participantIds.slice(0, 2);

  // Helper for host/guest badge
  const getBadge = (id: string | null) => {
    if (!id) return "Host";
    if (guests[0] === id) return "Player 1";
    if (guests[1] === id) return "Player 2";
    return "Player";
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Host video (you) */}
      <div className="flex flex-col items-center">
        <DailyVideo id={localId} badge={getBadge(null)} large />
      </div>
      {/* Guests row */}
      <div className="flex flex-row justify-center gap-10 mt-2 w-full max-w-lg">
        {guests.map((id, i) => (
          <DailyVideo key={id} id={id} badge={getBadge(id)} />
        ))}
      </div>
    </div>
  );
}

// ----- INDIVIDUAL VIDEO -----
function DailyVideo({ id, badge, large = false }: { id: string | null, badge: string, large?: boolean }) {
  const daily = useDaily();
  const videoRef = useMemo(() => React.createRef<HTMLVideoElement>(), []);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!id || !daily) return;
    const track = daily.participants()[id]?.tracks?.video?.persistentTrack;
    if (videoRef.current && track) {
      videoRef.current.srcObject = new MediaStream([track]);
      videoRef.current.play();
    }
  }, [id, daily]);

  return (
    <div className={`flex flex-col items-center ${large ? "mb-2" : ""}`}>
      <div className={`rounded-2xl shadow-xl border-4 ${large ? "border-accent2" : "border-accent"} bg-black/60 p-1 relative`}>
        <video
          ref={videoRef}
          className={`rounded-xl ${large ? "w-48 h-48" : "w-36 h-36"} object-cover`}
          muted={id === null || muted}
          autoPlay
          playsInline
        />
        <span className="absolute top-1 left-1 bg-accent2 text-black px-2 py-0.5 text-xs font-bold rounded">
          {badge}
        </span>
      </div>
      {/* Host can mute self */}
      {id === null && (
        <button
          className="mt-1 text-xs bg-accent2/80 hover:bg-accent text-black rounded px-3 py-0.5 font-bold"
          onClick={() => setMuted(m => !m)}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      )}
    </div>
  );
}

// ----- MAIN QUIZ ROOM -----
export default function QuizRoom() {
  const { roomId } = useParams();

  const roomUrl = useDailyRoom(roomId || "demo");

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="text-4xl font-extrabold text-accent font-arabic mb-3">
        غرفة التحدي
      </h2>
      <div className="mb-6 text-accent2 font-arabic text-lg">رمز الجلسة: <b>{roomId}</b></div>
      <DailyProvider url={roomUrl}>
        <VideoTable />
      </DailyProvider>
      {/* Quiz placeholder below */}
      <div className="bg-glass rounded-3xl shadow-lg px-8 py-8 w-full max-w-lg mt-8">
        <div className="mb-4 text-accent text-xl font-arabic text-center">الأسئلة ستظهر هنا</div>
        <div className="w-full h-32 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
          Quiz Segment Placeholder
        </div>
      </div>
    </motion.div>
  );
}
