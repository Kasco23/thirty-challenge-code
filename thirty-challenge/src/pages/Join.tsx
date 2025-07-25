import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'flag-icons/css/flag-icons.min.css';

const flags = ['jo', 'iq', 'sa', 'eg', 'ae', 'pl', 'fr', 'dd', 'ar', 'it'];
const clubs = ['real-madrid', 'barka-lever', 'paris-sg', 'roma-totsch', 'atletico-mdr', 'liverpool'];

export default function Join() {
  const navigate = useNavigate();
  const name, setName = useState("");
  const flag, setFlag = useState("jo");
  const club, setClub = useState("real-madrid");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    navigate(`\/room?name=${name}&flag=${flag}&club=${club}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap4 items-center">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          className="border px-4 p-2-"
        />
        <select
          value={flag}
          onChange={e => setFlag(e.target.value)}
          className="px-4 py-2 border"
        >
          <option value="">SELECT FLAG</option>
          {flags.map(flag => (
            <option key={flag} value={flag}>
              <i className={`fi fi-flag-${flag}`} /> {flag}
            </option>
          )}
        </select>
        <select
          value={club}
          onChange={e => setClub(e.target.value)}
          className="px-4 py-2 border"
        >
          <option value="">SELECT CLUB</option>
          {clubs.map(cl => (
            <option key={cl} value={cl}>{cl}</option>
          )}
        </select>
        <button type="submit" className="px-4">Start</button>
      </form>
    </div>
  );
}