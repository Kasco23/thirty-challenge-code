import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Join() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
    >
      <h2 className="text-4xl font-extrabold text-accent font-arabic mb-6">انضم إلى التحدي</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (code.trim()) navigate(`/room/${code.trim()}`);
        }}
        className="flex flex-col items-center"
      >
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          className="rounded-lg px-6 py-3 text-lg bg-glass text-white placeholder:text-accent2 border border-accent2 mb-6 focus:outline-accent2 focus:ring"
          placeholder="Enter session code"
        />
        <button
          type="submit"
          className="px-8 py-2 rounded-xl bg-accent2 hover:bg-accent font-bold text-lg shadow"
        >
          Join Game
        </button>
      </form>
    </motion.div>
  );
}
