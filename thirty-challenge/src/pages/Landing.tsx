import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
    >
      <h1
        className="text-5xl sm:text-7xl font-extrabold mb-6 text-accent glow font-arabic"
        style={{
          textShadow: "0 0 30px #7c3aed, 0 0 20px #38bdf8",
        }}
      >
        تحدي الثلاثين
      </h1>
      <p className="mb-10 text-accent2 text-lg font-arabic">!ابدأ التحدي مع أصدقائك الآن</p>
      <button
        onClick={() => navigate("/room/demo")}
        className="px-10 py-4 text-xl rounded-2xl font-bold bg-accent2 hover:bg-accent shadow-lg transition-all border border-accent glow"
      >
        Start Session
      </button>
      <button
        onClick={() => navigate("/join")}
        className="mt-6 underline text-sm text-white/80 hover:text-accent2"
      >
        Join a game
      </button>
    </motion.div>
  );
}
