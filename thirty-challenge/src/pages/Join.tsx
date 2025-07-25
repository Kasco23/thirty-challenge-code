import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Join() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [flagInput, setFlagInput] = useState("");
  const [clubInput, setClubInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !flagInput || !clubInput) return;

    const normalizedFlag = flagInput.trim().toLowerCase();
    const normalizedClub = clubInput.trim().toLowerCase().replace(/\s+/g, "-");

    navigate(`/room?name=${name}&flag=${normalizedFlag}&club=${normalizedClub}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          className="border px-4 py-2"
        />

        <input
          type="text"
          value={flagInput}
          onChange={e => setFlagInput(e.target.value)}
          placeholder="Enter Flag Code (e.g., jo, fr, sa)"
          className="border px-4 py-2"
        />

        <input
          type="text"
          value={clubInput}
          onChange={e => setClubInput(e.target.value)}
          placeholder="Enter Club Name (e.g., Real Madrid, Paris Saint Germain)"
          className="border px-4 py-2"
        />

        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Start
        </button>
      </form>
    </div>
  );
}
