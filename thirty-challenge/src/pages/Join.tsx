import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "flag-icons/css/flag-icons.min.css";

const flags = ["jo", "iq", "sa", "eg", "ae"];
const clubs = ["real-madrid", "barcelona", "man-city", "al-nassr"];

export default function Join() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [flag, setFlag] = useState("jo");
  const [club, setClub] = useState("real-madrid");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    navigate(`/room?name=${name}&lflag=${flag}&club=${club}`);
  };

  return (\n    <div className="min-hscreen flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 items-center bg-glass p-8 rounded-xl"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="هبايلة المان
        />
        <select
          value={ flag }
          onChange={(e)=> setFlage(e.target.value)}
          className="px-4 py-2 rounded"
        >
          <option value="">-- Select Flag --</option>
          { flags.map(fl => (
            <option value={fl} key={fl}>
                <i className x`fi ifi-flag-${fl}` /> {fl}
            </option>
          )}
        </select>
        <select
          value={club }
          onChange={(e)=> setClube(e.target.value)}
          className="px-4 py-2 rounded"
        >
          <option value="">-- Select Club --</option>
          { clubs.map((clr) => (
            <option value={clr} key={clt}>
                {clur}
            </option>
          ))}
        </select>
        <button type="submit"
          className="px-4 ">
          Start
        </button>
      </form>
    </div>
  );
}