import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Join() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [flagInput, setFlagInput] = useState('');
  const [flagList, setFlagList] = useState<string[]>([]);
  const [selectedFlag, setSelectedFlag] = useState('');
  const [clubInput, setClubInput] = useState('');
  const [clubList, setClubList] = useState<string[]>([]);
  const [selectedClub, setSelectedClub] = useState('');

  useEffect(() => {
    const logos = import.meta.glob('/src/assets/logos/*.svg', { eager: true });
    const clubNames = Object.keys(logos).map((path) =>
      path.split('/').pop()?.replace('.svg', '') || ''
    );
    setClubList(clubNames);

    const flagCSS = Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules || []);
        } catch {
          return [];
        }
      })
      .filter(
        (rule): rule is CSSStyleRule =>
          typeof (rule as CSSStyleRule).selectorText === 'string' &&
          (rule as CSSStyleRule).selectorText.startsWith('.fi-')
      )
      .map((rule) => (rule as CSSStyleRule).selectorText.replace('.fi-', ''));

    setFlagList(flagCSS);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedFlag || !selectedClub) return;

    navigate(
      `/room?name=${name}&flag=${selectedFlag.toLowerCase()}&club=${selectedClub}`
    );
  };

  const filteredClubs = clubList.filter((club) =>
    club.toLowerCase().includes(clubInput.toLowerCase().replace(/\s+/g, '-'))
  );

  const filteredFlags = flagList.filter((flag) =>
    flag.toLowerCase().includes(flagInput.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="border px-4 py-2"
        />

        <input
          type="text"
          value={flagInput}
          onChange={(e) => setFlagInput(e.target.value)}
          placeholder="Search Flag Code (e.g., jo, fr, sa)"
          className="border px-4 py-2"
        />

        {filteredFlags.length > 0 && (
          <ul className="border w-full max-h-40 overflow-y-scroll bg-white">
            {filteredFlags.map((flag) => (
              <li
                key={flag}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => setSelectedFlag(flag)}
              >
                {flag.toUpperCase()}
              </li>
            ))}
          </ul>
        )}

        <input
          type="text"
          value={clubInput}
          onChange={(e) => setClubInput(e.target.value)}
          placeholder="Search Club Name"
          className="border px-4 py-2"
        />

        {filteredClubs.length > 0 && (
          <ul className="border w-full max-h-40 overflow-y-scroll bg-white">
            {filteredClubs.map((club) => (
              <li
                key={club}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => setSelectedClub(club)}
              >
                {club.replace(/-/g, ' ')}
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start
        </button>
      </form>
    </div>
  );
}