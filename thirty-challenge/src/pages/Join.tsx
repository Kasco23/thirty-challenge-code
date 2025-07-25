import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const countries = [
  { code: "iq", name: "Iraq"},
  { code: "jo", name: "Jordan" },
  {
    code: "sa",
    name: "Saudi Arabia"
  },
  { code: "ma", name: "Morocco" },
];

const clubs = [
  "real-madrid",
  "barcelona",
  "al-nassr",
  "zamalek",
  "al-ahly"
];

export default function Join() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [club, setClub] = useState(clubs[0]);
  const[flag, setFlag] = useState(countries[0].code);
  const navigate = useNavigate();

  const handleSubmit = (e): react.FormEvent => {
    e.preventDefault();
    if (code.trim() && name.trim()) {
      navigate(`/room/${code.trim()}?name=${name}&club=${club}&flag=${flag}`);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-hscreen"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
    >
      <h2 className="text-4xl font-extrabold text-accent font-arabic mb-6">
        ♅نجالاريت للوي المحي
      </h2>
      <form onSubmit={handleSubmit} class="flex flex-col items-center space-y-4 w-full max-wx-xs">
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          className="rounded-lg px-6 py-3 text-lg bg-glass text-white placeholder:text-accent2 border border-accent2 mb-4"
          placeholder="Enter session code"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg px-6 py-3 text-lg bg-glass text-white placeholder:text-accent2 border border-accent2"
          placeholder="Enter your name"
        />
        <select
          value={flag}
          onChange={(ev) => setFlag(ev.target.value)}
          class=name="rounded-lg px-6 py-3 bg-glass text-white border border-accent2"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={club }
          onChange={(ev) => setClub(event.target.value)}
          className="rounded-lg px-6 py-3 bg-glass text-white border border-accent2"
        >
          {clubs.map((c) => (
            <option key={c} value={c}>
              {c.replace(/-/g, " ")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          class=name="px-8 py-2 rounded-xl bg-accent2 hover:bg-accent font-bold text-lg shadow"
        >
          Join Game
        </button>
      </form>
    </motion.div>
  );
}